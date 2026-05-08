import { Request, Response } from "express";
import * as Sentry from "@sentry/node";
import { prisma } from "../../config/prisma.js";
import { v2 as cloudinary } from "cloudinary";
import {
  cleanupLocalFile,
  downloadVideoLocally,
  uploadImages,
  uploadVideoToCloudinary,
} from "../services/cloudinary.service.js";
import {
  generateAIImage,
  generateVideoFromImage,
} from "../services/ai.service.js";

/**
 * @name generateImage
 * @description Controller to generate an AI-powered product image by combining uploaded user images with a prompt,
 * uploads assets to cloud storage, and creates a new project entry in the database.
 * Deducts user credits and handles rollback in case of failure.
 * @access private
 */
export const generateImage = async (req: Request, res: Response) => {
  let tempProjectId: string | null = null;
  const userId = req.userId!;
  let isCreditDeducted = false;

  const {
    name = "New Project",
    aspectRatio,
    userPrompt,
    productName,
    productDescription,
    targetLength = 5,
  } = req.body;

  const images = req.files as Express.Multer.File[] | undefined;

  if (!images || images.length !== 2 || !productName) {
    return res.status(400).json({
      message: "Please upload exactly 2 images and provide product name",
    });
  }

  const updatedUser = await prisma.user.updateMany({
    where: {
      id: userId,
      credits: { gte: 5 },
    },
    data: {
      credits: { decrement: 5 },
    },
  });

  if (updatedUser.count === 0) {
    return res.status(401).json({ message: "Insufficient credits" });
  }

  isCreditDeducted = true;

  try {
    // upload images on cloudinary
    let uploadedImages = await uploadImages(images);

    // create project
    const project = await prisma.project.create({
      data: {
        name,
        userId,
        productName,
        productDescription,
        userPrompt,
        aspectRatio,
        targetLength: Number(targetLength) || 5,
        uploadedImages,
        isGenerating: true,
      },
    });

    tempProjectId = project.id;

    // Generate the image using the ai model
    const prompt = `Combine the person and product into a realistic photo.
      Make the person naturally hold or use the product.
      Match lighting, shadows, scale and perspective.
      Make the person stand in professional studio lighting.
      Output ecommerce-quality photo realistic imagery.
      ${userPrompt}`;

    const base64Image = await generateAIImage(images, prompt, aspectRatio);

    // Upload generated image
    const uploadedResult = await cloudinary.uploader.upload(base64Image, {
      resource_type: "image",
    });

    await prisma.project.updateMany({
      where: { id: project.id, isDeleted: false },
      data: {
        generatedImage: uploadedResult.secure_url,
        isGenerating: false,
      },
    });

    return res
      .status(200)
      .json({ message: "Image generated successfully", projectId: project.id });
  } catch (error: any) {
    if (tempProjectId) {
      // update project status and error message
      await prisma.project.update({
        where: { id: tempProjectId },
        data: {
          isGenerating: false,
          error: error.message,
        },
      });
    }

    if (isCreditDeducted && req.userId) {
      // add credit back
      await prisma.user.update({
        where: { id: userId },
        data: {
          credits: { increment: 5 },
        },
      });
    }

    Sentry.captureException(error);
    return res
      .status(500)
      .json({ message: error?.message || "Internal Server Error" });
  }
};

/**
 * @name generateVideo
 * @description Controller to generate a promotional video using AI based on a previously generated project image.
 * Handles concurrency with locking, deducts user credits, uploads the result to cloud storage,
 * and updates the project with the generated video URL.
 * @access private
 */
export const generateVideo = async (req: Request, res: Response) => {
  const userId = req.userId!;
  const { projectId } = req.body;

  if (!projectId || typeof projectId !== "string") {
    return res.status(400).json({ message: "Invalid projectId" });
  }

  let isCreditDeducted = false;
  let filePath = "";

  try {
    const lock = await prisma.project.updateMany({
      where: {
        id: projectId,
        userId,
        isGenerating: false,
        isDeleted: false,
      },
      data: { isGenerating: true },
    });

    if (lock.count === 0) {
      return res.status(409).json({ message: "Already generating" });
    }

    const project = await prisma.project.findFirst({
      where: { id: projectId, userId, isDeleted: false },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.generatedVideo) {
      return res.status(404).json({ message: "Video already generated" });
    }

    if (!project.generatedImage) {
      return res.status(404).json({ message: "Generated image not found" });
    }

    const updatedUser = await prisma.user.updateMany({
      where: {
        id: userId,
        credits: { gte: 10 },
      },
      data: {
        credits: { decrement: 10 },
      },
    });

    if (updatedUser.count === 0) {
      return res.status(401).json({ message: "Insufficient credits" });
    }

    isCreditDeducted = true;

    const prompt = `make the person showcase the product which is ${project.productName} ${project.productDescription ? `and Product Description: ${project.productDescription}` : ""}`;

    // AI Service
    const videoFile = await generateVideoFromImage(
      project.generatedImage,
      prompt,
      project.aspectRatio,
    );

    // Download locally
    filePath = await downloadVideoLocally(videoFile, userId);

    // Upload to cloudinary
    const videoUrl = await uploadVideoToCloudinary(filePath);

    const updated = await prisma.project.updateMany({
      where: { id: project.id, isDeleted: false },
      data: {
        generatedVideo: videoUrl,
        isGenerating: false,
      },
    });

    if (updated.count === 0) {
      throw new Error("Project not available for update");
    }

    return res.status(200).json({
      message: "Video generated successfully",
      videoUrl,
    });
  } catch (error: any) {
    // update project status and error message
    await prisma.project.update({
      where: { id: projectId },
      data: {
        isGenerating: false,
        error: error.message,
      },
    });

    // add credit back
    if (isCreditDeducted) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          credits: { increment: 10 },
        },
      });
    }

    Sentry.captureException(error);
    return res
      .status(500)
      .json({ message: error?.message || "Internal Server Error" });
  } finally {
    // remove video file from disk after upload
    await cleanupLocalFile(filePath);
  }
};

/**
 * @name getAllPublishedProjects
 * @description Controller to retrieve a paginated list of all publicly published and non-deleted projects.
 * Used for displaying projects in public feeds or galleries.
 * @access public
 */
export const getAllPublishedProjects = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const projects = await prisma.project.findMany({
      where: { isPublished: true, isDeleted: false },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return res
      .status(200)
      .json({ message: "Published projects fetched successfully", projects });
  } catch (error: any) {
    Sentry.captureException(error);
    return res
      .status(500)
      .json({ message: error?.message || "Internal Server Error" });
  }
};

/**
 * @name deleteProjectById
 * @description Controller to soft delete a project by marking it as deleted (isDeleted = true).
 * Ensures only the project owner can perform the deletion.
 * @access private
 */
export const deleteProjectById = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { projectId } = req.params;

    if (!projectId || typeof projectId !== "string") {
      return res.status(400).json({ message: "Invalid projectId" });
    }

    const deleted = await prisma.project.updateMany({
      where: { id: projectId, userId, isDeleted: false },
      data: {
        isDeleted: true,
      },
    });

    if (deleted.count === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.status(200).json({ message: "Project deleted successfully" });
  } catch (error: any) {
    Sentry.captureException(error);
    return res
      .status(500)
      .json({ message: error?.message || "Internal Server Error" });
  }
};
