import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import FormScraper from "./pages/FormScraper";
import FormLibrary from "./pages/FormLibrary";
import FormViewer from "./pages/FormViewer";
import FormBuilder from "./pages/FormBuilder";
import FormFiller from "./pages/FormFiller";
import FormProgressDashboard from "./pages/FormProgressDashboard";
import SmartSearch from "./pages/SmartSearch";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/search" element={<SmartSearch />} />
            {/* Redirect old dashboard route to form-progress */}
            <Route path="/dashboard" element={<Navigate to="/form-progress" replace />} />
            <Route path="/form-scraper" element={<FormScraper />} />
            <Route path="/form-library" element={<FormLibrary />} />
            <Route path="/form-viewer/:formId" element={<FormViewer />} />
            <Route path="/form-builder/:formId" element={<FormBuilder />} />
            <Route path="/form-filler" element={<FormFiller />} />
            <Route path="/form-progress" element={<FormProgressDashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
