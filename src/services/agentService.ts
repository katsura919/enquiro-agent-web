import api from "@/utils/api";

export interface AgentProfile {
  _id: string;
  businessId: string;
  name: string;
  email: string;
  phone?: string;
  profilePic?: string;
  role: string;
  createdAt: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  profilePic?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const agentService = {
  // Get current agent's profile
  async getProfile(): Promise<AgentProfile> {
    const response = await api.get("/agent/info");
    return response.data;
  },

  // Update current agent's profile
  async updateProfile(data: UpdateProfileData): Promise<AgentProfile> {
    const response = await api.put("/agent/profile", data);
    return response.data;
  },

  // Change password
  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    const response = await api.post("/agent/change-password", data);
    return response.data;
  },
};
