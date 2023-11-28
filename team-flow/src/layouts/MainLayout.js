import { React, useEffect, useState } from 'react';
import Sidebar from '../components/common/Sidebar';
import TopBar from '../components/common/TopBar';

function Layout({ children }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // Nowy state
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  return (
    <div style={{ height: '100vh' }} className='d-flex'>
      <div>{isMobile ? null : <Sidebar />}</div>
      <div className='px-3 d-flex flex-column' style={{ width: '100%' }}>
        <TopBar />
        <div className='h-100 d-flex' style={{ flex: 1, overflowY: 'hidden' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;
