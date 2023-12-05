import React, { useState, useEffect } from 'react'

export default function useWindowSize() {

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

    return isMobile
}
