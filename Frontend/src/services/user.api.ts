import axios from "axios";
import api from "../configs/axios";

type CreditsResponse = {
  credits: number;
};

export async function getUserCreditsApi(token: string) {
  try {
    const { data } = await api.get<CreditsResponse>("/api/user/credits", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!data || typeof data.credits !== "number") {
      throw new Error("Invalid credits response");
    }

    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.message);
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Unable to fetch credits");
  }
}

export const getProjectByIdApi = async (projectId: string, token: string) => {
  try {
    const { data } = await api.get(`/api/user/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!data?.project) {
      throw new Error("Invalid response");
    }

    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.message);
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Failed to fetch project");
  }
};

export const getMyProjectsApi = async (token: string) => {
  try {
    const { data } = await api.get("/api/user/projects", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!data?.projects) {
      throw new Error("Invalid response");
    }

    return data;
  } catch (error: unknown) {
    console.log("Yes this error: ", error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.message);
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Unable to fetch projects");
  }
};

export const togglePublishApi = async (projectId: string, token: string) => {
  try {
    const { data } = await api.patch(
      `/api/user/publish/${projectId}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (typeof data?.isPublished !== "boolean") {
      throw new Error("Invalid response");
    }

    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.message);
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Failed to toggle publish");
  }
};
