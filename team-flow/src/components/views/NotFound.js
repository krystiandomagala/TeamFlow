import React from 'react';
import { Link } from "react-router-dom";
import { ReactComponent as LostImage } from "../../assets/undraw_lost.svg";

export default function NotFound() {
  return (
    <div className='d-flex justify-content-center align-items-center p-5' style={{height: "100vh"}}>
      <div>
        <LostImage style={{maxWidth: "500px", height: "auto"}} />
        <h1 className="text-center mt-5">404</h1>
        <h2 className="text-center mb-2">Not found</h2>
        <p className="text-center mb-2 subtitle">The resource could not be found on the server.</p>
        <div className="w-100 text-center mt-2 subtitle">
          <Link to="/sign-in">Go to the home page</Link>
        </div>
      </div>
    </div>
  );
}
