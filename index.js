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
var products = [];

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
            
        db.collection('productScheme').get()
        .then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                
                var product = { id: doc.id, data: doc.data() };
    
                products.push(product);
            });
            isConnected = 1;
            res.render('pages/index',{ email: email, isConnected: isConnected });
        })
        .catch(function(error) {
            console.log("Error getting documents: ", error);
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
                'bearer': idToken
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
app.get('/comment', function(req, res) {

    res.render('pages/comment',{email: email, isConnected: isConnected});

});

app.post('/createcomment', function(req, res) {

    var comment = req.body;

    console.log(comment);

    firebase.auth().currentUser.getIdToken(true).then(function(idToken) {       

        let axiosConfig = {
            headers: {
                'bearer': idToken
            }
            };

        axios.post(process.env.URLCLOUD9 + '/createMessage', comment, axiosConfig)
            .then(function (response) {
              console.log(response.data);
  
              res.render('pages/ordersent',{email: email, isConnected: isConnected, message: 'message added'});
            })
            .catch(function (error) {
              console.log(error);
            });
  
      }).catch(function(error) {
          console.log(error);
      });

});

// Trade products
app.get('/trade', function(req, res) {
    var id = 0;

    fields = Object.keys(products[id].data);
    console.log(products);
    res.render('pages/trade',{email: email, isConnected: isConnected, products: products, fields: fields, id: id});
});

// Switch to other products
app.post('/trade', function(req, res) {

    var id = req.body.prod_id;
    
    fields = Object.keys(products[id].data);

    res.render('pages/trade',{email: email, isConnected: isConnected, products: products, fields: fields, id: id});
});

// Trade other products
app.post('/sendorder', function(req, res) {

    var productcharac = req.body;

    console.log(productcharac);

    firebase.auth().currentUser.getIdToken(true).then(function(idToken) {       

        let axiosConfig = {
            headers: {
                'bearer': idToken
            }
            };

        axios.post(process.env.URLCLOUD9 + '/createproduct', productcharac, axiosConfig)
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

app.get('/idtoken', function(req,res) {

    firebase.auth().currentUser.getIdToken(true).then(function(idToken) {
        // Send token to your backend via HTTPS
        axios.post(process.env.URLCLOUD9 + '/createuser', {
            idToken: idToken
          })
          .then(function (response) {
            console.log(response);
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