import EventEmitter from "events";
import mongoose, { Connection } from "mongoose";
import config from ".";
import {
  ConnectionMetadata,
  ConnectionStats,
  DBConfig,
  HealthCheck,
  TenancyType,
} from "../interface/db";
import AppError from "../errors/AppError";
import status from "http-status";

class DBManager extends EventEmitter {
  private centralConnection: Connection | null = null;
  private singleConnection: Connection | null = null;
  private tenantConnections: Map<string, Connection> = new Map();
  private connectionMetadata: Map<string, ConnectionMetadata> = new Map();

  private tenancyType: TenancyType;
  private isProduction: boolean;
  private config: DBConfig;

  private cleanupTimer: ReturnType<typeof setInterval> | null = null;
  private isShuttingDown: boolean = false;

  constructor() {
    super();

    this.tenancyType = (config.db.tenancy_type as TenancyType) || "single";
    this.isProduction = config.node_env === "production";

    this.config = {
      maxIdleTime: config.poolConfig.maxConnectionIdleTime,
      maxConnections: config.poolConfig.maxTenantConnections,
      cleanupInterval: config.poolConfig.cleanupInterval,
      connectionTimeout: config.poolConfig.connectionTimeout,
      poolSize: config.poolConfig.poolSize,
    };
  }

  // :::) get software db urls
  private getDbUris() {
    return this.isProduction
      ? {
          central: config.db.centralProductionUri!,
          single: config.db.singleProductionUri!,
          tenantBase: config.db.multiProductionUri!,
        }
      : {
          central: config.db.centralUri!,
          single: config.db.singleUri!,
          tenantBase: config.db.multiUri!,
        };
  }

  // :::) set pool size and connections
  private getConnectionOptions(poolSize: { min: number; max: number }) {
    return {
      maxPoolSize: poolSize.max,
      minPoolSize: poolSize.min,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: this.config.connectionTimeout,
      heartbeatFrequencyMS: 10000,
      retryWrites: true,
      retryReads: true,
      maxIdleTimeMS: this.config.maxIdleTime,
    };
  }

  // :::) db connections from here
  async initialize() {
    if (this.tenancyType === "multi") {
      await this.initCentralConnection();
    } else {
      await this.getSingleConnection();
    }

    this.startCleanupJob();
  }

  private async initCentralConnection() {
    if (this.centralConnection?.readyState === 1) return this.centralConnection;

    const uris = this.getDbUris();
    const options = this.getConnectionOptions(this.config.poolSize.central);
    console.log("Connecting to Central DB...");

    this.centralConnection = await mongoose
      .createConnection(uris.central, options)
      .asPromise();

    this.setupConnectionHandlers(this.centralConnection, "CENTRAL_DB");
    console.log("Central DB connected.....");

    this.emit("centralConnected");

    return this.centralConnection;
  }

  private async getSingleConnection(): Promise<Connection> {
    if (this.singleConnection?.readyState === 1) return this.singleConnection;

    const uris = this.getDbUris();
    const options = this.getConnectionOptions(this.config.poolSize.single);

    console.log("🔄 Connecting to Single Tenant DB...");
    this.singleConnection = await mongoose
      .createConnection(uris.single, options)
      .asPromise();

    this.setupConnectionHandlers(this.singleConnection, "SINGLE_DB");
    console.log("✅ Single DB connected");
    this.emit("singleConnected");

    return this.singleConnection;
  }

  // :::) for every method call this method for connection
  async getConnection(tenantId?: string): Promise<Connection> {
    if (this.isShuttingDown)
      throw new AppError(status.INTERNAL_SERVER_ERROR, "System shutting down");

    if (this.tenancyType === "single") return this.getSingleConnection();

    if (!tenantId)
      throw new AppError(
        status.UNPROCESSABLE_ENTITY,
        "tenantId required in multi-tenant mode",
      );

    return this.getTenantConnection(tenantId);
  }

  getCentralConnection(): Connection | null {
    return this.centralConnection?.readyState === 1
      ? this.centralConnection
      : null;
  }

  // :::) tanent connection managment
  private async getTenantConnection(tenantId: string): Promise<Connection> {
    const existing = this.tenantConnections.get(tenantId);

    if (existing) {
      if (existing.readyState === 1) {
        this.updateConnectionMetadata(tenantId);
        return existing;
      }

      await this.removeConnection(tenantId);
    }

    if (this.tenantConnections.size >= this.config.maxConnections) {
      await this.removeOldestIdleConnection();
    }

    return this.createTenantConnection(tenantId);
  }

  private async createTenantConnection(tenantId: string): Promise<Connection> {
    const uris = this.getDbUris();
    const tenantDBName = `tenant_${tenantId}`;

    const baseUri = uris.tenantBase.replace(/\/$/, "").replace(/\?.*$/, "");
    const authParams = uris.tenantBase.match(/\?.*$/)?.[0] ?? "";
    const tenantUri = `${baseUri}/${tenantDBName}${authParams}`;

    const options = {
      ...this.getConnectionOptions(this.config.poolSize.tenant),
      dbName: tenantDBName,
    };

    console.log(`Creating connection: ${tenantId}///`);

    const connection = await mongoose
      .createConnection(tenantUri, options)
      .asPromise();

    if (!connection.db) {
      await connection.close();
      throw new AppError(
        status.INTERNAL_SERVER_ERROR,
        `DB not initialized for tenant: ${tenantId}`,
      );
    }

    //:::) verify correct DB
    if (connection.db.databaseName !== tenantDBName) {
      await connection.close();
      throw new AppError(
        status.INTERNAL_SERVER_ERROR,
        `Wrong DB connected: ${connection.db.databaseName}, expected: ${tenantDBName}`,
      );
    }

    this.setupConnectionHandlers(connection, tenantId);
    this.tenantConnections.set(tenantId, connection);
    this.updateConnectionMetadata(tenantId);

    console.log(
      `✅ Tenant connected: ${tenantId} (total: ${this.tenantConnections.size})`,
    );
    this.emit("tenantConnectionCreated", {
      tenantId,
      total: this.tenantConnections.size,
    });

    return connection;
  }

  // :::) matedata methods are here
  private updateConnectionMetadata(tenantId: string): void {
    const existing = this.connectionMetadata.get(tenantId);
    this.connectionMetadata.set(tenantId, {
      lastAccess: Date.now(),
      accessCount: (existing?.accessCount ?? 0) + 1,
      createdAt: existing?.createdAt ?? Date.now(),
    });
  }

  // :::) cleann up methods are here
  private async removeConnection(tenantId: string): Promise<void> {
    const conn = this.tenantConnections.get(tenantId);
    if (!conn) return;
    try {
      await conn.close();
    } finally {
      this.tenantConnections.delete(tenantId);
      this.connectionMetadata.delete(tenantId);
      console.log(`Removed: ${tenantId} `);
      this.emit("connectionRemoved", { tenantId });
    }
  }

  private async removeOldestIdleConnection(): Promise<void> {
    let oldestId: string | null = null;
    let oldestTime: number = Date.now();

    for (const [id, meta] of this.connectionMetadata) {
      if (meta.lastAccess < oldestTime) {
        oldestTime = meta.lastAccess;
        oldestId = id;
      }
    }

    if (oldestId) await this.removeConnection(oldestId);
  }

  private startCleanupJob(): void {
    if (this.cleanupTimer) return;

    this.cleanupTimer = setInterval(() => {
      if (this.isShuttingDown) return;
      const now = Date.now();

      for (const [tenantId, meta] of this.connectionMetadata) {
        if (now - meta.lastAccess > this.config.maxIdleTime) {
          void this.removeConnection(tenantId);
        }
      }
    }, this.config.cleanupInterval);

    this.emit("cleanupStarted");
  }

  // :::) utilis are here ----------- Connection event handlers
  private setupConnectionHandlers(connection: Connection, id: string) {
    connection.on("error", (err) => {
      console.error(`❌ DB error [${id}]:`, err.message);
      this.emit("connectionError", { id, error: err });
    });

    connection.on("disconnected", () => {
      console.warn(`🔌 Disconnected: ${id}`);

      if (id !== "CENTRAL_DB" && id !== "SINGLE_DB") {
        this.tenantConnections.delete(id);
        this.connectionMetadata.delete(id);
      }
      this.emit("connectionDisconnected", { id });
    });
    connection.on("reconnected", () =>
      this.emit("connectionReconnected", { id }),
    );
  }

  // :::) Monitoring are here
  getStats(): ConnectionStats {
    const tenants = [...this.connectionMetadata.entries()]
      .map(([tenantId, meta]) => ({
        tenantId,
        readyState: this.tenantConnections.get(tenantId)?.readyState,
        lastAccess: new Date(meta.lastAccess),
        accessCount: meta.accessCount,
        idleTime: Date.now() - meta.lastAccess,
        age: Date.now() - meta.createdAt,
      }))
      .sort((a, b) => b.idleTime - a.idleTime);

    return {
      tenancyType: this.tenancyType,
      environment: this.isProduction ? "production" : "development",
      activeConnections: this.tenantConnections.size,
      maxConnections: this.config.maxConnections,
      central: this.centralConnection
        ? {
            readyState: this.centralConnection.readyState,
            name: this.centralConnection.name,
          }
        : null,
      single: this.singleConnection
        ? {
            readyState: this.singleConnection.readyState,
            name: this.singleConnection.name,
          }
        : null,
      tenants,
    };
  }

  async healthCheck(): Promise<HealthCheck> {
    const health: HealthCheck = {
      status: "healthy",
      timestamp: new Date(),
      checks: {},
    };

    const ping = async (conn: Connection | null, key: string) => {
      if (!conn) {
        health.checks[key] = "not_initialized";
        return;
      }
      try {
        await conn.db.admin().ping();
        health.checks[key] = "connected";
      } catch {
        health.checks[key] = "error";
        health.status = "unhealthy";
      }
    };

    if (this.tenancyType === "multi")
      await ping(this.centralConnection, "central");
    if (this.tenancyType === "single")
      await ping(this.singleConnection, "single");

    health.checks["tenantCount"] = this.tenantConnections.size;
    return health;
  }

  // :::) gracefully shut down are here
  async closeAllConnections(): Promise<void> {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;

    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }

    const closing = [...this.tenantConnections.values()].map((c) => c.close());
    await Promise.allSettled(closing);
    this.tenantConnections.clear();
    this.connectionMetadata.clear();

    await this.centralConnection?.close();
    await this.singleConnection?.close();
    this.centralConnection = null;
    this.singleConnection = null;

    console.log("✅ All DB connections closed");
    this.emit("shutdownComplete");
  }
}

export const dbManager = new DBManager();
