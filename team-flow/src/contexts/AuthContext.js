import React, { useContext, useState, useEffect } from "react";
import { auth } from "../firebase";
const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true)

  function signup(email, password) {
    return auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // wysyła e-mail weryfikacyjny
        return userCredential.user.sendEmailVerification({url: "http://localhost:3000/verify"});
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
