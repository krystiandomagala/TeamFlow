import { React, useEffect, useState } from 'react';
import Sidebar from '../components/common/Sidebar';
import TopBar from '../components/common/TopBar';
import useWindowSize from '../hooks/useWindowSize';

function Layout({ children }) {
  const isMobile = useWindowSize();

  return (
    <div style={{ height: '100vh' }} className='d-flex'>
      <div>{isMobile ? null : <Sidebar />}</div>
      <div className='px-3 d-flex flex-column' style={{ width: '100%' }}>
        <TopBar />
        <div className='d-flex' style={{ flex: 1, height: "calc(100% - 57px)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;
