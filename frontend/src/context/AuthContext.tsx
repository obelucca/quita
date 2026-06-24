"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";
import { authService } from "@/services/auth.service";
import { LoginInput, RegisterInput } from "@/schemas";
import * as authHelper from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for token on mount
    const savedToken = authHelper.getToken();
    if (savedToken) {
      const decoded = parseJwt(savedToken);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        const savedName = localStorage.getItem("quita_user_name") || decoded.email.split("@")[0];
        setToken(savedToken);
        setUser({
          id: decoded.sub,
          email: decoded.email,
          name: savedName,
          role: decoded.role || "USER",
        });
      } else {
        // Token expired
        authHelper.logout();
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      authHelper.logout();
      setUser(null);
      setToken(null);
      if (typeof window !== "undefined") {
        window.location.href = "/auth?expired=true";
      }
    };

    window.addEventListener("unauthorized-api-call", handleUnauthorized);
    return () => {
      window.removeEventListener("unauthorized-api-call", handleUnauthorized);
    };
  }, []);

  const login = async (data: LoginInput) => {
    setLoading(true);
    try {
      const response = await authService.login(data);
      const decoded = parseJwt(response.token);
      if (decoded) {
        authHelper.saveToken(response.token);
        // If name wasn't saved, use email prefix
        const name = localStorage.getItem("quita_user_name") || decoded.email.split("@")[0];
        setToken(response.token);
        setUser({
          id: decoded.sub,
          email: decoded.email,
          name: name,
          role: decoded.role || "USER",
        });
      } else {
        throw new Error("Token JWT inválido recebido do servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterInput) => {
    setLoading(true);
    try {
      // Register new user
      await authService.register(data);
      // Save name for later display
      localStorage.setItem("quita_user_name", data.name);
      // Auto login after registration
      await login({ email: data.email, password: data.password });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authHelper.logout();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
