import React, { useRef, useState } from "react";
import { Container, Col, Row, Form, Button, Alert } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { ReactComponent as Image } from "../assets/undraw_working.svg";
import { ReactComponent as Icon } from "../assets/app_icon.svg";
import { Link, useNavigate } from 'react-router-dom'


export default function SignUp() {
  const fullNameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const { signup } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault();

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError("Passwords do not match.");
    }

    try {
      setError("");
      setLoading(true);
      await signup(emailRef.current.value, passwordRef.current.value);
      navigate('/')
    } catch {
      setError("Failed to create an account.");
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
              <h1 className="text-center mb-2">Sign Up</h1>
              <p className="text-center mb-4">
                Create an account to start working in your team.
              </p>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group id="full-name" className="my-3">
                  <Form.Label>Full name</Form.Label>
                  <Form.Control
                    className="form-control-lg"
                    type="text"
                    ref={fullNameRef}
                    placeholder="Enter your full name"
                    required
                  />
                </Form.Group>
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
                  <Form.Label>Create a strong password</Form.Label>
                  <Form.Control
                    className="form-control-lg"
                    type="password"
                    ref={passwordRef}
                    placeholder="***** ***"
                    required
                  />
                </Form.Group>
                <Form.Group id="password-confirm" className="my-3">
                  <Form.Label>Confirm a password</Form.Label>
                  <Form.Control
                    className="form-control-lg"
                    type="password"
                    ref={passwordConfirmRef}
                    placeholder="***** ***"
                    required
                  />
                </Form.Group>
                <Button
                  disabled={loading}
                  className="w-100 my-4 btn-lg"
                  type="submit"
                >
                  Sign Up
                </Button>
              </Form>
            </div>
            <div className="w-100 text-center mt-2">
              Already have an account? <Link to='/sign-in' className="fw-bold">Sign In</Link>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}