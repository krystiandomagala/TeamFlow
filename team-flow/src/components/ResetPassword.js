import React, { useRef, useState } from "react";
import { Container, Col, Row, Form, Button, Alert } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { ReactComponent as Image } from "../assets/undraw_working.svg";
import { ReactComponent as Icon } from "../assets/app_icon.svg";
import { Link } from "react-router-dom";
import BackgroundContainer from "./BackgroundContainer";

export default function ResetPassword() {
  const emailRef = useRef();
  const { resetPassword } = useAuth();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setMessage('')
      setError("");
      setLoading(true);
      await resetPassword(emailRef.current.value)
      setMessage('Check your inbox for further instructions.')
    } catch {
      setError("Failed to reset password.");
    }

    setLoading(false);
  }

  return (
<BackgroundContainer>
          <div className="w-100" style={{ maxWidth: "600px" }}>
            <div>
              <h1 className="text-center mb-2">Reset your password</h1>
              <p className="text-center mb-4 subtitle">
                Enter the email address associated with your account and we’ll
                send you a link to reset your password.
              </p>
              {error && <Alert variant="danger">{error}</Alert>}
              {message && <Alert variant="success">{message}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group id="email" className="my-3">
                  <Form.Label className="label-text">Work Email</Form.Label>
                  <Form.Control
                    className="form-control-lg"
                    type="email"
                    ref={emailRef}
                    placeholder="Enter your work email"
                    required
                  />
                </Form.Group>

                <Button
                  disabled={loading}
                  className="w-100 my-4 btn-lg"
                  type="submit"
                >
                  Send email
                </Button>
              </Form>
            </div>

            <div className="w-100 text-center mt-2">
              <Link to="/sign-in">
                Sign In
              </Link>
            </div>
          </div>
</BackgroundContainer>

  );
}
