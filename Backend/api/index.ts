import "../config/instrument.js";
import "dotenv/config";
import * as Sentry from "@sentry/node";
import app from "../src/app.js";

Sentry.setupExpressErrorHandler(app);

export default app;
