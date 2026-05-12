import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyCQMkDyGucHvuMgP7zfIGpDQkgyav6X6XA",
    authDomain: "liftweather-c9ac8.firebaseapp.com",
    databaseURL: "https://liftweather-c9ac8-default-rtdb.firebaseio.com",
    projectId: "liftweather-c9ac8",
    storageBucket: "liftweather-c9ac8.firebasestorage.app",
    messagingSenderId: "758502113228",
    appId: "1:758502113228:web:18f08463a518efbbcaa769",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
