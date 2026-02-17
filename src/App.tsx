import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import LoginPage from "./pages/login";
import SignupPage from "./pages/signup";
import { Toaster } from "sonner";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import SettingsPage from "./pages/settings";
import DashboardPage from "./pages/dashboard";
import UploadPage from "./pages/upload";

const AppRouter = () => {
  return (
    <>
      <Toaster position="bottom-left" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage></SignupPage>} />

          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/stats" element={<>stats</>}></Route>
            <Route path="/map" element={<>map</>} />
            <Route path="/lab/:id" element={<>lab</>} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/vault" element={<>media</>} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<>404</>} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default AppRouter;
