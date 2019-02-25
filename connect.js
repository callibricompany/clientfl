var firebase = require('firebase');

// Initialize Firebase

var config = {
    apiKey: "AIzaSyDY7vk5tEGQ3ZeI8iaEn2iAaD6DAhOHyb0",
    authDomain: "auth-8722c.firebaseapp.com",
    databaseURL: "https://auth-8722c.firebaseio.com",
    projectId: "auth-8722c",
    storageBucket: "auth-8722c.appspot.com",
    messagingSenderId: "452038208493"
};
firebase.initializeApp(config);

module.exports = firebase;