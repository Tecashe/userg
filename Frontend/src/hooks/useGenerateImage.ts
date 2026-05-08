import { useState } from "react";
import { useAuth } from "@clerk/react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { generateImageApi } from "../services/project.api";

export const useGenerateImage = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [isGenerating, setIsGenerating] = useState(false);

  const generateImage = async (formData: FormData) => {
    try {
      setIsGenerating(true);

      const token = await getToken();
      if (!token) throw new Error("Unauthorized");

      const data = await generateImageApi(formData, token);

      toast.success(data.message);
      navigate(`/result/${data.projectId}`);
    } catch (error: unknown) {
      console.log(error);
      toast.error("Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  };

  return { generateImage, isGenerating };
};
