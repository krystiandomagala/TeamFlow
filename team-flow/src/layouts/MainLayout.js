import {React, useEffect, useState} from 'react';
import Sidebar from '../components/common/Sidebar';
import TopBar from '../components/common/TopBar';

function Layout({ children }) {

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // Nowy state
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
              <div>{isMobile ? null : <Sidebar />}</div>

      <div className="px-3" style={{ width: "100%" }}>
      <TopBar />
        <div style={{ flex: 1, overflowY: 'auto'}} className="py-3">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;
