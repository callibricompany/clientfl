require('dotenv').config();
var firebase = require('firebase');

// Initialize Firebase

var config = {
    apiKey: process.env.APIKEY,
    authDomain: process.env.AUTHDOMAIN,
    databaseURL: process.env.DATABASEURL,
    projectId: process.env.PROJECTID,
    storageBucket: process.env.STORAGEBUCKET,
    messagingSenderId: process.env.MESSAGINGSENDERID
};
firebase.initializeApp(config);

console.log(process.env.APIKEY);

module.exports = firebase;
