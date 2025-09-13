import sessionConfig from "../middleware/sessionConfig.js";
import session from "express-session";

const appMiddleware = (app) => {
  app.use(session(sessionConfig));

  app.set("view engine", "ejs");

  return app;
};

export default appMiddleware;
