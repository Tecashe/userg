import express from "express";
import * as projectControllers from "../controllers/project.controller.js";
import upload from "../../config/multer.js";
import { protect } from "../middlewares/auth.middleware.js";

const projectRouter = express.Router();

/**
 * @route POST api/project/generate/image
 * @description Generates an AI-powered product image by combining uploaded user images with a prompt,
 * uploads assets to cloud storage, and creates a new project entry in the database.
 * Deducts user credits and handles rollback in case of failure.
 * @access private
 */
projectRouter.post(
  "/generate/image",
  protect,
  upload.array("images", 2),
  projectControllers.generateImage,
);

/**
 * @route POST /api/project/generate/video
 * @description Generates a promotional video using AI based on a previously generated project image.
 * Handles concurrency with locking, deducts user credits, uploads the result to cloud storage,
 * and updates the project with the generated video URL.
 * @access private
 */
projectRouter.post(
  "/generate/video",
  protect,
  projectControllers.generateVideo,
);

/**
 * @route GET /api/project/published
 * @description Retrieves a paginated list of all publicly published and non-deleted projects.
 * Used for displaying projects in public feeds or galleries.
 * @access public
 */
projectRouter.get("/published", projectControllers.getAllPublishedProjects);

/**
 * @route DELETE /api/project/:projectId
 * @description Soft deletes a project by marking it as deleted (isDeleted = true).
 * Ensures only the project owner can perform the deletion.
 * @access private
 */
projectRouter.delete(
  "/:projectId",
  protect,
  projectControllers.deleteProjectById,
);

export default projectRouter;
