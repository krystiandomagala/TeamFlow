import React, { useRef, useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext";
import { ReactComponent as Eye } from "../../assets/eye.svg";
import { ReactComponent as EyeSlash } from "../../assets/eye.svg";
import { Link, useNavigate } from 'react-router-dom'
import {
  handleMouseDown,
  handleMouseUp,
} from "../../utils/passwordUtils";
import BackgroundContainer from "../../layouts/AuthLayout";

export default function SignIn() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);
      await login(emailRef.current.value, passwordRef.current.value);
      navigate('/')
    } catch {
      setError("Failed to sign in.");
    }

    setLoading(false);
  }

  return (
<BackgroundContainer>

          <div className="w-100" style={{ maxWidth: "600px" }}>
            <div>
              <h1 className="text-center mb-2">Sign In</h1>
              <p className="text-center mb-4 subtitle">
              Sign in to your account to start working in your team. 
              </p>
              {error && <Alert variant="danger">{error}</Alert>}
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
                <Form.Group id="password" className="my-3 input-with-icon-container">
                  <Form.Label className="label-text">Your password</Form.Label>
                  <Form.Control
                className="form-control-lg"
                type={isPasswordVisible ? "text" : "password"}
                ref={passwordRef}
                placeholder="********"
                required
              />
              <span
                onMouseDown={() => handleMouseDown(setIsPasswordVisible)}
                onMouseUp={() => handleMouseUp(setIsPasswordVisible)}
                onMouseLeave={() => handleMouseUp(setIsPasswordVisible)} // Tu również używamy handleMouseUp, aby ukryć hasło, gdy użytkownik opuści przycisk myszy
              >
                {isPasswordVisible ? <Eye /> : <EyeSlash />}
              </span>
                </Form.Group>
                
                <Button
                  disabled={loading}
                  className="w-100 my-4 btn-lg"
                  type="submit"
                >
                  Sign In
                </Button>
              </Form>
            </div>
            <div className="w-100 text-center mt-2 subtitle">
            Forgot your password? <Link to='/reset-password'>Reset password</Link>
            </div>
            <div className="w-100 text-center mt-2 subtitle">
            Need an account? <Link to='/sign-up'>Sign Up</Link>
            </div>
          </div>
</BackgroundContainer>

  );
}
