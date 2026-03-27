import { ReactNode } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Outlet } from "react-router-dom";
import { Home, Calendar, Calculator, MapPin, MessageSquare, Navigation, History, Star, AlertTriangle, UserCircle2 } from "lucide-react";

const sidebarItems = [
  { label: "Dashboard", icon: <Home className="h-4 w-4" />, path: "/customer" },
  { label: "Book Service", icon: <Calendar className="h-4 w-4" />, path: "/customer/book" },
  { label: "Cost Estimator", icon: <Calculator className="h-4 w-4" />, path: "/customer/estimator" },
  { label: "Nearby Agents", icon: <MapPin className="h-4 w-4" />, path: "/customer/agents" },
  { label: "Service Tracking", icon: <Navigation className="h-4 w-4" />, path: "/customer/tracking" },
  { label: "Service History", icon: <History className="h-4 w-4" />, path: "/customer/history" },
  { label: "Messages", icon: <MessageSquare className="h-4 w-4" />, path: "/customer/messages" },
  { label: "Reviews", icon: <Star className="h-4 w-4" />, path: "/customer/reviews" },
  { label: "Complaints", icon: <AlertTriangle className="h-4 w-4" />, path: "/customer/complaints" },
  { label: "Profile", icon: <UserCircle2 className="h-4 w-4" />, path: "/customer/profile" },
];

export default function CustomerLayout() {
  return (
    <DashboardLayout sidebarItems={sidebarItems} title="Customer Dashboard">
      <Outlet />
    </DashboardLayout>
  );
}
