import MongoStore from "connect-mongo";

const {
  SESSION_SECRET = [], // string || string[]
  MONGODB_URI = undefined, // string || undefined
  NODE_ENV = undefined, // string || undefined
} = process.env;

/**
 * Configuration object for session middleware.
 * @type {import("express-session").SessionOptions}
 */
const sessionConfig = Object.freeze({
  secret: SESSION_SECRET,
  resave: false, // Do not save session if unmodified
  saveUninitialized: false, // Do not create session until something is stored
  store: new MongoStore({
    mongoUrl: MONGODB_URI,
    collectionName: "sessions", // Specify the collection name
  }),
  cookie: {
    maxAge: 60 * 60 * 1000, // 1 hour
    httpOnly: true, // Ensure the cookie is only accessible via HTTP(S), not client-side scripts
    secure: NODE_ENV === "production", // Use secure cookies in production
  },
});

export default sessionConfig;
