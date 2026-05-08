import { Request, Response } from "express";
import * as Sentry from "@sentry/node";
import { prisma } from "../../config/prisma.js";

/**
 * @name getUserCredits
 * @description Controller to get the credits of logged in user.
 * @access private
 */

export const getUserCredits = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Credits fetched successfully!",
      credits: user.credits,
    });
  } catch (error: any) {
    Sentry.captureException(error);
    return res
      .status(500)
      .json({ message: error?.message || "Internal Server Error" });
  }
};

/**
 * @name getAllProjects
 * @description Controller to get all the projects of logged in user.
 * @access private
 */
export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const projects = await prisma.project.findMany({
      where: { userId, isDeleted: false },
      orderBy: { createdAt: "desc" },
    });

    return res
      .status(200)
      .json({ message: "Projects fetched successfully!", projects });
  } catch (error: any) {
    Sentry.captureException(error);
    return res
      .status(500)
      .json({ message: error?.message || "Internal Server Error" });
  }
};

/**
 * @name getProjectById
 * @description Controller to get the project by projectId.
 * @access private
 */
export const getProjectById = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { projectId } = req.params;

    if (!projectId || Array.isArray(projectId)) {
      return res.status(400).json({ message: "Invalid projectId" });
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId,
        isDeleted: false,
      },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res
      .status(200)
      .json({ message: "Project fetched successfully!", project });
  } catch (error: any) {
    Sentry.captureException(error);
    return res
      .status(500)
      .json({ message: error?.message || "Internal Server Error" });
  }
};

/**
 * @name toggleProjectPublish
 * @description Controller to publish or unpublish the project.
 * @access private
 */
export const toggleProjectPublish = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { projectId } = req.params;

    if (!projectId || Array.isArray(projectId)) {
      return res.status(400).json({ message: "Invalid projectId" });
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId,
        isDeleted: false,
      },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!project.generatedImage && !project.generatedVideo) {
      return res.status(404).json({ message: "Image or Video not generated" });
    }

    const newStatus = !project.isPublished;

    const updated = await prisma.project.updateMany({
      where: {
        id: project.id,
        userId,
        isDeleted: false,
      },
      data: { isPublished: newStatus },
    });

    if (updated.count === 0) {
      throw new Error("Project not available for update");
    }

    return res.status(200).json({
      message: "Publish status updated successfully",
      isPublished: newStatus,
    });
  } catch (error: any) {
    Sentry.captureException(error);
    return res
      .status(500)
      .json({ message: error?.message || "Internal Server Error" });
  }
};
