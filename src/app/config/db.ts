import EventEmitter from "events";
import { Connection } from "mongoose";
import config from ".";
import { ConnectionMetadata, DBConfig, TenancyType } from "../interface/db";

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
}
