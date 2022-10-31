import { initializeApp } from "firebase/app";

const config = {
    apiKey: "AIzaSyBaZVxeuMiNaAfbNE2dY5pGazBY9sJaTF4",
    authDomain: "file-upload-97c34.firebaseapp.com",
    databaseURL: "https://file-upload-97c34-default-rtdb.firebaseio.com",
    projectId: "file-upload-97c34",
    storageBucket: "file-upload-97c34.appspot.com",
    messagingSenderId: "625626084952",
    appId: "1:625626084952:web:ebb4826a63f951a26b3c2d",
};

const app = initializeApp(config);

export default app;