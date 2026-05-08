import { Router } from "express";
import userRouter from "./user.routes.js";
import { protect } from "../middlewares/auth.middleware.js";
import projectRouter from "./project.routes.js";

const router = Router();

router.get("/", (_req, res) => {
  res.send("Server is Live!");
});

router.use("/user", protect, userRouter);
router.use("/project", projectRouter);

export default router;
