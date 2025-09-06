import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/tax" element={<div className="p-8 text-center text-muted-foreground">Tax Summary - Coming Soon</div>} />
            <Route path="/investments" element={<div className="p-8 text-center text-muted-foreground">Investments - Coming Soon</div>} />
            <Route path="/forecasts" element={<div className="p-8 text-center text-muted-foreground">Forecasts - Coming Soon</div>} />
            <Route path="/recommendations" element={<div className="p-8 text-center text-muted-foreground">Recommendations - Coming Soon</div>} />
            <Route path="/reports" element={<div className="p-8 text-center text-muted-foreground">Reports - Coming Soon</div>} />
            <Route path="/settings" element={<div className="p-8 text-center text-muted-foreground">Settings - Coming Soon</div>} />
            <Route path="/profile" element={<div className="p-8 text-center text-muted-foreground">Profile - Coming Soon</div>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
