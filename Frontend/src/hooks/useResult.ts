import { useState, useEffect, useRef } from "react";
import { useAuth } from "@clerk/react";
import toast from "react-hot-toast";
import type { Project } from "../types";
import { getProjectByIdApi } from "../services/user.api";
import { generateVideoApi } from "../services/project.api";

export const useResult = (projectId?: string) => {
  const { getToken } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const isFetchingRef = useRef(false);

  const fetchProject = async () => {
    if (!projectId || isFetchingRef.current) return;

    isFetchingRef.current = true;
    try {
      const token = await getToken();
      if (!token) throw new Error("Unauthorized");

      const data = await getProjectByIdApi(projectId, token);

      setProject(data.project);
      setIsGenerating(data.project.isGenerating);
    } catch (error: unknown) {
      console.log(error);
      toast.error("Failed to fetch project");
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  const generateVideo = async () => {
    if (!projectId) return;

    try {
      setIsGenerating(true);

      const token = await getToken();
      if (!token) throw new Error("Unauthorized");

      const data = await generateVideoApi(projectId, token);

      setProject((prev) =>
        prev
          ? {
              ...prev,
              generatedVideo: data.videoUrl,
              isGenerating: false,
            }
          : prev,
      );

      toast.success(data.message);
    } catch (error: unknown) {
      console.log(error);
      toast.error("Failed to generate video");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (!projectId) return;

    let isMounted = true;

    const run = async () => {
      try {
        setLoading(true);

        const token = await getToken();
        if (!token) throw new Error("Unauthorized");

        const data = await getProjectByIdApi(projectId, token);

        if (isMounted) {
          setProject(data.project);
          setIsGenerating(data.project.isGenerating);
        }
      } catch (error: unknown) {
        console.log(error);
        toast.error("Failed to generate video");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      isMounted = false;
    };
  }, [projectId, getToken]);

  useEffect(() => {
    if (!isGenerating || !projectId) return;

    const interval = setInterval(() => {
      fetchProject();
    }, 10000);
    return () => clearInterval(interval);
  }, [isGenerating, projectId]);

  return {
    project,
    loading,
    isGenerating,
    generateVideo,
    refetch: fetchProject,
  };
};
