import React, { useEffect, useState } from 'react';
import Image from 'react-bootstrap/Image'
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { useUser } from "../../contexts/UserContext";

// Komponent Avatar
const Avatar = ({ userId }) => {
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
    if (!user) return;

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
        <Image src={user?.profilePhoto} className="avatar" alt="Profile" roundedCircle />
      ) : (
        <div className="avatar">{initials}</div>
      )}
    </>
  );
};

export default Avatar;


