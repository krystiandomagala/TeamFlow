import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLocation } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const { currentUser, isEmailVerified } = useAuth();
  const location = useLocation(); 
  if (!currentUser) {
    return <Navigate to="/sign-in" />;
  }

  if (!isEmailVerified() && location.pathname !== "/verify") { // sprawdzanie lokalizacji aby uniknąć nieskończonej pętli
    return <Navigate to="/verify" />;
  }

  return children;
}