import express, { Application } from "express";

import cookieParser from "cookie-parser";
import cors from "cors";
import GlobalErrorHandler from "./app/middlewares/GlobalErrorHandler";
import NotFound from "./app/middlewares/NotFound";
import config from "./app/config";
import router from "./app/routes";
import { extractPublicId } from "./app/utils/extractPublicId";
import { deleteFromCloudinary } from "./app/utils/cloudinary";

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

console.log(
  extractPublicId(
    "https://res.cloudinary.com/dd3njhjrh/image/upload/v1776008669/products/1776008664599-796384094_ccdxjo.png",
  ),
);

app.use(GlobalErrorHandler);
app.use(NotFound);

export default app;
