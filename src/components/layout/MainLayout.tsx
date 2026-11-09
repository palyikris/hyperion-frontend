import { Outlet } from "react-router-dom";
import SideNav from "./SideNav";
import { useUploadSocket } from "../../hooks/upload/useUploadSocket";

export const MainLayout = () => {
  const { liveFailureAnnouncement } = useUploadSocket();

  return (
    <div className="min-h-dvh">
      <main className="min-w-0">
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {liveFailureAnnouncement}
        </div>
        <SideNav></SideNav>
        <div className="layout-content min-w-0 pt-20 md:pl-20 md:pt-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
