import Navbar from "./components/Navbar";
import SoftBackdrop from "./components/SoftBackdrop";
import Footer from "./components/Footer";
import LenisScroll from "./components/lenis";
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";

function Layout() {
  return (
    <>
      <Toaster
        toastOptions={{ style: { backgroundColor: "#333", color: "#fff" } }}
      />
      <SoftBackdrop />
      <LenisScroll />
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}
export default Layout;
