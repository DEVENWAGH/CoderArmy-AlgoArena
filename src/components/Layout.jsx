import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar"; // Import Sidebar component

const Layout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isRaceModePage = location.pathname === "/race-mode";

  return (
    <>
      <Navbar />
      <div className="flex flex-1 w-full">
        {!isHomePage && !isRaceModePage && (
          <aside className="hidden xl:block md:w-64 flex-shrink-0">
            <Sidebar />
          </aside>
        )}
        <main className="flex-1 w-full">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default Layout;
