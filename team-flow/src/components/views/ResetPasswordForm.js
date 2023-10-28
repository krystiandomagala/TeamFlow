import React, { useRef, useState } from "react";
import {
  Form,
  Button,
  Alert,
  Tooltip,
  OverlayTrigger
} from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext";
import { ReactComponent as Info } from "../../assets/info-circle.svg";
import { ReactComponent as Eye } from "../../assets/eye.svg";
import { ReactComponent as EyeSlash } from "../../assets/eye-slash.svg";
import AuthLayout from "../../layouts/AuthLayout";
import {
  handleMouseDown,
  handleMouseUp,
  validatePassword,
} from "../../utils/passwordUtils";

export default function SignUp() {
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const { signup, isEmailVerified } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);


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

  }

  return (
    <AuthLayout>
      <div className="w-100" style={{ maxWidth: "600px" }}>
        <div>
          <h1 className="text-center mb-2">Reset password</h1>
          <p className="text-center mb-4 subtitle">
            Set a new password for email@email.pl 
          </p>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
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
              className=" input-with-icon-container my-3"
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
            <Button
              disabled={loading}
              className="w-100 my-4 btn-lg"
              type="submit"
            >
              Set password
            </Button>
          </Form>
        </div>
      </div>
    </AuthLayout>
  );
}
