import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import Login from "./pages/Login";
import BuildingList from "./pages/BuildingList";
import BuildingDetail from "./pages/BuildingDetail";
import CameraForm from "./pages/CameraForm";
import BulkCameraAdd from "./pages/BulkCameraAdd";
import FaultyReport from "./pages/FaultyReport";
import ChangePassword from "./pages/ChangePassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const currentUser = localStorage.getItem("currentUser");
  return currentUser ? <>{children}</> : <Navigate to="/login" replace />;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><BuildingList /></ProtectedRoute>} />
            <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
            <Route path="/faulty" element={<ProtectedRoute><FaultyReport /></ProtectedRoute>} />
            <Route path="/building/:buildingId" element={<ProtectedRoute><BuildingDetail /></ProtectedRoute>} />
            <Route path="/building/:buildingId/bulk" element={<ProtectedRoute><BulkCameraAdd /></ProtectedRoute>} />
            <Route path="/camera/new/:buildingId" element={<ProtectedRoute><CameraForm /></ProtectedRoute>} />
            <Route path="/camera/:cameraId" element={<ProtectedRoute><CameraForm /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
