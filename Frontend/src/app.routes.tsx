import { createBrowserRouter } from "react-router-dom";
import Layout from "./Layout";
import Home from "./pages/Home";
import Generator from "./pages/Generator";
import Results from "./pages/Results";
import MyGenerations from "./pages/MyGenerations";
import Community from "./pages/Community";
import Plans from "./pages/Plans";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/generate",
        element: <Generator />,
      },
      {
        path: "/result/:projectId",
        element: <Results />,
      },
      {
        path: "/my-generations",
        element: <MyGenerations />,
      },
      {
        path: "/community",
        element: <Community />,
      },
      {
        path: "/plans",
        element: <Plans />,
      },
    ],
  },
]);
