import express, { Application } from "express";

import cookieParser from "cookie-parser";
import cors from "cors";
import GlobalErrorHandler from "./app/middlewares/GlobalErrorHandler";
import NotFound from "./app/middlewares/NotFound";
import config from "./app/config";
import router from "./app/routes";

const app: Application = express();

// __) parsers
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: ["localhost:3000"] }));

// __) all application route here
app.use("/api/v1", router);

app.get("/", (req, res) => {
  res.send(`This app listening on port ${config.port}`);
});

app.use(GlobalErrorHandler);
app.use(NotFound);

export default app;
