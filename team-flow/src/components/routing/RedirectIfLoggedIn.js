import { useAuth } from "../../contexts/AuthContext";
import { useLocation } from "react-router-dom";
import React from "react";
import { Navigate } from "react-router-dom";

export default function RedirectIfLoggedIn({ children }) {
    const { currentUser } = useAuth();
    const location = useLocation(); 

    if (currentUser) {
        return <Navigate to="/" />;
      }

    return children;
  }
  