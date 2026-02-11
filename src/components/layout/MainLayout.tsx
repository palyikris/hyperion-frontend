import { Outlet } from "react-router-dom";


export const MainLayout = () => {
  return (
    <div className="flex h-screen bg-slate-900 text-white">
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};
