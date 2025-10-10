"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  MessageSquare,
  CheckCircle,
  Star,
  Award,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth";
import api from "@/utils/api";

interface Agent {
  _id: string;
  businessId: string;
  name: string;
  email: string;
  phone?: string;
  profilePic?: string;
  role: string;
  createdAt: string;
  deletedAt?: string | null;
}

interface AgentStats {
  totalSessions: number;
  activeSessions: number;
  resolvedSessions: number;
  averageResponseTime: number;
  customerRating: number;
  totalMessages: number;
}

interface CountData {
  totalCases: number;
  totalResolvedCases: number;
}

interface RatingStats {
  averageRating: number;
  totalRatings: number;
}

export default function ViewProfileTab() {
  const { user } = useAuth();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [counts, setCounts] = useState<CountData | null>(null);
  const [ratingStats, setRatingStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (user?._id && user?.businessId) {
      loadAgentDetails();
      loadAgentRatings();
    }
  }, [user?._id, user?.businessId]);

  const loadAgentDetails = async () => {
    try {
      setLoading(true);
      const agentId = user?._id;
      const businessId = user?.businessId;

      if (!agentId || !businessId) {
        console.error("Missing agentId or businessId");
        return;
      }

      // Fetch agent profile - use the same approach as Frontend
      // Get all agents from business and find the specific one
      let agentResponse;
      try {
        const businessAgentsResponse = await api.get(`/agent/${businessId}`, {
          params: { limit: 1000 },
        });
        const foundAgent = businessAgentsResponse.data.agents?.find(
          (agent: Agent) => agent._id === agentId
        );
        if (foundAgent) {
          agentResponse = { data: foundAgent };
        } else {
          throw new Error("Agent not found in business");
        }
      } catch (businessError) {
        console.error("Error fetching agent from business:", businessError);
        return;
      }

      if (agentResponse?.data) {
        setAgent(agentResponse.data);
        setEditForm({
          name: agentResponse.data.name || "",
          email: agentResponse.data.email || "",
          phone: agentResponse.data.phone || "",
        });
      }

      // Fetch agent stats
      try {
        const statsResponse = await api.get(`/agent/${agentId}/stats`);
        if (statsResponse.data) {
          setStats(statsResponse.data);
        }
      } catch (statsError) {
        console.log("Stats endpoint not available, using defaults");
        setStats({
          totalSessions: 0,
          activeSessions: 0,
          resolvedSessions: 0,
          averageResponseTime: 0,
          customerRating: 0,
          totalMessages: 0,
        });
      }

      // Fetch case counts
      try {
        const response = await api.get(`/escalation/agent/${agentId}`, {
          params: {
            limit: 1,
            page: 1,
            status: "all",
          },
        });

        if (response.data.counts) {
          setCounts({
            totalCases: response.data.counts.totalCases || 0,
            totalResolvedCases: response.data.counts.totalResolvedCases || 0,
          });
        }
      } catch (countError) {
        console.error("Error loading case counts:", countError);
        setCounts({
          totalCases: 0,
          totalResolvedCases: 0,
        });
      }
    } catch (error) {
      console.error("Error loading agent details:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAgentRatings = async () => {
    try {
      const agentId = user?._id;
      if (!agentId) return;

      const response = await api.get(`/agent-rating/agent/${agentId}`, {
        params: {
          limit: 1, // We only need the stats, not all ratings
        },
      });

      if (response.data.success && response.data.stats) {
        setRatingStats({
          averageRating: response.data.stats.averageRating || 0,
          totalRatings: response.data.stats.totalRatings || 0,
        });
      }
    } catch (error) {
      console.error("Error loading ratings:", error);
      setRatingStats({
        averageRating: 0,
        totalRatings: 0,
      });
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (agent) {
      setEditForm({
        name: agent.name || "",
        email: agent.email || "",
        phone: agent.phone || "",
      });
    }
  };

  const handleSave = async () => {
    try {
      const agentId = user?._id;
      const businessId = user?.businessId;

      const { data } = await api.put(
        `/agent/${agentId}/business/${businessId}`,
        editForm
      );

      if (data.success) {
        setAgent(data.agent);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const getInitials = (name: string) => {
    if (!name || typeof name !== "string") {
      return "NA";
    }
    return name
      .trim()
      .split(" ")
      .filter((word) => word.length > 0)
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "NA";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-2">
          <User className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="text-lg font-medium">Profile not found</p>
          <p className="text-sm text-muted-foreground">
            Unable to load your profile information
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6 bg-background">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Profile</h1>
            <p className="text-sm text-muted-foreground mt-1">
              View and manage your profile information
            </p>
          </div>
          {!isEditing ? (
            <Button onClick={handleEdit} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 px-6 py-8">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                      <AvatarImage src={agent.profilePic} alt={agent.name} />
                      <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {getInitials(agent.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="mt-4">
                      {isEditing ? (
                        <Input
                          value={editForm.name}
                          onChange={(e) => handleFormChange("name", e.target.value)}
                          className="text-center text-lg font-semibold bg-white dark:bg-gray-800"
                          placeholder="Your name"
                        />
                      ) : (
                        <h2 className="text-xl font-bold">{agent.name}</h2>
                      )}
                      <Badge variant="secondary" className="mt-2 capitalize">
                        {agent.role}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="px-6 py-4 space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide mb-3">
                      Contact Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <Label className="text-xs text-muted-foreground">
                            Email
                          </Label>
                          {isEditing ? (
                            <Input
                              value={editForm.email}
                              onChange={(e) =>
                                handleFormChange("email", e.target.value)
                              }
                              className="mt-1"
                              placeholder="Email address"
                            />
                          ) : (
                            <p className="text-sm font-medium break-all">
                              {agent.email}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <Label className="text-xs text-muted-foreground">
                            Phone
                          </Label>
                          {isEditing ? (
                            <Input
                              value={editForm.phone}
                              onChange={(e) =>
                                handleFormChange("phone", e.target.value)
                              }
                              className="mt-1"
                              placeholder="Phone number"
                            />
                          ) : (
                            <p className="text-sm font-medium">
                              {agent.phone || "Not provided"}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <Label className="text-xs text-muted-foreground">
                            Member Since
                          </Label>
                          <p className="text-sm font-medium">
                            {formatDate(agent.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats and Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                      <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {counts?.totalCases || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Cases</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {counts?.totalResolvedCases || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Resolved Cases
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-xl">
                      <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold">
                          {ratingStats?.averageRating
                            ? ratingStats.averageRating.toFixed(1)
                            : "0.0"}
                        </p>
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Avg Rating ({ratingStats?.totalRatings || 0} reviews)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <MessageSquare className="h-4 w-4" />
                      <span className="text-sm">Active Sessions</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {stats?.activeSessions || 0}
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Resolved Sessions</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {stats?.resolvedSessions || 0}
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Avg Response Time</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {stats?.averageResponseTime
                        ? `${stats.averageResponseTime.toFixed(1)}s`
                        : "N/A"}
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <MessageSquare className="h-4 w-4" />
                      <span className="text-sm">Total Messages</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {stats?.totalMessages || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Account Status</p>
                    <p className="text-sm text-muted-foreground">
                      Your account is active and in good standing
                    </p>
                  </div>
                  <Badge variant="default" className="bg-green-500">
                    Active
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Role</p>
                    <p className="text-sm text-muted-foreground">
                      Current role and permissions
                    </p>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {agent.role}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
