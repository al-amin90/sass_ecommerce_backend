export type TenancyType = "single" | "multi";

export interface DBConfig {
  maxIdleTime: number;
  maxConnections: number;
  cleanupInterval: number;
  connectionTimeout: number;
  poolSize: {
    central: PoolSize;
    single: PoolSize;
    tenant: PoolSize;
  };
}

export interface PoolSize {
  min: number;
  max: number;
}

export interface DbUris {
  central?: string;
  single?: string;
  tenantBase?: string;
}

export interface ConnectionMetadata {
  lastAccess: number;
  accessCount: number;
  createdAt: number;
}

export interface ConnectionStats {
  tenancyType: TenancyType;
  environment: string;
  activeConnections: number;
  maxConnections: number;
  central: { readyState: number; name: string } | null;
  single: { readyState: number; name: string } | null;
  tenants: TenantStat[];
}

export interface TenantStat {
  tenantId: string;
  readyState: number | undefined;
  lastAccess: Date;
  accessCount: number;
  idleTime: number;
  age: number;
}

export interface HealthCheck {
  status: "healthy" | "unhealthy";
  timestamp: Date;
  checks: Record<string, unknown>;
}
