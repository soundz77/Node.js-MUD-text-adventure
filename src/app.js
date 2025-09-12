// import "dotenv/config";
// import express from "express";

// import http from "http";
// import serverConfig from "./config/serverConfig.js";
// import configureMiddleware from "./config/configureMiddleware.js";
// import configureRoutes from "./config/configureRoutes.js";
// import configureMongoose from "./config/configureMongoose.js";

// const app = express();

import handleAsync from "express-async-handler";
import setupApp from "../base-template/src/app.js";
// import configureMongoose from "./config/configureMongoose.js";
import setupServer from "../base-template/src/server.js";
import { server } from "../base-template/src/server.js";
import { socketConfig } from "./config/socketConfig.js";
import configureAppMiddleware from "./config/configureAppMiddleware.js";
import configureRoutes from "./config/configureRoutes.js";
import globalErrorHandler from "../base-template/src/utils/errors/globalErrorHandler.js";
import { startWorldLoop } from "./game/world/runner.js";

const main = handleAsync(async () => {
  const app = setupApp(); // Initialize the base-template app

  await setupServer(app);
  await socketConfig(server);
  await configureAppMiddleware(app);
  configureRoutes(app);

  app.use(globalErrorHandler);
  startWorldLoop();
});

main();
