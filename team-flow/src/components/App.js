import React from "react";
import SignUp from "./SignUp";
import SignIn from "./SignIn";
import ResetPassword from "./ResetPassword";
import Dashboard from "./Dashboard";
import PrivateRoute from "./PrivateRoute";
import RedirectIfLoggedIn from "./RedirectIfLoggedIn"
import { AuthProvider } from "../contexts/AuthContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EmailVerification from "./EmailVerification";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          ></Route>

          <Route path="/sign-in" element={<RedirectIfLoggedIn><SignIn /></RedirectIfLoggedIn>} />
          <Route path="/sign-up" element={<RedirectIfLoggedIn><SignUp /></RedirectIfLoggedIn>} />
          <Route path="/reset-password" element={<RedirectIfLoggedIn><ResetPassword /></RedirectIfLoggedIn>} />
          <Route path="/verify" element={
              <PrivateRoute>
                <EmailVerification />
              </PrivateRoute>
            }
          ></Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
