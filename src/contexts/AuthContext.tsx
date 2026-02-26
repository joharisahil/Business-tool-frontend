import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/authApi";

interface User {
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
} 

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // useEffect(() => {
  //   const storedUser =
  //     localStorage.getItem("user") || sessionStorage.getItem("user");
  //   if (storedUser) {
  //     setUser(JSON.parse(storedUser));
  //   }
  // }, []);
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


const login = async (email: string, password: string) => {
  const response = await api.post("/auth/login", { email, password });

  const { token, user } = response.data;

  // Use localStorage for persistent login
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("hotelId", user.hotel_id);
  localStorage.setItem("role", user.role);

  setUser(user);
};


const logout = () => {
  setUser(null);

  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("hotelId");
  localStorage.removeItem("role");

  sessionStorage.clear(); // optional

  navigate("/login", { replace: true });
};


  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
