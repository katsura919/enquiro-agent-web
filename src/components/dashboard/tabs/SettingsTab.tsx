"use client";
import { Tab } from "@/context/TabsContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Monitor,
  Save,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import { agentService, AgentProfile } from "@/services/agentService";
import { toast } from "@/hooks/useToast";

interface SettingsTabProps {
  tab: Tab;
}

export function SettingsTab({ tab }: SettingsTabProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [agent, setAgent] = useState<AgentProfile | null>(null);
  
  // Profile form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Password visibility state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Validation errors
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Fetch agent profile
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await agentService.getProfile();
      setAgent(data);
      setName(data.name);
      setPhone(data.phone || "");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const validateName = (value: string): boolean => {
    if (!value.trim()) {
      setNameError("Name is required");
      return false;
    }
    if (value.trim().length < 2) {
      setNameError("Name must be at least 2 characters");
      return false;
    }
    setNameError("");
    return true;
  };

  const validatePhone = (value: string): boolean => {
    if (value && !/^\+?[\d\s\-()]{10,}$/.test(value)) {
      setPhoneError("Please enter a valid phone number");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const handleSaveProfile = async () => {
    // Validate fields
    const isNameValid = validateName(name);
    const isPhoneValid = validatePhone(phone);
    
    if (!isNameValid || !isPhoneValid) {
      toast.error("Please fix validation errors");
      return;
    }

    try {
      setSaving(true);
      const updatedAgent = await agentService.updateProfile({
        name,
        phone,
      });
      setAgent(updatedAgent);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const validatePassword = (): boolean => {
    setPasswordError("");
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required");
      return false;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long");
      return false;
    }

    if (newPassword.length > 50) {
      setPasswordError("Password must be less than 50 characters");
      return false;
    }

    if (!/(?=.*[a-z])/.test(newPassword)) {
      setPasswordError("Password must contain at least one lowercase letter");
      return false;
    }

    if (!/(?=.*[A-Z])/.test(newPassword)) {
      setPasswordError("Password must contain at least one uppercase letter");
      return false;
    }

    if (!/(?=.*\d)/.test(newPassword)) {
      setPasswordError("Password must contain at least one number");
      return false;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return false;
    }

    if (currentPassword === newPassword) {
      setPasswordError("New password must be different from current password");
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) {
      return;
    }

    try {
      setChangingPassword(true);
      await agentService.changePassword({
        currentPassword,
        newPassword,
      });
      
      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("");
      
      // Hide passwords again
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      
      toast.success("Password changed successfully");
    } catch (error: any) {
      setPasswordError(error.response?.data?.error || "Failed to change password");
      toast.error(error.response?.data?.error || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        {/* Profile Settings */}
        <Card className="bg-card border-muted-gray shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Settings
            </CardTitle>
            <CardDescription>
              Update your personal information and profile details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  validateName(e.target.value);
                }}
                className={nameError ? "border-red-500" : ""}
              />
              {nameError && (
                <p className="text-xs text-red-500">{nameError}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Enter your email"
                value={agent?.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input 
                id="phone" 
                type="tel" 
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  validatePhone(e.target.value);
                }}
                className={phoneError ? "border-red-500" : ""}
              />
              {phoneError && (
                <p className="text-xs text-red-500">{phoneError}</p>
              )}
            </div>
            <Button 
              onClick={handleSaveProfile} 
              disabled={saving}
              className="cursor-pointer"
              >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Save Profile
                </>
              )}
            </Button>
          </CardContent>
        </Card>


        {/* Security Settings */}
        <Card className="bg-card border-muted-gray shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security
            </CardTitle>
            <CardDescription>
              Manage your account security and privacy settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input 
                  id="currentPassword" 
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    setPasswordError("");
                  }}
                  placeholder="Enter current password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input 
                  id="newPassword" 
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordError("");
                  }}
                  placeholder="Enter new password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Must be at least 6 characters with uppercase, lowercase, and number
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input 
                  id="confirmPassword" 
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordError("");
                  }}
                  placeholder="Confirm new password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            {passwordError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{passwordError}</p>
              </div>
            )}
            <Button 
              onClick={handleChangePassword}
              disabled={changingPassword}
              className="cursor-pointer"
            >
              {changingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Changing...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
