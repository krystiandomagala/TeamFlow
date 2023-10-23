import React, { useState, useEffect } from "react";
import {Button, Alert} from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { Link } from 'react-router-dom'

import BackgroundContainer from "./BackgroundContainer";


export default function EmailVerification() {
    const { sendVerificationEmail, currentUser } = useAuth();
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");
    const [emailVerified, setEmailVerified] = useState(currentUser.emailVerified);

    useEffect(() => {
      if (currentUser) {
          setEmailVerified(currentUser.emailVerified);
      }
  }, [currentUser]);

  async function handleSendAgain() {
    try {
      setLoading(true);
      await sendVerificationEmail();
      setMessage("Verification email sent again.");
    } catch {
      setError("Failed to send verification email.");
    }

    setLoading(false);
  }

    async function handleSendAgain() {
      try {
        await sendVerificationEmail();
        setMessage("Verification email sent again.");
      } catch {
        setError("Failed to send verification email.");
      }
  }

  return (
    <BackgroundContainer>
          <div className="w-100" style={{ maxWidth: "600px" }}>
            {emailVerified ? (
                    <div>
                        <h1 className="text-center mb-2">Congratulations!</h1>
                        <p className="text-center mb-4">
                            Your email address has been successfully verified.
                        </p>
                        <div className="w-100 text-center">
                            <Link to="/">Go to your dashboard</Link>
                        </div>
                    </div>
                ) : (
                    <div>
                        <h1 className="text-center mb-2">We're almost there!</h1>
                        <p className="text-center mb-4">
                            A verification email has been sent to your email address.
                        </p>
                        <p className="text-center mb-2">
                            Can't you see our email? 
                        </p>
                        <div className="w-100 text-center">
                            <Button onClick={handleSendAgain}>Send again</Button>
                        </div>
                        {message && <Alert variant="success">{message}</Alert>}
                        {error && <Alert variant="danger">{error}</Alert>}
                    </div>
                )}
          </div>
    </BackgroundContainer>
  )
}
