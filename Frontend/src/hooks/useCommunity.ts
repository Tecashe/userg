import { useEffect, useState } from "react";
import type { Project } from "../types";
import toast from "react-hot-toast";
import { getPublishedProjects } from "../services/project.api";

export const useCommunity = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMount = true;

    const run = async () => {
      try {
        setLoading(true);

        const data = await getPublishedProjects();

        if (isMount) {
          setProjects(data.projects);
        }
      } catch (error) {
        console.log(error);
        toast.error("Unable to fetch projects");
      } finally {
        if (isMount) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      isMount = false;
    };
  }, []);

  return { projects, loading };
};
