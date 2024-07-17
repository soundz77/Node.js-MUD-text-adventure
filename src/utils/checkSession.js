import AppError from "../../base-template/src/utils/errors/AppError.js";

const checkSession = (req, res, next) => {
  // Check if playerName and playerClass are set in session
  if (req.session.playerName && req.session.playerClass) {
    return next();
  }

  // If playerName and playerClass are not set in session, check req.body
  const { playerName, playerClass } = req.body;

  if (playerName && playerClass) {
    // Set playerName and playerClass in session
    req.session.playerName = playerName;
    req.session.playerClass = playerClass;

    return next();
  }

  // If playerName and playerClass are not available in session or req.body, render index
  return new AppError(
    "PlayerName and PlayerClass are not available in session or req.body"
  );
};

export default checkSession;
