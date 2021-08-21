import firebase from "firebase/app";
import 'firebase/firestore';
import 'firebase/auth';

const config={
        apiKey: "AIzaSyBMD7I3lQyND787J0727KRr1waxvLiEUnk",
        authDomain: "crwn-db-739ce.firebaseapp.com",
        projectId: "crwn-db-739ce",
        storageBucket: "crwn-db-739ce.appspot.com",
        messagingSenderId: "620666836959",
        appId: "1:620666836959:web:63e5c7d790abffe883166a",
        measurementId: "G-4YB5ERJPJ2"
      };

      firebase.initializeApp(config);

      

      export const createUserProfileDocument = async (userAuth, additionalData) => {
        if (!userAuth) return;
      
        const userRef = firestore.doc(`users/${userAuth.uid}`);
      
        const snapShot = await userRef.get();
      
        if (!snapShot.exists) {
          const { displayName, email} = userAuth;
          const createdAt = new Date();
          const role=0;
          try {
            await userRef.set({
              displayName,
              email,
              createdAt,
              role,
              ...additionalData
            });
          } catch (error) {
            console.log('error creating user', error.message);
          }
        }
      
        return userRef;
      };

    
      export const auth = firebase.auth();
      export const firestore = firebase.firestore();
      
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      export const signInWithGoogle = () => auth.signInWithPopup(provider);
      
      export default firebase;