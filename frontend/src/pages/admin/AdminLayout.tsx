import { DashboardLayout } from "@/components/DashboardLayout";
import { Outlet } from "react-router-dom";
import { Home, Users, ShieldCheck, Calendar, AlertTriangle, BarChart3, UserCircle2 } from "lucide-react";

const sidebarItems = [
  { label: "Dashboard", icon: <Home className="h-4 w-4" />, path: "/admin" },
  { label: "Manage Users", icon: <Users className="h-4 w-4" />, path: "/admin/users" },
  { label: "Verify Agents", icon: <ShieldCheck className="h-4 w-4" />, path: "/admin/verify" },
  { label: "All Bookings", icon: <Calendar className="h-4 w-4" />, path: "/admin/bookings" },
  { label: "Complaints", icon: <AlertTriangle className="h-4 w-4" />, path: "/admin/complaints" },
  { label: "Analytics", icon: <BarChart3 className="h-4 w-4" />, path: "/admin/analytics" },
  { label: "Profile", icon: <UserCircle2 className="h-4 w-4" />, path: "/admin/profile" },
];

export default function AdminLayout() {
  return (
    <DashboardLayout sidebarItems={sidebarItems} title="Admin Panel">
      <Outlet />
    </DashboardLayout>
  );
}
