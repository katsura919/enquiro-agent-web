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
  Camera,
  Upload,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";
import api from "@/utils/api";
import { toast } from "sonner";

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

interface Escalation {
  _id: string;
  caseNumber: string;
  customerName: string;
  customerEmail: string;
  concern: string;
  status: "escalated" | "pending" | "resolved";
  createdAt: string;
}

export default function ViewProfileTab() {
  const { user } = useAuth();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [counts, setCounts] = useState<CountData | null>(null);
  const [ratingStats, setRatingStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Escalations state
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [escalationsLoading, setEscalationsLoading] = useState(false);
  const [escalationsPage, setEscalationsPage] = useState(1);
  const [escalationsTotalPages, setEscalationsTotalPages] = useState(1);

  // Image upload modal state
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);

  useEffect(() => {
    if (user?._id && user?.businessId) {
      loadAgentDetails();
      loadAgentRatings();
      loadAgentEscalations();
    }
  }, [user?._id, user?.businessId]);

  useEffect(() => {
    if (user?._id) {
      loadAgentEscalations();
    }
  }, [escalationsPage, user?._id]);

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

  const loadAgentEscalations = async () => {
    try {
      setEscalationsLoading(true);
      const agentId = user?._id;
      if (!agentId) return;

      console.log('Fetching escalations for agent ID:', agentId, 'page:', escalationsPage);
      
      const response = await api.get(`/escalation/agent/${agentId}`, {
        params: { 
          limit: 10, // Show 10 escalations per page
          page: escalationsPage,
          status: 'all' 
        }
      });
      
      setEscalations(response.data.escalations || []);
      setEscalationsTotalPages(response.data.totalPages || 1);
      console.log('Agent escalations loaded:', response.data.escalations);
    } catch (err: any) {
      console.error('Failed to load agent escalations:', err);
      // Don't show error for escalations, just keep empty array
      setEscalations([]);
    } finally {
      setEscalationsLoading(false);
    }
  };

  const handleEscalationsPageChange = (newPage: number) => {
    setEscalationsPage(newPage);
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

  // Handle file selection
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setOriginalFile(file);
      setShowImageModal(true);
    };
    reader.readAsDataURL(file);
  };

  // Handle image upload
  const handleImageUpload = async () => {
    if (!originalFile) {
      toast.error('Please select an image');
      return;
    }

    try {
      setUploadingImage(true);
      
      const formData = new FormData();
      formData.append('profilePicture', originalFile);

      const response = await api.post('/agent/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.profilePic) {
        setAgent(prev => prev ? { ...prev, profilePic: response.data.profilePic } : null);
        toast.success('Profile picture updated successfully!');
        setShowImageModal(false);
        setSelectedImage(null);
        setOriginalFile(null);
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error('Failed to upload profile picture. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowImageModal(false);
    setSelectedImage(null);
    setOriginalFile(null);
  };

  const handleProfilePictureDelete = async () => {
    if (!agent?.profilePic) return;

    try {
      setUploadingImage(true);
      
      await api.delete('/agent/profile-picture');
      
      // Update agent state to remove profile picture
      setAgent(prev => prev ? { ...prev, profilePic: undefined } : null);
      toast.success('Profile picture deleted successfully!');
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      toast.error('Failed to delete profile picture. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const triggerFileInput = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    };
    fileInput.click();
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

  const formatTableDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusInfo = (status: Escalation['status']) => {
    switch (status) {
      case 'escalated':
        return { 
          text: 'Escalated', 
          className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-800' 
        };
      case 'pending':
        return { 
          text: 'Pending', 
          className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800' 
        };
      case 'resolved':
        return { 
          text: 'Resolved', 
          className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800' 
        };
      default:
        return { 
          text: status, 
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-800' 
        };
    }
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
            <Card className="overflow-hidden border-muted-gray shadow-none">
              <CardContent className="p-0">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 px-6 py-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative group">
                      <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                        <AvatarImage src={agent.profilePic} alt={agent.name} />
                        <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {getInitials(agent.name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Profile Picture Upload/Delete Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={triggerFileInput}
                            disabled={uploadingImage}
                            className="h-8 w-8 rounded-full p-0"
                          >
                            {uploadingImage ? (
                              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Camera className="h-4 w-4" />
                            )}
                          </Button>
                          {agent.profilePic && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={handleProfilePictureDelete}
                              disabled={uploadingImage}
                              className="h-8 w-8 rounded-full p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {/* Upload indicator */}
                      {uploadingImage && (
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                          <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs">
                            Uploading...
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Profile Picture Actions for Mobile */}
                    <div className="mt-2 flex gap-2 md:hidden">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={triggerFileInput}
                        disabled={uploadingImage}
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Upload
                      </Button>
                      {agent.profilePic && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleProfilePictureDelete}
                          disabled={uploadingImage}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      )}
                    </div>

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
              <Card className="border-muted-gray shadow-none">
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

              <Card className="border-muted-gray shadow-none">
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

              <Card className="border-muted-gray shadow-none">
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

            {/* Escalations Table */}
            <Card className="bg-card shadow-none border-muted-gray">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-secondary-foreground">
                  <MessageSquare className="h-4 w-4" />
                  Recent Escalations
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="bg-card border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="h-9 text-xs">Case #</TableHead>
                        <TableHead className="h-9 text-xs">Customer</TableHead>
                        <TableHead className="h-9 text-xs">Concern</TableHead>
                        <TableHead className="h-9 text-xs">Status</TableHead>
                        <TableHead className="h-9 text-xs">Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {escalationsLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-[300px]">
                            <div className="flex items-center justify-center h-full">
                              <div className="text-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                                <span className="mt-2 text-xs text-muted-foreground block">Loading...</span>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : escalations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-[300px]">
                            <div className="flex items-center justify-center h-full">
                              <div className="text-center">
                                <Mail className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                                <span className="text-sm text-muted-foreground">No escalations assigned</span>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        escalations.map((escalation) => {
                          const statusInfo = getStatusInfo(escalation.status);
                          return (
                            <TableRow 
                              key={escalation._id}
                              className="cursor-pointer hover:bg-muted/50 transition-colors"
                            >
                              <TableCell className="font-mono text-xs font-medium py-3">
                                #{escalation.caseNumber}
                              </TableCell>
                              <TableCell className="py-3">
                                <div className="flex items-center gap-2 min-w-0">
                                  <User className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                  <span className="font-medium text-sm truncate">{escalation.customerName}</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-3">
                                <div className="max-w-[250px] truncate">
                                  <span className="text-sm">{escalation.concern || 'No concern'}</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-3">
                                <div className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusInfo.className}`}>
                                  {statusInfo.text}
                                </div>
                              </TableCell>
                              <TableCell className="py-3">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                  <span className="text-xs text-muted-foreground">{formatTableDate(escalation.createdAt)}</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Compact Pagination */}
                {escalations.length > 0 && escalationsTotalPages > 1 && (
                  <div className="flex items-center justify-between mt-3 px-1">
                    <div className="text-xs text-muted-foreground">
                      Page {escalationsPage} of {escalationsTotalPages}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={escalationsPage <= 1}
                        onClick={() => handleEscalationsPageChange(escalationsPage - 1)}
                        className="h-7 px-2 text-xs"
                      >
                        Previous
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={escalationsPage >= escalationsTotalPages}
                        onClick={() => handleEscalationsPageChange(escalationsPage + 1)}
                        className="h-7 px-2 text-xs"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Image Upload and Preview Modal */}
        <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Preview Profile Picture
              </DialogTitle>
              <DialogDescription>
                Preview your selected image before uploading it as your profile picture.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {selectedImage && (
                <div className="relative w-full flex justify-center p-4 bg-muted/30 rounded-lg">
                  <div className="relative max-w-[400px] w-full">
                    <img
                      alt="Image preview"
                      src={selectedImage}
                      className="w-full h-auto max-h-[350px] object-contain rounded-lg border-2 border-border shadow-sm"
                    />
                    <div className="absolute inset-0 border-2 border-dashed border-primary/50 rounded-lg pointer-events-none opacity-60" />
                  </div>
                </div>
              )}
              

            </div>

            <DialogFooter className="flex-col sm:flex-row gap-3 pt-4">
              <Button 
                onClick={triggerFileInput}
                variant="outline"
                disabled={uploadingImage}
                className="w-full sm:w-auto cursor-pointer"
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose Image
              </Button>
              <Button 
                onClick={handleImageUpload}
                disabled={!originalFile || uploadingImage}
                className="w-full sm:w-auto cursor-pointer"
              >
                {uploadingImage ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save 
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
