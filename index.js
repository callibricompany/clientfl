// server.js
// load the things we need
var express = require('express');
var bodyParser = require('body-parser');
var firebase = require('./connect');
var app = express();

var isConnected = 0;
var email = '';
var username = '';
var password = '';

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

// use res.render to load up an ejs view file

// index page 
app.get('/', function(req, res) {
    res.render('pages/index',{email: email, isConnected: isConnected});
});

// manage connection 
app.post('/', function(req, res) {
    email = req.body.username;
    password = req.body.password;

    firebase.auth().signInWithEmailAndPassword(email, password).then(() =>{
        var db = firebase.firestore();
        
        isConnected = 1;

        var user = firebase.auth().currentUser;

        console.log(user.uid);

        res.render('pages/index',{ email: email, isConnected: isConnected });

    }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;

        console.log(errorMessage);
    });
});

// Register page
app.get('/register', function(req, res) {
    res.render('pages/register',{email: email, isConnected: isConnected});
});

// Register button
app.post('/register', function(req, res) {
    email = req.body.username;
    username = req.body.username; 
    password = req.body.password;
    
    firebase.auth().createUserWithEmailAndPassword(email, password).then(data => {
        var db = firebase.firestore();

        var data = {
            email: email,
            username: username
          };
        
        var user = firebase.auth().currentUser;

        console.log(user);
          // Add a new document in collection "cities" with ID 'LA'
        // var setDoc = db.collection('users').doc('LA').set(data);
        res.render('pages/register',{email: email, isConnected: isConnected});

        }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        
        console.log(errorMessage);
      });

});

app.listen(8080);
console.log('8080 is the magic port');