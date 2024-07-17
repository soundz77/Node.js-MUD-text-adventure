import express from "express";
import index from "../controllers/gameControllers/index.js";
import displayPage from "../controllers/gameControllers/displayPage.js";
import checkSession from "../utils/checkSession.js";

const router = express.Router();

router.get("/adventure", checkSession, displayPage);
router.post("/adventure", checkSession, displayPage);
router.get("/", index);

export default router;
