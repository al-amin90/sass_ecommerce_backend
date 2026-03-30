import mongoose from "mongoose";
import app from "./app";
import config from "./app/config";

let server: Server;

async function main() {
  // await mongoose.connect(config.database_url as string)

  app.listen(config.port, () => {
    console.log(`Example app listening on port ${config.port}`);
  });
}

main().catch((err) => console.log(err));

process.on("unhandledRejection", () => {
  console.log(`unhandledRejection is detected, shutting down...`);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on("uncaughtException", () => {
  console.log(`unhandledRejection is detected, shutting down...`);
  process.exit(1);
});
