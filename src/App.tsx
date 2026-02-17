import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import FormFiller from "./pages/FormFiller";
import FormProgressDashboard from "./pages/FormProgressDashboard";
import SmartSearch from "./pages/SmartSearch";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import FormLibrary from "./pages/FormLibrary";
import FormViewer from "./pages/FormViewer";
import DocumentChecker from "./pages/DocumentChecker";
import Resources from "./pages/Resources";
import Faq from "./pages/Faq";
import HelpCenter from "./pages/HelpCenter";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
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
            {/* Redirect old dashboard route to home */}
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/form-filler" element={<FormFiller />} />
            <Route path="/form-progress" element={<FormProgressDashboard />} />
            <Route path="/form-library" element={<FormLibrary />} />
            <Route path="/form-viewer/:formId" element={<FormViewer />} />
            <Route path="/document-checker" element={<DocumentChecker />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/help-center" element={<HelpCenter />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/about" element={<About />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
