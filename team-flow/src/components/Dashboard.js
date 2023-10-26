import React, { useState, useEffect } from "react";
import { Card, Button, Alert, Row, Col, Container } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import MobileMenu from "./MobileMenu";

export default function Dashboard() {
  const [error, setError] = useState("");
  const { currentUser, logout } = useAuth();
  const [userData, setUserData] = useState(null); // state to hold the user data
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // Nowy state

  const navigate = useNavigate();

  async function handleLogout() {
    setError("");

    try {
      await logout();
      navigate("/");
    } catch {
      setError("Failed to log out.");
    }
  }

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  useEffect(() => {
    // Check if there's a logged-in user
    if (currentUser && currentUser.uid) {
      // Fetch user data from Firestore
      const docRef = db.collection("users").doc(currentUser.uid);
      const unsubscribe = docRef.onSnapshot((doc) => {
        if (doc.exists) {
          setUserData(doc.data()); // Set user data state
        } else {
          console.error("No user data found!");
        }
      });
      // Cleanup subscription on component unmount
      return unsubscribe;
    }
  }, [currentUser]);

  return (
    <>
      <div style={{ height: "100vh", display:" flex" }}>
        <div>{isMobile ? null : <Sidebar />}</div>
        <div style={{ width: "100%" }}>
          <TopBar  />
        </div>
      </div>
    </>
  );
}
// <Card>
//   <Card.Body>
//     <h1 className="text-center mb-2">Dashboard</h1>
//     {error && <Alert variant="danger">{error}</Alert>}
//     <strong>Email: {currentUser.email}</strong>
//     <br />
//     {/* Display user data */}
//     {userData && (
//       <>
//         <strong>Full Name: {userData.fullName}</strong>
//         <br />
//         <strong>
//           Role: {userData.isManager ? "Team manager" : "Team member"}
//         </strong>
//         <br />
//         {/* ... add more fields as required */}
//       </>
//     )}
//   </Card.Body>
// </Card>
// <div className="w-100 text-center mt-2">
//   Forgot your password?{" "}
//   <Link to="/settings" className="btn btn-primary">
//     Reset password
//   </Link>
// </div>
// <div className="w-100 text-center mt-2">
//   <Button variant="link" onClick={handleLogout}>
//     Log out
//   </Button>
// </div>
