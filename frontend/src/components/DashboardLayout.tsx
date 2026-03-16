import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Bell, ChevronDown, LogOut, User, MessageSquare, CheckCircle2 } from "lucide-react";
import logo from "@/assets/logo.svg";
import { Button } from "@/components/ui/button";
import { io, Socket } from "socket.io-client";
import { customerAPI, agentAPI } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarItem {
  label: string;
  icon: ReactNode;
  path: string;
}

interface DashboardLayoutProps {
  children: ReactNode;
  sidebarItems: SidebarItem[];
  title: string;
}

type NotificationType = "chat" | "booking";

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  targetPath: string;
  bookingId?: string;
  createdAt: string;
  isRead: boolean;
}

const MAX_NOTIFICATIONS = 20;

export function DashboardLayout({ children, sidebarItems, title }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("cleanmate_token");

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  // Track current path in a ref so socket handlers always read the latest value
  // without needing to reconnect the socket on every navigation.
  const locationPathRef = useRef(location.pathname);
  useEffect(() => {
    locationPathRef.current = location.pathname;
  }, [location.pathname]);

  const notificationStorageKey = useMemo(() => {
    if (!user) return null;
    const userId = user.id || (user as any)?._id;
    return `cleanmate_notifications_${user.role}_${userId}`;
  }, [user]);

  const mergeNotifications = (current: NotificationItem[], incoming: NotificationItem[]) => {
    const byId = new Map<string, NotificationItem>();

    [...current, ...incoming].forEach((item) => {
      const existing = byId.get(item.id);
      if (!existing) {
        byId.set(item.id, item);
        return;
      }

      byId.set(item.id, {
        ...existing,
        ...item,
        isRead: existing.isRead && item.isRead,
      });
    });

    return Array.from(byId.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, MAX_NOTIFICATIONS);
  };

  const upsertNotifications = (incoming: NotificationItem[] | ((prev: NotificationItem[]) => NotificationItem[])) => {
    setNotifications((prev) => {
      const next = typeof incoming === "function" ? incoming(prev) : mergeNotifications(prev, incoming);
      if (notificationStorageKey) {
        localStorage.setItem(notificationStorageKey, JSON.stringify(next));
      }
      return next;
    });
  };

  useEffect(() => {
    if (!user || !token) return;

    let socket: Socket | null = null;

    if (notificationStorageKey) {
      const storedNotifications = localStorage.getItem(notificationStorageKey);
      if (storedNotifications) {
        try {
          setNotifications(JSON.parse(storedNotifications));
        } catch {
          setNotifications([]);
        }
      } else {
        setNotifications([]);
      }
    }

    const setupMessageNotifications = async () => {
      try {
        let response;
        if (user.role === "customer") {
          response = await customerAPI.getBookings();
        } else if (user.role === "agent") {
          response = await agentAPI.getRequests();
        }

        const activeChats = (response?.data || []).filter((b: any) =>
          (user.role === "customer" && b.agentId && ["approved", "in-progress"].includes(b.status)) ||
          (user.role === "agent" && ["approved", "in-progress"].includes(b.status) && b.customerId)
        );

        const bookingNotifications: NotificationItem[] = (response?.data || [])
          .filter((b: any) => ["approved", "in-progress", "completed", "rejected"].includes(b.status))
          .map((b: any) => {
            const bookingId = b._id || b.id;
            const statusTitle = b.status === "approved"
              ? "Booking Approved"
              : b.status === "in-progress"
                ? "Service Started"
                : b.status === "completed"
                  ? "Service Completed"
                  : "Booking Update";

            const userTargetPath = user.role === "customer"
              ? (b.status === "completed" || b.status === "rejected" ? "/customer/history" : `/customer/messages/${bookingId}`)
              : "/agent/requests";

            return {
              id: `booking-${bookingId}-${b.status}`,
              type: "booking" as const,
              title: statusTitle,
              description: `${b.serviceType} is currently ${b.status.replace("-", " ")}.`,
              targetPath: userTargetPath,
              bookingId,
              createdAt: b.updatedAt || b.createdAt || new Date().toISOString(),
              isRead: true,
            };
          });

        upsertNotifications(bookingNotifications);

        if (!activeChats.length) return;

        socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
          auth: { token },
          transports: ["websocket"],
        });

        socket.on("connect", () => {
          activeChats.forEach((chat: any) => {
            const roomId = `booking_${chat._id || chat.id}`;
            socket?.emit("join_room", roomId);
          });
        });

        socket.on("chat_history", (history: any[]) => {
          if (!Array.isArray(history) || history.length === 0) return;

          const myId = user.id || (user as any)?._id;
          const latestIncoming = [...history]
            .reverse()
            .find((msg: any) => {
              const senderId = typeof msg?.senderId === "string" ? msg.senderId : msg?.senderId?._id;
              return !msg?.isAiMessage && !!senderId && senderId !== myId;
            });

          if (!latestIncoming) return;

          const bookingId = typeof latestIncoming?.roomId === "string" && latestIncoming.roomId.startsWith("booking_")
            ? latestIncoming.roomId.replace("booking_", "")
            : undefined;

          const historyNotification: NotificationItem = {
            id: `chat-${latestIncoming?._id || `${Date.now()}`}`,
            type: "chat",
            title: "New Message",
            description: (latestIncoming?.text || "You received a new message").slice(0, 80),
            targetPath: bookingId ? `/${user.role}/messages/${bookingId}` : `/${user.role}/messages`,
            bookingId,
            createdAt: latestIncoming?.createdAt || new Date().toISOString(),
            isRead: locationPathRef.current.includes("/messages"),
          };

          upsertNotifications((prev) => mergeNotifications(prev, [historyNotification]));
        });

        socket.on("new_message", (msg: any) => {
          const senderId = typeof msg?.senderId === "string" ? msg.senderId : msg?.senderId?._id;
          const myId = user.id || (user as any)?._id;
          const isFromOtherUser = !!senderId && senderId !== myId;
          const bookingId = typeof msg?.roomId === "string" && msg.roomId.startsWith("booking_")
            ? msg.roomId.replace("booking_", "")
            : undefined;

          if (!msg?.isAiMessage && isFromOtherUser) {
            const chatNotification: NotificationItem = {
              id: `chat-${msg?._id || `${Date.now()}`}`,
              type: "chat",
              title: "New Message",
              description: (msg?.text || "You received a new message").slice(0, 80),
              targetPath: bookingId ? `/${user.role}/messages/${bookingId}` : `/${user.role}/messages`,
              bookingId,
              createdAt: msg?.createdAt || new Date().toISOString(),
              isRead: locationPathRef.current.includes("/messages"),
            };

            upsertNotifications((prev) => mergeNotifications(prev, [chatNotification]));
          }
        });
      } catch {
        // Keep dashboard usable even if notification setup fails.
      }
    };

    setupMessageNotifications();

    return () => {
      socket?.disconnect();
    };
  }, [user, token, notificationStorageKey]);

  useEffect(() => {
    if (location.pathname.includes("/messages")) {
      upsertNotifications((prev) => {
        const next = prev.map((notification) =>
          notification.type === "chat" ? { ...notification, isRead: true } : notification
        );
        return next;
      });
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    upsertNotifications((prev) =>
      prev.map((item) =>
        item.id === notification.id ? { ...item, isRead: true } : item
      )
    );
    navigate(notification.targetPath);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar - CleanMate Theme */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#1a2e1a] text-white border-r border-white/10 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Logo Area */}
        <div className="flex items-center justify-center gap-3 pt-10 pb-8 border-b border-white/5">
          <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shadow-lg overflow-hidden">
            <img src={logo} alt="CleanMate" className="h-8 w-8" />
          </div>
          <span className="text-2xl font-display font-bold tracking-tight text-white">
            CleanMate
          </span>
        </div>

        {/* User Profile Area */}
        <div className="px-6 py-8 flex flex-col items-center text-center border-b border-white/5">
          <div className="relative mb-4">
            <div className="h-20 w-20 rounded-full bg-white/5 border-2 border-white/20 shadow-2xl flex items-center justify-center text-xl font-bold text-white overflow-hidden p-1">
               <img src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.fullName || "U")}`} alt="Profile" className="h-full w-full object-cover rounded-full" />
            </div>
            <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-[#97BC62] border-4 border-[#1a2e1a]"></span>
          </div>
          <p className="text-md font-bold text-white truncate w-full">{user?.fullName}</p>
          <p className="text-xs text-white/40 uppercase tracking-widest font-semibold mt-1">{user?.role}</p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto no-scrollbar">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 group relative ${
                  isActive
                    ? "text-[#1a2e1a] bg-[#97BC62] shadow-lg shadow-[#97BC62]/20"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className={`${isActive ? "text-[#1a2e1a]" : "text-white/40 group-hover:text-white"} transition-colors`}>
                  {item.icon}
                </div>
                <span className="font-semibold">{item.label}</span>
                {isActive && (
                   <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#1a2e1a]" />
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Top Navbar */}
        <header className="h-[80px] bg-[#1a2e1a] border-b border-white/5 flex items-center justify-between px-8 shrink-0 relative z-10 shadow-xl">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-white/80 hover:text-white transition-colors" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-xl font-display font-bold text-white tracking-wide">{title}</h1>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-medium hidden sm:block">Deep Cleaning Excellence</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  className="relative text-white/60 hover:text-white hover:bg-white/5 rounded-2xl h-11 w-11 transition-all"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#97BC62] text-[#1a2e1a] text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#1a2e1a]">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[360px] mt-3 rounded-2xl border-white/10 bg-[#1a2e1a] text-white shadow-2xl p-2">
                <div className="px-4 py-3 border-b border-white/5 mb-2 flex items-center justify-between">
                  <p className="text-sm font-bold">Notifications</p>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#97BC62]">{unreadCount} new</span>
                  )}
                </div>

                <div className="max-h-[360px] overflow-y-auto no-scrollbar space-y-1 px-1 pb-1">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-xs font-bold text-white/40 uppercase tracking-widest">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => handleNotificationClick(notification)}
                        className="w-full text-left p-3 rounded-xl hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                            {notification.type === "chat" ? (
                              <MessageSquare className="h-4 w-4 text-[#97BC62]" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-[#97BC62]" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-bold leading-tight">{notification.title}</p>
                              {!notification.isRead && (
                                <span className="h-2 w-2 rounded-full bg-[#97BC62] mt-1.5 shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-white/50 mt-1 line-clamp-2">{notification.description}</p>
                            <p className="text-[10px] text-white/30 mt-1.5 font-black uppercase tracking-wider">
                              {new Date(notification.createdAt).toLocaleString([], {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-3 pl-2 pr-5 h-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all shadow-inner">
                  <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 overflow-hidden shadow-lg">
                    <img src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.fullName || "U")}`} alt="Profile" className="h-full w-full object-cover" />
                  </div>
                  <div className="hidden sm:flex flex-col items-start gap-0">
                    <span className="text-sm font-bold leading-none">{user?.fullName?.split(' ')[0]}</span>
                    <span className="text-[9px] text-white/40 font-medium uppercase mt-0.5">Online</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-white/40" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 mt-3 rounded-2xl border-white/10 bg-[#1a2e1a] text-white shadow-2xl p-2">
                <div className="px-4 py-4 border-b border-white/5 mb-2">
                  <p className="text-sm font-bold truncate">{user?.fullName}</p>
                  <p className="text-xs text-white/40 truncate">{user?.email}</p>
                </div>
                <DropdownMenuItem className="gap-3 rounded-xl cursor-pointer hover:bg-white/5 focus:bg-white/5 focus:text-white p-3">
                  <User className="h-4 w-4 text-[#97BC62]" /> <span className="text-sm font-medium">Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5 my-2" />
                <DropdownMenuItem onClick={handleLogout} className="gap-3 rounded-xl cursor-pointer text-red-400 hover:bg-red-500/10 focus:bg-red-500/20 focus:text-red-400 p-3">
                  <LogOut className="h-4 w-4" /> <span className="text-sm font-medium">Log out Session</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto no-scrollbar bg-slate-50/50">
          {children}
        </main>
      </div>
    </div>
  );
}
