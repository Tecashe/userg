import { Loader2Icon } from "lucide-react";
import ProjectCard from "../components/ProjectCard";
import { PrimaryButton } from "../components/Buttons";
import { useUser } from "@clerk/react";
import { useNavigate } from "react-router";
import { useMyProjects } from "../hooks/useMyProjects";

function MyGenerations() {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  if (isLoaded && !user) {
    navigate("/");
  }

  const { generations, loading, setGenerations } = useMyProjects(!!user);

  return loading ? (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2Icon className="size-7 animate-spin text-indigo-400" />
    </div>
  ) : (
    <div className="min-h-screen text-white p-6 md:p-12 my-28">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold mb-4">
            My Generations
          </h1>
          <p className="text-gray-400">
            View and manage your AI-generated content
          </p>
        </header>

        {/* Generations List */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          {generations.map(
            (gen) =>
              gen.generatedImage && (
                <ProjectCard
                  key={gen.id}
                  gen={gen}
                  setGenerations={setGenerations}
                />
              ),
          )}
        </div>
        {generations.length === 0 && (
          <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-xl font-medium mb-2">No generations yet</h3>
            <p className="text-gray-400 mb-6">
              Start creating stunning product photos today
            </p>
            <PrimaryButton onClick={() => (window.location.href = "/generate")}>
              Create New Generation
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
}
export default MyGenerations;
