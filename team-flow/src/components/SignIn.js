import React, { useRef, useState } from "react";
import { Container, Col, Row, Form, Button, Alert } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { ReactComponent as Image } from "../assets/undraw_working.svg";
import { ReactComponent as Icon } from "../assets/app_icon.svg";
import { Link, useNavigate } from 'react-router-dom'

export default function SignIn() {
  const fullNameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
    <Container fluid className="app-container" style={{ height: "100vh" }}>
      <Row className="align-items-center h-100">
        <Col
          xs={12}
          md={6}
          className="d-flex justify-content-center align-items-center bg-primary h-100 p-5"
        >
          <Icon
            className="position-absolute"
            style={{ left: "30px", top: "30px" }}
          />
          <Image />
        </Col>
        <Col
          xs={12}
          md={6}
          className="d-flex justify-content-center align-items-center p-5"
        >
          <div className="w-100" style={{ maxWidth: "600px" }}>
            <div>
              <h1 className="text-center mb-2">Sign In</h1>
              <p className="text-center mb-4">
              Sign in to your account to start working in your team. 
              </p>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>

                <Form.Group id="email" className="my-3">
                  <Form.Label>Work Email</Form.Label>
                  <Form.Control
                    className="form-control-lg"
                    type="email"
                    ref={emailRef}
                    placeholder="Enter your work email"
                    required
                  />
                </Form.Group>
                <Form.Group id="password" className="my-3">
                  <Form.Label>Your password</Form.Label>
                  <Form.Control
                    className="form-control-lg"
                    type="password"
                    ref={passwordRef}
                    placeholder="***** ***"
                    required
                  />
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
            <div className="w-100 text-center mt-2">
            Forgot your password? <Link to='/reset-password' className="fw-bold">Reset password</Link>
            </div>
            <div className="w-100 text-center mt-2">
            Need an account? <Link to='/sign-up' className="fw-bold">Sign Up</Link>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
