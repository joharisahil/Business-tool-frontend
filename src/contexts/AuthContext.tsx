import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/authApi";

interface User {
  _id: string;
  email: string;
  name: string;
  role: "admin" ;
  organizationId: string;
  gstNumber?: string;
  phone?: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
 
  role: "admin" ;
  phone?: string;
  gstNumber?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  // ✅ LOGIN
  const login = async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });

    const { user, token } = response.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("organizationId", user.organizationId);
    localStorage.setItem("role", user.role);

    setUser(user);
  };

  // ✅ REGISTER
  const register = async (data: RegisterData) => {
    const response = await api.post("/auth/register", data);

    const { user, token } = response.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("organizationId", user.organizationId);
    localStorage.setItem("role", user.role);

    setUser(user);
  };

  // ✅ LOGOUT
  const logout = () => {
    setUser(null);

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("organizationId");
    localStorage.removeItem("role");

    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};