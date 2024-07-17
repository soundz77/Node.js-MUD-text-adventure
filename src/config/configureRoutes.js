import router from "../routes/routes.js";

const routerConfig = (app) => {
  app.use("/", router);
};

export default routerConfig;
