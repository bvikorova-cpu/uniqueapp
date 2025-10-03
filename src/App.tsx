import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Feed from "./pages/Feed";
import Megatalent from "./pages/Megatalent";
import Megaforum from "./pages/Megaforum";
import Psychology from "./pages/Psychology";
import Vacationer from "./pages/Vacationer";
import Dating from "./pages/Dating";
import Marketplace from "./pages/Marketplace";
import Eshop from "./pages/Eshop";
import Bazaar from "./pages/Bazaar";
import Referral from "./pages/Referral";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/megatalent" element={<Megatalent />} />
          <Route path="/megaforum" element={<Megaforum />} />
          <Route path="/psychologist" element={<Psychology />} />
          <Route path="/vacationer" element={<Vacationer />} />
          <Route path="/dating" element={<Dating />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/eshop" element={<Eshop />} />
          <Route path="/bazaar" element={<Bazaar />} />
          <Route path="/referral" element={<Referral />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
