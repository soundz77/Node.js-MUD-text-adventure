// utils/checkSession.js
import AppError from "../../base-template/src/utils/errors/AppError.js";

export default function checkSession(req, res, next) {
  // already set?
  if (req.session?.playerName && req.session?.playerClass) {
    return next();
  }

  // allow POST to set session from form body
  const { playerName, playerClass } = req.body || {};
  if (playerName && playerClass) {
    req.session.playerName = playerName;
    req.session.playerClass = playerClass;
    return next();
  }

  return next(
    new AppError(
      "playerName and/or playerClass missing in session or request body",
      400
    )
  );
}
