// BackgroundContainer.js
import React from "react";
import { Container, Col, Row } from "react-bootstrap";
import { ReactComponent as Image } from "../assets/undraw_working.svg";
import { ReactComponent as Icon } from "../assets/app_icon.svg";

export default function BackgroundContainer({ children }) {
    return (
        <Container fluid className="app-container" style={{ height: "100vh" }}>
            <Row className="align-items-center h-100">
                <Col xs={12} md={6} className="d-flex justify-content-center align-items-center bg-primary h-100 p-5">
                    <Icon className="position-absolute" style={{ left: "30px", top: "30px" }}/>
                    <Image />
                </Col>
                <Col xs={12} md={6} className="d-flex justify-content-center align-items-center p-5">
                    {children}
                </Col>
            </Row>
        </Container>
    );
}
