import React, { useState, useEffect } from "react";
import { Button, Alert } from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext";
import { auth } from "../../firebase";
import BackgroundContainer from "../../layouts/AuthLayout";
import { Link } from "react-router-dom";

export default function EmailVerification() {
  const { sendVerificationEmail, currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [emailVerified, setEmailVerified] = useState(currentUser.emailVerified);


useEffect(() => {
  const checkEmailVerification = () => {
    const user = auth.currentUser;
    if (user) {
      // Ponowne pobranie stanu użytkownika z Firebase
      user.reload().then(() => {
        setEmailVerified(user.emailVerified);
      });
    }
  };

  // Uruchomienie funkcji od razu po montowaniu komponentu
  checkEmailVerification();

  // Uruchamianie funkcji co kilka sekund, aby sprawdzić, czy e-mail został zweryfikowany
  const interval = setInterval(checkEmailVerification, 1000); // co 1 sekunde

  // Czyszczenie interwału przy demontowaniu komponentu
  return () => clearInterval(interval);
}, []);


  async function handleSendAgain() {
    try {
      setError("");
      setMessage("");
      setLoading(true);
      await sendVerificationEmail();
      setMessage("Verification email has been sent again.");
    } catch (err) {
      setError(`Failed to send verification email. ${err.message}`);
    }

    setLoading(false);
  }
  return (
    <BackgroundContainer>
      <div className="w-100" style={{ maxWidth: "600px" }}>
        {emailVerified ? (
          <div>
            <h1 className="text-center mb-2">Congratulations!</h1>
            <p className="text-center mb-4 subtitle">
              Your email address has been successfully verified.
            </p>
            <div className="w-100 text-center">
              <Link to="/">Go to your dashboard</Link>
            </div>
          </div>
        ) : (
          <div>
            <h1 className="text-center mb-2">We're almost there!</h1>
            <p className="text-center mb-4 subtitle">
              A verification email has been sent to your email address.
            </p>
            <p className="text-center mb-2 subtitle">
              Can't you see our email?
            </p>
            <div className="w-100 text-center">
              <Button
                disabled={loading}
                className="w-100 btn-lg"
                onClick={handleSendAgain}
              >
                Send again
              </Button>
            </div>

            {message && <Alert variant="success" className="my-3">{message}</Alert>}
            {error && <Alert variant="danger" className="my-3">{error}</Alert>}
          </div>
        )}
      </div>
    </BackgroundContainer>
  );
}
