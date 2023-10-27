import { React, useState, useEffect } from "react";
import MobileMenu from "./MobileMenu";
import { Navbar } from 'react-bootstrap';

export default function TopBar() {

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
      };
  
      window.addEventListener("resize", handleResize);
  
      // Usuń nasłuchiwacz podczas odmontowywania komponentu
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }, []);


    return (
        <Navbar className="border-bottom  d-flex align-items-center justify-content-end">
            <Navbar.Brand href="/">Navbar</Navbar.Brand>
            { isMobile ? <MobileMenu /> : null}
        </Navbar>
    );
}
