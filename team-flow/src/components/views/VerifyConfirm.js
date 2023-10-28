import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from "../../firebase";
import firebase from "firebase/compat/app";

export default function VerifyConfirm() {
    const navigate = useNavigate();
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    useEffect(() => {
        if(!token) {
            // Redirect to error page
            navigate('/error');
            return;
        }

        // Fetch the user based on token from Firestore
        db.collection('users').where('verificationToken', '==', token).get()
          .then(snapshot => {
              if (snapshot.empty) {
                  navigate('/error');
                  return;
              }

              const now = firebase.firestore.Timestamp.now();

              snapshot.forEach(doc => {
                  const userData = doc.data();
                  if(now.seconds > userData.tokenExpiry.seconds) {
                      // Token has expired
                      navigate('/error');
                      return;
                  }

                  // Verify the user and remove the token
                  db.collection('users').doc(doc.id).update({
                      emailVerified: true,
                      verificationToken: firebase.firestore.FieldValue.delete(),
                      tokenExpiry: firebase.firestore.FieldValue.delete()
                  }).then(() => {
                      navigate('/');
                  }).catch(error => {
                      console.error("Error verifying user: ", error);
                  });
              });
          }).catch(error => {
              console.error("Error fetching user with token: ", error);
          });

    }, [token, navigate]);
  return (
    <div>
                  Verifying...
    </div>
  )
}
