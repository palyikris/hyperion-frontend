import { Outlet } from "react-router-dom";
import SideNav from "./SideNav";

export const MainLayout = () => {
  return (
    <div className="flex h-screen">
      <main className="flex-1 overflow-auto">
        <SideNav></SideNav>
        <div className="layout-content pl-0 md:pl-20">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
