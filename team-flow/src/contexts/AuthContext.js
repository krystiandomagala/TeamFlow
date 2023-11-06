import React, { useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase";
import firebase from "firebase/compat/app";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true)

  function signup(email, password, fullName) {
    return auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // Sending the verification email
        userCredential.user.sendEmailVerification();

        // Adding the user to Firestore
        return db.collection("users").doc(userCredential.user.uid).set({
          uid: userCredential.user.uid,
          email: email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          fullName: fullName,
          lastTeamId: false
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
      return user.sendEmailVerification();
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
