import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import AnimatedBackground from "./components/AnimatedBackground";
import Index from "./pages/Index";
import About from "./pages/About";
import AAI from "./pages/AAI";
import AAQ from "./pages/AAQ"; 
import ASF from "./pages/ASF";
import AVF from "./pages/AVF";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import AIContent from "./pages/AIContent";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import PostEditor from "./pages/PostEditor";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnimatedBackground />
          <div className="min-h-screen flex flex-col relative z-0">
            <Navigation />
            <main className="flex-1 pt-16">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/sobre" element={<About />} />
                <Route path="/aai" element={<AAI />} />
                <Route path="/aaq" element={<AAQ />} />
                <Route path="/asf" element={<ASF />} />
                <Route path="/avf" element={<AVF />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/ai-content" element={<AIContent />} />
                <Route path="/admin/posts/new" element={<PostEditor />} />
                <Route path="/admin/posts/:id/edit" element={<PostEditor />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
