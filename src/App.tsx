import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Feed from "./pages/Feed";
import TikTok from "./pages/TikTok";
import Messenger from "./pages/Messenger";
import Megatalent from "./pages/Megatalent";
import Megaforum from "./pages/Megaforum";
import Psychology from "./pages/Psychology";
import Vacationer from "./pages/Vacationer";
import Dating from "./pages/Dating";
import FirstAid from "./pages/FirstAid";
import FitSlim from "./pages/FitSlim";
import Marketplace from "./pages/Marketplace";
import Bazaar from "./pages/Bazaar";
import Referral from "./pages/Referral";
import Games from "./pages/Games";
import Jobs from "./pages/Jobs";
import InfluKing from "./pages/InfluKing";
import Admin from "./pages/Admin";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Terms from "./pages/Terms";
import Education from "./pages/Education";
import CourseDetail from "./pages/CourseDetail";
import Quiz from "./pages/Quiz";
import Auction from "./pages/Auction";
import AIGeneration from "./pages/AIGeneration";
import BestFriend from "./pages/BestFriend";
import Cooking from "./pages/Cooking";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";

import Subscription from "./pages/Subscription";
import AICreditsStore from "./pages/AICreditsStore";
import NotFound from "./pages/NotFound";
import AdminTransactions from "./pages/AdminTransactions";
import Earnings from "./pages/Earnings";
import LiveStream from "./pages/LiveStream";
import Stories from "./pages/Stories";
import Rewards from "./pages/Rewards";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/tiktok" element={<TikTok />} />
              <Route path="/messenger" element={<Messenger />} />
              <Route path="/megatalent" element={<Megatalent />} />
              <Route path="/megaforum" element={<Megaforum />} />
              <Route path="/psychologist" element={<Psychology />} />
              <Route path="/vacationer" element={<Vacationer />} />
              <Route path="/dating" element={<Dating />} />
              <Route path="/first-aid" element={<FirstAid />} />
              <Route path="/fit-slim" element={<FitSlim />} />
              <Route path="/marketplace" element={<Marketplace />} />
              
              <Route path="/bazaar" element={<Bazaar />} />
              <Route path="/referral" element={<Referral />} />
              <Route path="/games" element={<Games />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/influ-king" element={<InfluKing />} />
              <Route path="/auction" element={<Auction />} />
              <Route path="/ai-generation" element={<AIGeneration />} />
              <Route path="/best-friend" element={<BestFriend />} />
              <Route path="/cooking" element={<Cooking />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/education" element={<Education />} />
              <Route path="/course/:courseName" element={<CourseDetail />} />
              <Route path="/quiz" element={<Quiz />} />
              
              <Route path="/profile/:userId" element={<Profile />} />
              <Route path="/edit-profile" element={<EditProfile />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/ai-credits-store" element={<AICreditsStore />} />
              <Route path="/ai-credits" element={<AICreditsStore />} />
              <Route path="/admin/transactions" element={<AdminTransactions />} />
              <Route path="/earnings" element={<Earnings />} />
              <Route path="/live/:streamId" element={<LiveStream />} />
              <Route path="/stories/:userId" element={<Stories />} />
              <Route path="/rewards" element={<Rewards />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
