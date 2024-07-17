import AppError from "../../../../base-template/src/utils/errors/AppError.js";

const port = process.env.PORT;
const mode = process.env.NODE_ENV;

if (!port || !mode) {
  throw new AppError("Port or mode invalid");
}

const loggingMessages = {
  mongoDBConnection: {
    errors: {
      connectionError: "Error connecting to MongoDB",
      disconnected: "MongoDB disconnected",
      SIGINT: "SIGINT",
      invalid: "Invalid MongoDB URI. Cannot connect to database",
      terminated: "MongoDB disconnected through app termination",
    },
    success: {
      connection: "Connected to MongoDB",
    },
  },
  session: {
    errors: {
      required: "Required parameters not provided for session config",
    },
    success: {
      connect: "A user connected",
      disconnect: "A user disconnected",
    },
  },
  server: {
    errors: {
      startup: "Server startup error",
      rateLimit: "Too many requests from this IP, please try again later",
      required: "Server environment variables are not properly set",
    },
    success: {
      startup: `Server successfully started on port ${port} in ${mode} mode.`,
      shutdown: "Server shutting down gracefully...",
    },
  },
  async: {
    errors: {
      uncaughtException: "UNCAUGHT EXCEPTION! Shutting down...",
      unhandledRejection: "UNHANDLED REJECTION! Shutting down...",
    },
  },
  errorControllers: {
    errors: {
      invalidValue: "Invalid value:",
      duplicateField: "Duplicate field:",
      invalidData: "Invalid data",
      invalidToken: "Invalid token. Please log in again!",
      expiredToken: "Your token has expired! Please log in again.",
      devError: "Something went wrong",
      prodError: "Something went very wrong",
      opError: "Something went wrong. Please try again later.",
      sendOpError: "SendErrorOperational",
      pageNotFound: "Unable to find the requested page.",
      winston: "Winston Transport Error:",
    },
  },
};

export default loggingMessages;
