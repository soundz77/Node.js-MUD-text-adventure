// routes/adventure.js
import express from "express";
import index from "../controllers/gameControllers/index.js";
import displayPage from "../controllers/gameControllers/displayPage.js";
import checkSession from "../utils/checkSession.js";

const router = express.Router();

// Render /adventure, requiring a session (or POST with body to set it)
router.get("/adventure", checkSession, displayPage);
router.post("/adventure", checkSession, displayPage);

// Landing page
router.get("/", index);

export default router;
