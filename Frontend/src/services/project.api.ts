import api from "../configs/axios";
import axios from "axios";

export const generateImageApi = async (formData: FormData, token: string) => {
  try {
    const { data } = await api.post("/api/project/generate/image", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!data) {
      throw new Error("Invalid response from server");
    }

    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.message);
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Failed to generate image");
  }
};

export const generateVideoApi = async (projectId: string, token: string) => {
  try {
    const { data } = await api.post(
      "/api/project/generate/video",
      { projectId },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (!data) {
      throw new Error("Invalid response from server");
    }

    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.message);
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Failed to generate video");
  }
};

export const getPublishedProjects = async () => {
  try {
    const { data } = await api.get("/api/project/published");

    if (!data.projects) {
      throw new Error("Invalid response from server");
    }

    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.message);
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Failed to fetch published projects");
  }
};

export const deleteProjectByIdApi = async (
  projectId: string,
  token: string,
) => {
  try {
    const { data } = await api.delete(`/api/project/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!data) {
      throw new Error("Invalid response from server");
    }

    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.message);
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Failed to delete project");
  }
};
