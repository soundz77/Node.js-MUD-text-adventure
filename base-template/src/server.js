// base-template/server.js
import "dotenv/config";
import env from "./utils/validation/validateProcessEnv.js";
import AppError from "./utils/errors/AppError.js";
import logger from "./utils/logging/logger.js";
import serverMessages from "./utils/logging/messages/serverMessages.js";
import asyncMessages from "./utils/logging/messages/asyncMessages.js";
import checkVarsSet from "./utils/validation/checkVarsSet.js";

let server;

const checkRequiredVars = () => {
  const varsSet = checkVarsSet({
    serverMessages,
    asyncMessages
  });

  if (!varsSet) {
    throw new AppError("Required parameters missing. Can't start server", 400);
  }
};

const handleServerError = (err) => {
  logger.error(`${serverMessages.errors.startup} ${err}`);

  if (err.syscall !== "listen") {
    throw new AppError(err, 500);
  }

  const bind =
    typeof env.PORT === "string" ? `Pipe ${env.PORT}` : `Port ${env.PORT}`;

  const errorActions = {
    EACCES: () => {
      logger.error(`${bind} ${serverMessages.errors.privileged}`);
      process.exit(1);
    },
    EADDRINUSE: () => {
      logger.error(`${bind} ${serverMessages.errors.inUse}`);
      process.exit(1);
    }
  };

  if (errorActions[err.code]) {
    errorActions[err.code]();
  } else {
    logger.error(`${serverMessages.errors.startup} ${err}`);
    throw err;
  }
};

const handleUncaughtException = (err) => {
  logger.error(`${asyncMessages.uncaughtException} ${err}`);
  process.exit(1);
};

const handleUnhandledRejection = (err) => {
  logger.error(`${asyncMessages.unhandledRejection} ${err}`);
  process.exit(1);
};

const setupProcessHandlers = () => {
  process.on("uncaughtException", handleUncaughtException);
  process.on("unhandledRejection", handleUnhandledRejection);
};

const setupServer = async (app) => {
  // Check required variables before starting the server
  checkRequiredVars();
  setupProcessHandlers();

  // Start the server
  server = await new Promise((resolve, reject) => {
    const s = app
      .listen(env.PORT, () => {
        logger.info(serverMessages.success.startup);
        resolve(s);
      })
      .on("error", reject);
  });

  // Handle server errors
  server.on("error", handleServerError);
};

export default setupServer;
export { server };
