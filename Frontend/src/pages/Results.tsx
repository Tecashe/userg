import {
  ImageIcon,
  Loader2Icon,
  RefreshCwIcon,
  SparkleIcon,
  VideoIcon,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import { GhostButton, PrimaryButton } from "../components/Buttons";
import { useUser } from "@clerk/react";
import toast from "react-hot-toast";
import { useResult } from "../hooks/useResult";

const Results = () => {
  const { projectId } = useParams();
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const { project, loading, isGenerating, generateVideo } =
    useResult(projectId);

  if (isLoaded && !user) {
    navigate("/");
    toast.error("Please login first!");
  }

  if (loading || !project) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2Icon className="animate-spin size-9 text-indigo-400" />
      </div>
    );
  }

  const downloadFile = async (url: string, filename: string) => {
    const res = await fetch(url);
    const blob = await res.blob();

    const objectUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(objectUrl);
  };

  return (
    <div className="min-h-screen text-white p-6 md:p-12 mt-20">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-medium">
            Generation Result
          </h1>
          <Link
            to="/generate"
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <RefreshCwIcon className="w-4 h-4" />
            <p className="max-sm:hidden">New Generation</p>
          </Link>
        </header>

        {/* Grid Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Result Dispaly */}
          <div className="lg:col-span-2 space-y-2">
            <div className="glass-panel inline-block p-2 rounded-2xl">
              <div
                className={`${project?.aspectRatio === "9:16" ? "aspect-9/16" : "aspect-video"} sm:max-h-200 rounded-xl bg-gray-200 overflow-hidden relative`}
              >
                {project?.generatedVideo ? (
                  <video
                    src={project.generatedVideo}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={project.generatedImage}
                    alt="Generated Result"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-6">
            {/* Download Actions */}
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-xl font-semibold mb-4">Actions</h3>
              <div className="flex flex-col gap-3">
                <a
                  href={project.generatedImage}
                  target="_blank"
                  onClick={() => {
                    if (!project.generatedImage) {
                      toast.error("No image available");
                      return;
                    }

                    if (!project.name) {
                      toast.error("No project name available");
                      return;
                    }

                    downloadFile(project.generatedImage, project.name);
                  }}
                >
                  <GhostButton
                    disabled={!project.generatedImage}
                    className="w-full justify-center rounded-md py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ImageIcon className="size-4.5" /> Download Image
                  </GhostButton>
                </a>
                <a
                  href={project.generatedVideo}
                  target="_blank"
                  onClick={() => {
                    if (!project.generatedVideo) {
                      toast.error("No video available");
                      return;
                    }

                    if (!project.name) {
                      toast.error("No project name available");
                      return;
                    }

                    downloadFile(project.generatedVideo, project.name);
                  }}
                >
                  <GhostButton
                    disabled={!project.generatedVideo}
                    className="w-full justify-center rounded-md py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <VideoIcon className="size-4.5" /> Download Video
                  </GhostButton>
                </a>
              </div>
            </div>

            {/* Generate Video Button */}
            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <VideoIcon className="size-24" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Video Magic</h3>
              <p className="text-gray-400 text-sm mb-6">
                Turn this static image into a dynamic video for social media.
              </p>
              {!project.generatedVideo ? (
                <PrimaryButton
                  onClick={generateVideo}
                  disabled={isGenerating}
                  className="w-full disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>Generating Video...</>
                  ) : (
                    <>
                      <SparkleIcon className="size-4" /> Generate Video
                    </>
                  )}
                </PrimaryButton>
              ) : (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-center text-sm font-medium">
                  Video Generated Successfully!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Results;
