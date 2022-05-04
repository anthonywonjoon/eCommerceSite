/* Assignment 1 by Anthony Lee for ITM 352, SPRING 2022
   Server.js -- server side processing for eCommerce store
*/

// importing required nodes for express
var express = require('express');
var app = express();
const path = require('path');

// importing and assigning json with product information to variable
fs = require('fs'); // files system module
var data = require("./products.json");
var filename = require("./user_data.json");
var products_array = data.products_array;

// importing parser and querystring to package data for requests
var myParser = require("body-parser");
const queryString = require('querystring');
const { query } = require('express');
const { response } = require('express');

var sticker_quant = {};

app.use(myParser.urlencoded({ extended: true })); // From lab 13

// function -- validates whether inputted values are acceptable, if not, sends errors
function isNonNegInt(q, returnErrors = false){
   errors = [];
   if (q == "") { q = 0; }
   if (Number(q) != q) { errors.push('Not a Number!'); }
   if (q < 0) { errors.push('Negative value!'); }
   if (parseInt(q) != q) { errors.push('Not an Integer!');}
   return returnErrors ? errors : (errors.length == 0);
}

// function -- validates whether inputted values are within quantity available range
function validateStock(cust_qty, stock){
   if (cust_qty > stock){
      return false;
   }
}

// Routing 
app.use(myParser.urlencoded({extended : true}));

app.post("/purchase", function(request, response) {
   let POST = request.body; // assigning req body to var
   // validating that all quantities recieved are valid 
   if (typeof POST['purchase_submit'] != 'undefined') { // validating quantities, and valid quantities
      var total_qty = 0;
      const stringified = queryString.stringify(POST); // convert req body to a querystring
      // loops through every value and makes sure that values are valid -- has quantities, are valid quantities, and are in stock
      // for (i = 0; i < data.length; i++){
      //    qty = POST[`quantity${i}`];
      //    hasQuantities = hasQuantities || qty > 0;
      //    hasValidQuantities = hasValidQuantities && isNonNegInt(qty);
      //    inStock = validateStock(qty, data[i]['quantity_available']) && isNonNegInt(qty);
      // }

      for (i = 0; i < data.length; i++){
         if (POST[`quantity${i}`] != undefined){
            qty = POST[`quantity${i}`];
            total_qty += qty;
            if (!isNonNegInt(qty) || qty > data[i]['quantity_available']){
               response.redirect("./store.html?" + stringified);
            }
         }
      }

      if (typeof request.body.user != 'undefined'){
         response.redirect("./invoice.html?" + stringified);
      } else {
         response.redirect("./login.html?" + stringified);
      }
   }
})

app.get("/login", function(request, response) {
   str = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
         <meta charset="UTF-8">
         <meta http-equiv="X-UA-Compatible" content="IE=edge">
         <meta name="viewport" content="width=device-width, initial-scale=1.0">
         <script src="./products_data.js" type="text/javascript"></script>
         <link rel="stylesheet" href="./css/login.css">
         <title>Document</title>
      </head>
      <script>
         let params = (new URL(document.location)).searchParams; 
         var quantities = [];
         for (i = 0; i < products_array.length; i++) {
            if (params.has("quantity${i}")) {
                  a_qty = params.get("quantity${i}");
                  quantities[i] = a_qty;
            }
         }
      
         window.onload = function() {
            for (i = 0; i < products_array.length; i++){
                  if (quantities[i] != 0){
                     document.getElementById("quantity${i}").value = quantities[i];
                  }
            }
         }
      
      </script>
      <body>
         <form action="/login" method="POST">
            <div class="login_form">
                  <h1>LOGIN</h1>
                  <p>Log in with your username and password</p>
                  <div class="email_input">
                     <label for="email">USERNAME</label>
                     <input type="text" id="user" name="user" placeholder="username">
                  </div>
                  <div class="pass_input">
                     <label for="password">PASSWORD</label>
                     <input type="password" id="password" name="password">
                  </div>
                  <div class="login_submit">
                     <input type="submit" value="Log in">
                  </div>
            </div>
            <script>
                  for (i = 0; i < products_array.length; i++){
                     document.write("
                        <input type="hidden" id="quantity${i}" name="quantity${i}" value="0">
                     ")
                  }
            </script>
         </form>
      </body>
      </html>
      
   `;

   response.send(str);
})

app.post("/login", function (request, response) {
   // Process login form POST and redirect to logged in page if ok, back to login page if not
   the_username = request.body['user'].toLowerCase();
   the_password = request.body['password'];
   if (typeof filename[the_username] != 'undefined') {
      if (filename[the_username].password == the_password) {
         delete request.body.password;
         let POST = request.body;
         console.log(Object.keys(request.body).length);
         stringified = queryString.stringify(POST);
         if (Object.keys(request.body).length != 1){
            console.log(filename[the_username]["user"]);
            response.redirect("./invoice.html?" + stringified);
         } else {
             response.redirect("./store.html?" + stringified);
          }
       } else {
           response.send(`Wrong password!`);
       }
       return;
   }
   response.send(`${the_username} does not exist`);
});

// app.get("/register", function(request, reponse){
//    response.redirect("./registration.html");
// })

// app.post("/register", function(request, response){
//    let POST = request.body;
//    the_username = POST.user;
//    the_password = POST.pass;
//    the_email = POST.email;
//    the_name = POST.name;
//    if (filename[the_username] != undefined){
//       stringified = queryString.stringify(POST);
//       response.redirect("./registration.html?" + stringified);
//    } else {
//       let newUser = `"${POST.user}":{"username": "${POST.name}", "password": "${POST.pass}", "email": "${POST.email}"}`
//       var fileRead = fs.readFileSync('user_data.json');
//       var newObject = JSON.parse(fileRead);
//       newObject.push(newUser);
//       newUser = JSON.stringify(newObject);
//       fs.writeFile('user_data.json', newUser);
//    }
// })

app.post("/registration.html", function (request, response) {
   // process a simple registration form
   let POST = request.body;
   console.log(camera_quantity);
   the_username = request.body.user;
   console.log(the_username, "Username is", typeof (users_reg_data[the_username]));

   username = request.body.user// save new user to file name (users_reg_data)

   errors = [];// checks if username already exists

   if (typeof users_reg_data[username] != 'undefined') {
      errors.push("Please choose a different Username");
   }
   
   if (request.body.pass !== request.body.repass) {
     errors.push('Passwords do not match')
   }

   console.log(errors, users_reg_data);

   if (errors.length == 0) {
      users_reg_data[username] = {};
      users_reg_data[username].username = request.body.username
      users_reg_data[username].password = request.body.password;
      users_reg_data[username].email = request.body.email;
      stringified = queryString.stringify(POST);
      fs.writeFileSync(filename, JSON.stringify(user_reg_data));
      response.redirect("/invoice.html?" + stringified + `&username=${the_username}`);
      

   }
});


app.post("/purchase_complete", function(request, response){
   let POST = request.body;
   console.log(POST);
   stringified = queryString.stringify(POST);
   response.redirect("./order_complete.html?" + stringified);
})

app.post("/index", function(request, response){
   let POST = request.body;
   console.log(POST);
   stringified = queryString.stringify(POST);
   response.redirect("./index.html?" + stringified);
})

// monitor all requests
app.all('*', function (request, response, next) {
   console.log(request.method + ' to ' + request.path);
   next();
});


// route all other GET requests to files in public 
app.use(express.static(__dirname + '/public'));

// start server
app.listen(8080, () => console.log(`listening on port 8080`));