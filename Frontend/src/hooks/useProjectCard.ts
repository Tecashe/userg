import { useAuth } from "@clerk/react";
import toast from "react-hot-toast";
import { deleteProjectByIdApi } from "../services/project.api";
import type { Project } from "../types";
import { togglePublishApi } from "../services/user.api";

export const useProjectCard = (
  setGenerations?: React.Dispatch<React.SetStateAction<Project[]>>,
) => {
  const { getToken } = useAuth();

  const handleDelete = async (projectId: string) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this project?",
    );
    if (!confirm) return;

    try {
      const token = await getToken();
      if (!token) throw new Error("Unauthorized");

      const data = await deleteProjectByIdApi(projectId, token);

      if (setGenerations) {
        setGenerations((generations) =>
          generations.filter((gen) => gen.id !== projectId),
        );
      }

      toast.success(data.message);
    } catch (error) {
      console.log(error);
      toast.error("Unable to delete project");
    }
  };

  const togglePublish = async (projectId: string) => {
    try {
      const token = await getToken();
      if (!token) throw new Error("Unauthorized");

      const data = await togglePublishApi(projectId, token);

      if (setGenerations) {
        setGenerations((generations) =>
          generations.map((gen) =>
            gen.id === projectId
              ? { ...gen, isPublished: data.isPublished }
              : gen,
          ),
        );
      }

      toast.success(
        data.isPublished ? "Project published" : "Project unpublished",
      );
    } catch (error) {
      console.log(error);
      toast.error("Error toggling");
    }
  };

  return { handleDelete, togglePublish };
};
