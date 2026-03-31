import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,

  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  default_password: process.env.DEFAULT_PASSWORD,

  jwt: {
    access_token: process.env.JWT_ACCESS_TOKEN,
    refresh_token: process.env.JWT_REFRESH_TOKEN,
    access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  },
  db: {
    tenancy_type: process.env.TENANCY_TYPE,
    singleUri: process.env.SINGLE_DB_URL,
    multiUri: process.env.MULTI_DB_URL,
    centralUri: process.env.CENTRAL_DB_URL,

    singleProductionUri: process.env.SINGLE_PRODUCTION_DB_URL,
    multiProductionUri: process.env.MULTI_PRODUCTION_DB_URL,
    centralProductionUri: process.env.CENTRAL_PRODUCTION_DB_URL,
  },
  poolConfig: {
    maxTenantConnections: parseInt(process.env.MAX_TENANT_CONNECTIONS ?? "100"),
    maxConnectionIdleTime: parseInt(
      process.env.MAX_CONNECTION_IDLE_TIME ?? "300000",
    ),
    cleanupInterval: parseInt(process.env.CLEANUP_INTERVAL ?? "60000"),
    connectionTimeout: parseInt(process.env.CONNECTION_TIMEOUT ?? "10000"),
    poolSize: {
      central: { min: 2, max: 10 },
      single: { min: 10, max: 50 },
      tenant: { min: 2, max: 10 },
    },
  },
};
