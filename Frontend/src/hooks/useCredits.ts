import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/react";
import { getUserCreditsApi } from "../services/user.api";
import toast from "react-hot-toast";

export const useCredits = (enabled: boolean) => {
  const { getToken } = useAuth();
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetch = async () => {
      if (!enabled) return;

      try {
        setLoading(true);
        const token = await getToken();
        if (!token) throw new Error("Unauthorized");

        const data = await getUserCreditsApi(token);

        if (isMounted) {
          setCredits(data.credits);
        }
      } catch (error: unknown) {
        console.log(error);
        toast.error("Unable to fetch credits");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetch();

    return () => {
      isMounted = false;
    };
  }, [enabled, getToken, refetchTrigger]);

  const refetch = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1);
  }, []);

  return { credits, loading, refetch };
};
