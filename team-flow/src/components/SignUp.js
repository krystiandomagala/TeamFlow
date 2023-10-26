import React, { useRef, useState } from "react";
import {
  Form,
  Button,
  Alert,
  Tooltip,
  OverlayTrigger
} from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { ReactComponent as Info } from "../assets/info-circle.svg";
import { ReactComponent as Eye } from "../assets/eye.svg";
import { ReactComponent as EyeSlash } from "../assets/eye-slash.svg";
import { Link, useNavigate } from "react-router-dom";
import BackgroundContainer from "./BackgroundContainer";
import {
  handleMouseDown,
  handleMouseUp,
  validatePassword,
} from "../passwordUtils";

export default function SignUp() {
  const fullNameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const { signup, isEmailVerified } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
    const [isManager, setIsManager] = useState(false);

    const handleChange = (event) => {
      setIsManager(event.target.value);
    };
  const navigate = useNavigate();

  const passwordTooltip = (
    <Tooltip id="tooltip">
      <ul
        style={{
          "list-style-type": "none",
          padding: "0px",
          margin: "10px",
          "text-align": "left",
        }}
      >
        <li style={{ "margin-bottom": "10px" }}>Password should be:</li>
        <li>At least 8 characters</li>
        <li>At least one uppercase letter</li>
        <li>At least one lowercase letter</li>
        <li>At least one digit</li>
        <li>At least one special character</li>
      </ul>
    </Tooltip>
  );

  async function handleSubmit(e) {
    e.preventDefault();

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError("Passwords do not match.");
    }

    if (!validatePassword(passwordRef.current.value)) {
      return setError("Password does not meet the requirements.");
    }

    try {
      setError("");
      setLoading(true);
      await signup(emailRef.current.value, passwordRef.current.value, fullNameRef.current.value, isManager);
      if (!isEmailVerified()) {
        navigate("/verify");
        return;
      }
    } catch (err) {
      setError(`Failed to create an account.${err.message}`);
    }

    setLoading(false);
  }

  return (
    <BackgroundContainer>
      <div className="w-100" style={{ maxWidth: "600px" }}>
        <div>
          <h1 className="text-center mb-2">Sign Up</h1>
          <p className="text-center mb-4 subtitle">
            Create an account to start working in your team.
          </p>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group id="full-name" className="my-3">
              <Form.Label className="label-text">Full name</Form.Label>
              <Form.Control
                className="form-control-lg"
                type="text"
                ref={fullNameRef}
                placeholder="Enter your full name"
                required
              />
            </Form.Group>
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

            <Form.Group
              id="password"
              className="my-3 input-with-icon-container"
            >
              <Form.Label className="label-text">
                Create a strong password{" "}
                <OverlayTrigger placement="right" overlay={passwordTooltip}>
                  <Info />
                </OverlayTrigger>
              </Form.Label>
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

            <Form.Group
              id="password-confirm"
              className=" input-with-icon-container"
            >
              <Form.Label className="label-text">Confirm a password</Form.Label>
              <Form.Control
                className="form-control-lg"
                type={isConfirmPasswordVisible ? "text" : "password"}
                ref={passwordConfirmRef}
                placeholder="********"
                required
              />
              <span
                onMouseDown={() => handleMouseDown(setIsConfirmPasswordVisible)}
                onMouseUp={() => handleMouseUp(setIsConfirmPasswordVisible)}
                onMouseLeave={() => handleMouseUp(setIsConfirmPasswordVisible)} // Tu również używamy handleMouseUp, aby ukryć hasło, gdy użytkownik opuści przycisk myszy
              >
                {isConfirmPasswordVisible ? <Eye /> : <EyeSlash />}
              </span>
            </Form.Group>
            <Form.Group className="my-4 d-flex">
              <Form.Check
                type="radio"
                label="I am a team member"
                name="isManager"
                id="team_member"
                value="team_member"
                checked={isManager === false}
                onChange={handleChange}
              />
              <Form.Check
                type="radio"
                label="I am a team manager"
                id="team_manager"
                name="isManager"
                value="team_manager"
                checked={isManager === true}
                onChange={handleChange}
                style={{marginLeft: "20px"}}
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
        <div className="w-100 text-center mt-2 subtitle">
          Already have an account? <Link to="/sign-in">Sign In</Link>
        </div>
      </div>
    </BackgroundContainer>
  );
}
