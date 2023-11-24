import React, { useEffect, useState } from 'react';
import Image from 'react-bootstrap/Image'
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { useUser } from "../../contexts/UserContext";

// Komponent AvatarMini
export default function AvatarMini({ userId }) {
  const [user, setUser] = useState()
  const { getUserData } = useUser()

  useEffect(() => {
    if (userId) {
      getUserData(userId).then(data => {
        setUser(data);
      });
    }
  }, [userId, getUserData]);

  function createInitials(fullName) {
    if(!user) return;

    const names = fullName.split(' ');
    if (names.length > 1) {
      return names[0].charAt(0) + names[names.length - 1].charAt(0);
    }
    return fullName.charAt(0);
  }
  const initials = createInitials(user?.fullName);

  return (
    <>
       {user?.profilePhoto ? (
        <Image src={user?.profilePhoto} className="avatar-mini" alt="Profile" roundedCircle />
      ) : (
        <span className="avatar-mini">{initials}</span>
      )}
    </>
  );
};




