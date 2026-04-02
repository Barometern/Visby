import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import AppBootstrap from "@/components/AppBootstrap";
import Index from "./pages/Index";
import PuzzlePage from "./pages/PuzzlePage";
import ScanPage from "./pages/ScanPage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import LocationDetailPage from "./pages/LocationDetailPage";
import MapPage from "./pages/MapPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppBootstrap />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/puzzle" element={<PuzzlePage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/location/:locationId" element={<LocationDetailPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
