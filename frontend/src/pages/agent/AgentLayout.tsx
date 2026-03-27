import { DashboardLayout } from "@/components/DashboardLayout";
import { Outlet } from "react-router-dom";
import { Home, ClipboardList, ToggleLeft, CalendarCheck, Image, FileText, MessageSquare, RefreshCw, UserCircle2 } from "lucide-react";

const sidebarItems = [
  { label: "Dashboard", icon: <Home className="h-4 w-4" />, path: "/agent" },
  { label: "Service Requests", icon: <ClipboardList className="h-4 w-4" />, path: "/agent/requests" },
  { label: "Availability", icon: <ToggleLeft className="h-4 w-4" />, path: "/agent/availability" },
  { label: "Attendance", icon: <CalendarCheck className="h-4 w-4" />, path: "/agent/attendance" },
  { label: "Portfolio", icon: <Image className="h-4 w-4" />, path: "/agent/portfolio" },
  { label: "Documents", icon: <FileText className="h-4 w-4" />, path: "/agent/documents" },
  { label: "Messages", icon: <MessageSquare className="h-4 w-4" />, path: "/agent/messages" },
  { label: "Update Status", icon: <RefreshCw className="h-4 w-4" />, path: "/agent/status" },
  { label: "Profile", icon: <UserCircle2 className="h-4 w-4" />, path: "/agent/profile" },
];

export default function AgentLayout() {
  return (
    <DashboardLayout sidebarItems={sidebarItems} title="Agent Dashboard">
      <Outlet />
    </DashboardLayout>
  );
}
