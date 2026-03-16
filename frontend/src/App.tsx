import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import RoleSelection from "./pages/auth/RoleSelection";
import Home from "./pages/Home";
import { FloatingChatWidget } from "./components/FloatingChatWidget";
import Messages from "./pages/shared/Messages";

import CustomerLayout from "./pages/customer/CustomerLayout";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import BookService from "./pages/customer/BookService";
import CostEstimator from "./pages/customer/CostEstimator";
import PaymentGateway from "./pages/customer/PaymentGateway";
import NearbyAgents from "./pages/customer/NearbyAgents";
import AgentProfile from "./pages/customer/AgentProfile";
import ServiceTracking from "./pages/customer/ServiceTracking";
import ServiceHistory from "./pages/customer/ServiceHistory";
import Reviews from "./pages/customer/Reviews";
import Complaints from "./pages/customer/Complaints";

import AgentLayout from "./pages/agent/AgentLayout";
import AgentDashboard from "./pages/agent/AgentDashboard";
import AgentRequests from "./pages/agent/AgentRequests";
import { AgentAvailability, AgentAttendance, AgentPortfolio, AgentDocuments, AgentUpdateStatus } from "./pages/agent/AgentPages";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { AdminUsers, AdminVerifyAgents, AdminBookings, AdminComplaints, AdminAnalytics } from "./pages/admin/AdminPages";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <FloatingChatWidget />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/google/callback" element={<RoleSelection />} />

            {/* Customer Routes */}
            <Route path="/customer" element={<ProtectedRoute allowedRoles={["customer"]}><CustomerLayout /></ProtectedRoute>}>
              <Route index element={<CustomerDashboard />} />
              <Route path="book" element={<BookService />} />
              <Route path="payment" element={<PaymentGateway />} />
              <Route path="estimator" element={<CostEstimator />} />
              <Route path="agents" element={<NearbyAgents />} />
              <Route path="agents/:id" element={<AgentProfile />} />
              <Route path="tracking" element={<ServiceTracking />} />
              <Route path="history" element={<ServiceHistory />} />
              <Route path="messages" element={<Messages />} />
              <Route path="messages/:bookingId" element={<Messages />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="complaints" element={<Complaints />} />
            </Route>

            {/* Agent Routes */}
            <Route path="/agent" element={<ProtectedRoute allowedRoles={["agent"]}><AgentLayout /></ProtectedRoute>}>
              <Route index element={<AgentDashboard />} />
              <Route path="requests" element={<AgentRequests />} />
              <Route path="availability" element={<AgentAvailability />} />
              <Route path="attendance" element={<AgentAttendance />} />
              <Route path="portfolio" element={<AgentPortfolio />} />
              <Route path="documents" element={<AgentDocuments />} />
              <Route path="messages" element={<Messages />} />
              <Route path="messages/:bookingId" element={<Messages />} />
              <Route path="status" element={<AgentUpdateStatus />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="verify" element={<AdminVerifyAgents />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="complaints" element={<AdminComplaints />} />
              <Route path="analytics" element={<AdminAnalytics />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
