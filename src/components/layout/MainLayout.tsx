import { Outlet } from "react-router-dom";
import SideNav from "./SideNav";

export const MainLayout = () => {
  return (
    <div className="flex h-screen">
      <main className="flex-1 overflow-auto">
        <SideNav></SideNav>
        <Outlet />
      </main>
    </div>
  );
};
