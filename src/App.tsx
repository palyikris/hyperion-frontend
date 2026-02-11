import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/shared/ProtectedRoute";
import { MainLayout } from "./components/layout/MainLayout";
import LoginPage from "./pages/login";
import SignupPage from "./pages/signup";




const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/signup" element={<SignupPage></SignupPage>} />

        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<>dashboard</>} />
          <Route path="/map" element={<>map</>} />
          <Route path="/lab/:id" element={<>lab</>} />
          <Route path="/upload" element={<>upload</>} />
          <Route path="/vault" element={<>media</>} />
          <Route path="/settings" element={<>settings</>} />
        </Route>

        <Route path="*" element={<>404</>} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
