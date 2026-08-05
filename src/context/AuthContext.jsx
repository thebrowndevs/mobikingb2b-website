"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { refreshTokenApi } from "../lib/services/operations/LoginApi";
import { Loader2 } from "lucide-react";
import { toast } from "sonner"; // <-- Import toast
import HomeBanners from './../components/layout/Banner';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);
  const [homeBanners, setHomeBanners] = useState([])

  // Internal logout function that handles state/storage and shows a toast
  const _internalLogout = useCallback(({ message, type = "info" } = {}) => {
    console.log("AuthProvider: Logging out and clearing all tokens.");

    // Show toast message if provided
    if (message && type === "error") toast.error(message);
    if (message && type === "info") toast.info(message);
    if (message && type === "success") toast.success(message);

    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }, []);

  // --- Step 1: Initial Authentication Validation ---
  useEffect(() => {
    const initializeAndValidateAuth = async () => {
      console.log("AuthProvider: Initializing and validating auth...");
      const storedRefreshToken = localStorage.getItem("refreshToken");
      const storedUser = localStorage.getItem("user");

      if (!storedRefreshToken || !storedUser) {
        console.log(
          "AuthProvider: No refresh token found. User is not logged in."
        );
        setIsLoading(false);
        return;
      }

      try {
        console.log(
          "AuthProvider: Found a token, attempting to validate by refreshing..."
        );
        const response = await refreshTokenApi(storedRefreshToken);
        const { accessToken: newAccessToken, refreshToken: newRefreshToken, updatedUser } =
          response;

        console.log(
          "AuthProvider: Token validation successful. Setting new tokens."
        );
        setAccessToken(newAccessToken);
        setRefreshToken(newRefreshToken);
        const userToSet = updatedUser || JSON.parse(storedUser);
        setUser(userToSet);

        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);
        localStorage.setItem("user", JSON.stringify(userToSet));
      } catch (error) {
        console.error(
          "AuthProvider: Initial token validation failed. Forcing logout.",
          error
        );
        // Automatically log out with an error toast
        _internalLogout({
          message: "Your session has expired. Please log in again.",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeAndValidateAuth();
  }, [_internalLogout]); // Depends on the stable internal logout function

  // --- Step 2: Set up a recurring token refresh ---
  useEffect(() => {
    if (!refreshToken) {
      return;
    }
    console.log("AuthProvider: Setting up periodic token refresh interval.");

    const refresh = async () => {
      console.log("AuthProvider (Interval): Refreshing access token...");
      try {
        const response = await refreshTokenApi(refreshToken);

        // console.log("Refresh token response: ", response);
        if (!response) {
          throw new Error("Refresh token failed");
        }

        // console.log("Refresh token response: ", response?.data?.data);

        const { accessToken: newAccessToken, refreshToken: newRefreshToken, updatedUser } =
          response;

        setAccessToken(newAccessToken);
        setRefreshToken(newRefreshToken);
        if (updatedUser) {
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }

        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);
        console.log("AuthProvider (Interval): Token refreshed successfully.");
      } catch (error) {
        console.error(
          "AuthProvider (Interval): Token refresh failed. Logging out.",
          error
        );
        // Automatically log out with an error toast
        _internalLogout({
          message: "Your session has expired. Please log in again.",
          type: "error",
        });
      }
    };

    const intervalId = setInterval(refresh, 20 * 60 * 1000); // 20 minutes
    return () => {
      console.log("AuthProvider: Clearing token refresh interval.");
      clearInterval(intervalId);
    };
  }, [refreshToken, _internalLogout]);

  // 🔐 Login function with a success toast
  const login = async (userData) => {
    const {
      user: newUser,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    } = userData;

    setUser(newUser);
    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);

    localStorage.setItem("user", JSON.stringify(newUser));
    localStorage.setItem("accessToken", newAccessToken);
    localStorage.setItem("refreshToken", newRefreshToken);

    // Show a welcome toast on successful login
    toast.success(`Welcome back, ${newUser.phoneNo || "User"}`);
  };

  // 🔓 Exposed logout function for manual use (e.g., logout button)
  const logout = () => {
    _internalLogout({ message: "You have been logged out.", type: "info" });
  };

  // ✨ Optional: update user info without logout
  const updateUser = (updatedUser) => {
    setUser((prevUser) => ({ ...prevUser, ...updatedUser }));
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const value = {
    user,
    setUser,
    accessToken,
    token: accessToken,
    isLoading,
    isAuthenticated: !!accessToken,
    login,
    loginOpen, setLoginOpen,
    logout, // This is the clean, manual logout function
    updateUser,
    homeBanners,
    setHomeBanners
  };

  // if (isLoading) {
  //   return (
  //     <div className="flex justify-center items-center h-screen bg-background">
  //       <Loader2 className="h-12 w-12 animate-spin text-primary" />
  //     </div>
  //   );
  // }

  if (isLoading) console.log('Auth Loading')

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
