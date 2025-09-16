import setupApp from "../base-template/src/app.js";
// import setupServer from "../base-template/src/server.js";
import http from "http";
import socketConfig from "./config/socketConfig.js";
import configureAppMiddleware from "./config/configureAppMiddleware.js";
import configureRoutes from "./config/configureRoutes.js";
import globalErrorHandler from "../base-template/src/utils/errors/globalErrorHandler.js";
import { startGame } from "./game/startGame.js";

const main = async () => {
  const app = setupApp(); // Initialise the base-template app
  configureAppMiddleware(app);
  configureRoutes(app);
  const server = http.createServer(app);
  const game = startGame();
  const io = socketConfig(server, { game });

  await new Promise((res) => server.listen(3000, res));

  app.use(globalErrorHandler);

  const shutdown = () => {
    io.close(() => console.log("Socket server closed"));
    server.close(() => process.exit(0));
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};

main();
