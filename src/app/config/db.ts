import EventEmitter from "events";
import mongoose, { Connection } from "mongoose";
import config from ".";
import { ConnectionMetadata, DBConfig, TenancyType } from "../interface/db";
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

  private cleanupTimer: ReturnType<typeof setInterval> = null;
  private isShuttingDown: boolean;

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

    this.centralConnection = await mongoose.createConnection(
      uris.central,
      options,
    );

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

    if (this.tenantConnections.size > this.config.maxConnections) {
      await this.remo;
    }
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
}
