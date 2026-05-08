import express from "express";
import * as userControllers from "../controllers/user.controller.js";

const userRouter = express.Router();

/**
 * @route GET /api/user/credits
 * @description Get the credits of logged in user.
 * @access private
 */
userRouter.get("/credits", userControllers.getUserCredits);

/**
 * @route GET /api/user/projects
 * @description Get all the projects of logged in user.
 * @access private
 */
userRouter.get("/projects", userControllers.getAllProjects);

/**
 * @route GET /api/user/projects/:projectId
 * @description Get the project by projectId.
 * @access private
 */
userRouter.get("/projects/:projectId", userControllers.getProjectById);

/**
 * @route PATCH /api/user/publish/:projectId
 * @description Publish or unpublish the project.
 * @access private
 */
userRouter.patch("/publish/:projectId", userControllers.toggleProjectPublish);

export default userRouter;
