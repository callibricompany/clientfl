// server.js
// load the things we need
var express = require('express');
var bodyParser = require('body-parser');
var { firebase , db } = require('./connect');
var app = express();
var axios = require('axios');
require('dotenv').config();

var isConnected = 0;
var email = '';
var name = ''; 
var firstname = '';
var password = '';
var phone = '';
var independant = '';
var company = '';
var organization = '';
var requester_id = 0;
var userProfile ;
var uid = '';

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

        isConnected = 1;

        var user = firebase.auth().currentUser;
        uid = user.uid;

        var userInfo = db.collection('users').doc(uid);
        var getDoc = userInfo.get()
        .then(doc => {
            if (!doc.exists) {
            console.log('No such document!');
            } else {
                userProfile = doc.data();
                requester_id = userProfile.codeTS
                
                res.render('pages/index',{email: email, isConnected: isConnected});
            }
        })
        .catch(err => {
            console.log('Error getting document', err);
        });

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
    email = req.body.email;
    name = req.body.name; 
    firstname = req.body.firstname;
    password = req.body.password;
    phone = req.body.phone;
    independant = req.body.independant ? true : false;
    company = req.body.company;
    organization = req.body.organization;

    firebase.auth().createUserWithEmailAndPassword(email, password).then(data => {

        firebase.auth().currentUser.getIdToken(true).then(function(idToken) {
            
            // Connect
            isConnected = 1;
            
            var UserIdentity = {
                email: email,
                name : name, 
                firstname : firstname,
                phone : phone,
                independant : independant,
                company : company,
                organization : organization,
                supervisor: false,
                validated: false,
                codeTS : '',
              };

            let axiosConfig = {
                headers: {
                    'bearer': idToken
                }
                };

            axios.post(process.env.URLCLOUD9 + '/createuser', UserIdentity, axiosConfig)
              .then(function (response) {
                console.log(response.data);

                res.render('pages/register',{email: email, isConnected: isConnected});
              })
              .catch(function (error) {
                console.log(error);
              });
    
        }).catch(function(error) {
            console.log(error);
        });

        }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        
        console.log(errorMessage);
      });

});

// Create Ticket page
app.get('/createticket', function(req, res) {
  res.render('pages/ticket',{email: email, isConnected: isConnected});
});

// Create Ticket button
app.post('/createticket', function(req, res) {

    var UserTicket = req.body;
  
    firebase.auth().currentUser.getIdToken(true).then(function(idToken) {
        
        let axiosConfig = {
            headers: {
                'bearer': idToken,
                'type': 'Demande Générale'
            }
            };

        axios.post(process.env.URLCLOUD9 + '/createticket', UserTicket, axiosConfig)
          .then(function (response) {
            console.log(response.data);

            res.render('pages/ticket',{email: email, isConnected: isConnected});
          })
          .catch(function (error) {
            console.log(error);
          });

    }).catch(function(error) {
        console.log(error);
    });

});

// Trade products
app.get('/reply', function(req, res) {

    allticketuser = [];

    var query = db.collection('tickets')
    .where('requester_id', '==', requester_id)
    .get().then(querySnapshot => {
        querySnapshot.forEach(doc => {      
            var ticketuser = { id: doc.id, data: doc.data() };

            allticketuser.push(ticketuser);
            });

        isConnected = 1;
        res.render('pages/reply',{ email: email, isConnected: isConnected, allticketuser: allticketuser });
        })
    .catch(function(error) {
            console.log("Error getting documents: ", error);
        });

});

app.post('/createreply', function(req, res) {

    var UserReply = req.body;
    var FormatedReply;

    var query = db.collection('agents')
    .where('id', '==', allticketuser[UserReply.idTicket].data.responder_id)
    .get().then(querySnapshot => {
        querySnapshot.forEach(doc => {      
            var emailAgent = doc.data().contact.email;

            FormatedReply = { 
                body : '<B>[' + userProfile.firstName + ' ' + userProfile.lastName + ']:</B> ' +UserReply.body,
                cc_emails : [ emailAgent, userProfile.email ],
                ticketId : allticketuser[UserReply.idTicket].data.id
            }

            firebase.auth().currentUser.getIdToken(true).then(function(idToken) {
        
                let axiosConfig = {
                    headers: {
                        'bearer': idToken,
                    }
                    };
        
                axios.post(process.env.URLCLOUD9 + '/createreply', FormatedReply, axiosConfig)
                  .then(function (response) {
                    console.log(response.data);
        
                    res.render('pages/reply',{ email: email, isConnected: isConnected, allticketuser: allticketuser });
                  })
                  .catch(function (error) {
                    console.log(error);
                  });
        
            }).catch(function(error) {
                console.log(error);
            });

        })

    })
    .catch(function(error) {
            console.log("Error getting documents: ", error);
        });

});

// Trade products
app.get('/trade', function(req, res) {

    res.render('pages/trade',{email: email, isConnected: isConnected});
});

// Trade other products
app.post('/sendorder', function(req, res) {
console.log(req.body);
    var productcharac = req.body;
    var type = req.body.type;

    delete productcharac.type;
    console.log(productcharac);
    firebase.auth().currentUser.getIdToken(true).then(function(idToken) {       

        let axiosConfig = {
            headers: {
                'bearer': idToken,
                'type' : type
            }
            };

        console.log(axiosConfig);
        axios.post(process.env.URLCLOUD9 + '/createticket', productcharac, axiosConfig)
            .then(function (response) {
              console.log(response.data);
  
              res.render('pages/ordersent',{email: email, isConnected: isConnected, message: 'Order Created'});
            })
            .catch(function (error) {
              console.log(error);
            });
  
      }).catch(function(error) {
          console.log(error);
      });

});

app.listen(8080);
console.log('8080 is the clientfl port');