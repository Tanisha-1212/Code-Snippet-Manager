import { createContext, useState, useEffect, useContext } from "react";
import axiosInstance from "../utils/axiosInstance";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data } = await axiosInstance.get("auth/me");
      
      if (data && data._id) {
        setUser(data);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      // 401 means not authenticated - this is normal
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    try {
      const { data } = await axiosInstance.post("auth/register", {
        username,
        email,
        password,
      });
      
      if (data && data._id) {
        setUser(data);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, error: "Registration failed" };
      }
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      return { success: false, error: message };
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await axiosInstance.post("auth/login", {
        email,
        password,
      });
      
      if (data && data._id) {
        setUser(data);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, error: "Login failed" };
      }
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post("auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear user state even if logout request fails
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateProfile = async (profileData) => {
  setLoading(true);
  setError(null);
  try {
    // Create FormData for file upload support
    const formData = new FormData();
    
    // Append text fields if they exist
    if (profileData.username) formData.append('username', profileData.username);
    if (profileData.email) formData.append('email', profileData.email);
    if (profileData.bio !== undefined) formData.append('bio', profileData.bio);
    
    // Append profile picture file if exists
    // FIXED: Changed from 'profilePicture' to 'profilePic' to match backend
    if (profileData.profilePicture instanceof File) {
      formData.append('profilePic', profileData.profilePicture);
    }

    // DEBUG: Log what we're sending
    console.log('=== SENDING TO BACKEND ===');
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }
    console.log('========================');

    const { data } = await axiosInstance.put('auth/profile', formData, {
      headers: {
        // Remove Content-Type header - let axios/browser set it with proper boundary
        // 'Content-Type': 'multipart/form-data'
      }
    });

    // Update user state with new data
    if (data.success && data.user) {
      setUser(data.user);
      return { success: true, data: data.user };
    }

    return { success: false, error: 'Failed to update profile' };
  } catch (err) {
    const message = err.response?.data?.message || 'Failed to update profile';
    setError(message);
    console.error('Error updating profile:', err);
    return { success: false, error: message };
  } finally {
    setLoading(false);
  }
};

// Change password
const changePassword = async (currentPassword, newPassword, confirmPassword) => {
  setLoading(true);
  setError(null);
  try {
    const { data } = await axiosInstance.put('auth/change-password', {
      currentPassword,
      newPassword,
      confirmPassword
    });

    if (data.success) {
      return { success: true, message: data.message };
    }

    return { success: false, error: 'Failed to change password' };
  } catch (err) {
    const message = err.response?.data?.message || 'Failed to change password';
    setError(message);
    console.error('Error changing password:', err);
    return { success: false, error: message };
  } finally {
    setLoading(false);
  }
};

// Delete account
const deleteAccount = async (password, confirmation) => {
  setLoading(true);
  setError(null);
  try {
    const { data } = await axiosInstance.delete('auth/account', {
      data: { password, confirmation }
    });

    if (data.success) {
      // Clear user state after successful deletion
      setUser(null);
      setIsAuthenticated(false);
      return { success: true, message: data.message };
    }

    return { success: false, error: 'Failed to delete account' };
  } catch (err) {
    const message = err.response?.data?.message || 'Failed to delete account';
    setError(message);
    console.error('Error deleting account:', err);
    return { success: false, error: message };
  } finally {
    setLoading(false);
  }
};

  const value = {
    user,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
    updateProfile,          
    changePassword,         
    deleteAccount, 
    refreshAuth: checkAuth, // Renamed from getProfile for clarity
    setError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};