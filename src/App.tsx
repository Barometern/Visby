import { lazy, Suspense, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import AppBootstrap from "@/components/AppBootstrap";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";

const PuzzlePage = lazy(() => import("./pages/PuzzlePage"));
const ScanPage = lazy(() => import("./pages/ScanPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const LocationDetailPage = lazy(() => import("./pages/LocationDetailPage"));
const MapPage = lazy(() => import("./pages/MapPage"));
const ClaimRewardPage = lazy(() => import("./pages/ClaimRewardPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppBootstrap />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Layout>
          <ErrorBoundary>
            <Suspense fallback={null}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/puzzle" element={<PuzzlePage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/scan" element={<ScanPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/location/:locationId" element={<LocationDetailPage />} />
                <Route path="/claim-reward" element={<ClaimRewardPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
