import { Outlet } from "react-router-dom";
import SideNav from "./SideNav";
import { useUploadSocket } from "../../hooks/upload/useUploadSocket";

export const MainLayout = () => {
  const { liveFailureAnnouncement } = useUploadSocket();

  return (
    <div className="flex h-screen">
      <main className="flex-1 overflow-auto">
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {liveFailureAnnouncement}
        </div>
        <SideNav></SideNav>
        <div className="layout-content pl-0 md:pl-20">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
