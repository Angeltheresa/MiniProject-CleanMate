export type UserRole = "customer" | "agent" | "admin";

export interface User {
  id: string;
  fullName: string;
  email?: string;
  username: string;
  role: UserRole;
  phone: string;
  address: string;
  avatar?: string;
  googleId?: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
}

export interface Booking {
  id: string;
  _id?: string;
  serviceType: string;
  variant: string;
  date: string;
  status: "pending" | "approved" | "in-progress" | "completed" | "rejected";
  amount: number;
  customerId: string;
  agentId?: string;
  customerName?: string;
  agentName?: string;
  isEmergency?: boolean;
  address?: string;
}

export interface Agent {
  id: string;
  userId?: string;
  name: string;
  rating: number;
  available: boolean;
  specialization: string;
  completedJobs: number;
  avatar?: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  address?: string;
  distanceKm?: number | null;
}

export interface ChatContact {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar?: string;
}

export interface ChatMessage {
  id: string;
  _id?: string;
  text: string;
  sender: "me" | "other";
  senderId?: any;
  time: string;
  isAiMessage?: boolean;
  createdAt?: string;
}

export interface Complaint {
  id: string;
  _id?: string;
  subject: string;
  description: string;
  status: "pending" | "in-progress" | "resolved";
  date: string;
  userId: string;
  userName?: string;
  createdAt?: string;
}

export interface ServiceRequest {
  id: string;
  _id?: string;
  customerName: string;
  serviceType: string;
  variant: string;
  date: string;
  status: "pending" | "approved" | "rejected";
  address: string;
  amount?: number;
}

export interface TrackingStep {
  label: string;
  status: "done" | "current" | "upcoming";
}

export interface DashboardStats {
  active: number;
  completed: number;
  pending: number;
  totalSpent: number;
}

export interface AgentDashboardStats {
  pendingRequests: number;
  activeJobs: number;
  completedJobs: number;
  rating: number;
}

export interface AdminDashboardData {
  stats: {
    totalUsers: number;
    totalAgents: number;
    totalBookings: number;
    pendingComplaints: number;
  };
  revenue: number;
  activeServices: number;
  activeAgents: number;
  satisfaction: number;
}

export interface AnalyticsData {
  categories: { label: string; value: number }[];
  revenue: { month: string; amount: number }[];
}

export interface AgentProfileDetails {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  address?: string;
  phone?: string;
  specialization: string;
  rating: number;
  completedJobs: number;
  available: boolean;
  portfolioImages: string[];
}

export interface AgentReview {
  id: string;
  rating: number;
  comment: string;
  customerName: string;
  customerAvatar?: string;
  createdAt: string;
}

export interface ReviewStatus {
  bookingId: string;
  hasReview: boolean;
  canReview: boolean;
  agentId?: string;
}
