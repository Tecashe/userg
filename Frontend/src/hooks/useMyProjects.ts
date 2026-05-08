import { useAuth } from "@clerk/react";
import { useCallback, useEffect, useState } from "react";
import type { Project } from "../types";
import toast from "react-hot-toast";
import { getMyProjectsApi } from "../services/user.api";

export const useMyProjects = (enabled: boolean) => {
  const { getToken } = useAuth();

  const [generations, setGenerations] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let isMounted = true;

    const fetchProjects = async () => {
      try {
        setLoading(true);

        const token = await getToken();
        if (!token) throw new Error("Unauthorized");

        const data = await getMyProjectsApi(token);

        if (isMounted) {
          setGenerations(data.projects);
        }
      } catch (error: unknown) {
        console.log(error);
        toast.error("Unable to fetch projects");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProjects();

    return () => {
      isMounted = false;
    };
  }, [enabled, getToken, refetchTrigger]);

  const refetch = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1);
  }, []);

  return { generations, loading, refetch, setGenerations };
};
