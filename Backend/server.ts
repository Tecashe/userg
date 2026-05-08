import "./config/instrument.js";
import "dotenv/config";
import app from "./src/app.js";
import * as Sentry from "@sentry/node";
import { prisma } from "./config/prisma.js";

Sentry.setupExpressErrorHandler(app);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server is live at http://localhost:${PORT}`);
});

const shutdown = () => {
  server.close(() => {
    prisma.$disconnect().then(() => {
      console.log("Server shut down gracefully.");
      process.exit(0);
    });
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
