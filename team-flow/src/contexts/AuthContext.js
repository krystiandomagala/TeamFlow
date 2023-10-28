import React, { useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase";
import firebase from "firebase/compat/app";
import { v4 as uuidv4 } from 'uuid';

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true)

  function signup(email, password, fullName, isManager) {
    const verificationToken = uuidv4();

    return auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // Sending the verification email
        userCredential.user.sendEmailVerification({url: `http://localhost:3000/verify-confirm?token=${verificationToken}`});

        // Adding the user to Firestore
        return db.collection("users").doc(userCredential.user.uid).set({
          uid: userCredential.user.uid,
          email: email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          isManager: isManager,
          fullName: fullName,
          verificationToken: verificationToken,
          tokenExpiry: firebase.firestore.Timestamp.fromDate(new Date(new Date().getTime() + 60*60*1000)) // 1 hour from now
        });
      });
}

  function login(email, password) {
    return auth.signInWithEmailAndPassword(email, password);
  }
  function logout(){
    return auth.signOut()
  }

  function resetPassword(email){
    return auth.sendPasswordResetEmail(email)
  }

  function isEmailVerified() {
    const user = auth.currentUser;
    return user ? user.emailVerified : false;
  }

  function sendVerificationEmail() {
    const user = auth.currentUser;
    if (user) {
      return user.sendEmailVerification({url: "http://localhost:3000/verify"});
    }
  }

  useEffect(()=>{
      const unsubscribe = auth.onAuthStateChanged((user) => {
          setCurrentUser(user)
        setLoading(false)
      });

      return unsubscribe
  }, [])

  const value = {
    currentUser,
    login,
    signup, 
    logout,
    resetPassword,
    isEmailVerified,
    sendVerificationEmail  
  };

  return (<AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>)
}
