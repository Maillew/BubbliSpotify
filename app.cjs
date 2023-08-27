var client_id = 'ID'; // Your client id
var client_secret = 'SECRET'; // Your secret
var redirect_uri = 'https://bubbli.williamlin.maillew.com/callback'; // Your redirect uri


const express = require ("express");
const session = require("express-session");
const crypto = require('crypto');
const bodyParser = require ("body-parser");
const mongoose = require("mongoose");
const { dirname } = require ("path");
const { fileURLToPath } = require ("url");
const request = require ("request");
const cors = require ("cors");
const querystring = require ('querystring');
const cookieParser = require ('cookie-parser');
const { access } = require("fs");

mongoose.connect("mongodb+srv://admin-william:test123@cluster0.mjnvgtd.mongodb.net/userDB", {useNewUrlParser: true});

const userSchema = {
  email: String,
  spotifyData: { type: mongoose.Schema.Types.Mixed }, // Store the entire JSON response
}
const User = mongoose.model('User', userSchema);

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(cors({
      origin: 'http://localhost:5173',
    }))
   .use(express.static(__dirname))
   .use(cookieParser())
   .use(bodyParser.urlencoded({extended: true}))
   .use(bodyParser.json());
const secretKey = crypto.randomBytes(32).toString('hex');

app.use(session({
  secret: secretKey,
  resave: false,
  saveUninitialized: true
}));

app.get('/', (req, res) =>{
  res.render("index.ejs");
});
app.get('/user', (req, res) => {
  if (!req.session.loggedIn) {
    res.redirect("/login");
  } else {
    res.render("user.ejs"); // Display user-specific data
  }
});
var access_token = "";
var loggedIn = false;
var userEmail = "";
var colors = [
    "#F4C209",
    "#FF8C5A",
    "#FF99AD",
    "#D9A9E2",
    "#4BAA71"
];

app.get('/login', function(req, res) {
  console.log("pressed");
  var state = generateRandomString(16);
  console.log('State to set:', state);
  res.cookie(stateKey, state);
  // your application requests authorization
  var scope = 'user-top-read user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/token', function (req, res){
  res.send(req.session.access_token);
})

app.get('/callback', function(req, res) {//after we are authorized, we are redirected to redirectURI, currently callback

  // your application requests refresh and access tokens
  // after checking the state parameter
  
  var code = req.query.code || null;
  var state = req.query.state || null; //what is the state, after we login  
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {// we are sending back here...
    res.json({error: 'stateMismatch'});
  } 
  else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, async function(error, response, body) {
      if (!error && response.statusCode === 200) { 
        console.log(req.session);
        access_token = body.access_token,
        loggedIn = true;
        req.session.access_token = access_token;
        req.session.loggedIn = loggedIn;
        req.session.shareUsers = [];
        req.session.colorsUsed = [0,0,0,0,0];

        console.log(req.session);
        res.redirect("/user");
        var options3 = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        }
        request.get(options3, async function(error, response, body) {
          if(error && response.statusCode !== 200) {
            res.status(response.statusCode).json({ error: 'invalid-token' });
            return;
          }
          userEmail = body.email;
          req.session.userEmail = body.email;
          var pfpLink = "/views/defaultpfp.jpg";
          if(body.images.length) pfpLink = body.images[0].url;
          let c = "";
          for(let i =0; i<5; i++){
            if(!req.session.colorsUsed[i]){
              c = colors[i];
              req.session.colorsUsed[i] = 1;
              break;
            } 
          } 
          const userObject = {
            email: userEmail,
            pfp: pfpLink,
            color: c,
            name: body.display_name.split(" ")[0]
          }
          req.session.shareUsers.push(userObject);
        });
      } 
      else {
        res.json({error: 'invalid-token'});
      }
    });
  }
});

app.get('/fetch-data', async function(req, res) {
  try {
    const access_token = req.session.access_token; // Get access token from query parameter
    if (!access_token) {
      res.status(400).json({ error: 'Missing access_token' });
      return;
    }

    var options = {
      url: 'https://api.spotify.com/v1/me/top/tracks',
      headers: { 'Authorization': 'Bearer ' + access_token },
      json: true
    };
    var options2 = {
      url: 'https://api.spotify.com/v1/me/top/artists',
      headers: { 'Authorization': 'Bearer ' + access_token },
      json: true
    };
    var options3 = {
      url: 'https://api.spotify.com/v1/me',
      headers: { 'Authorization': 'Bearer ' + access_token },
      json: true
    }

    request.get(options, async function(error, response, trackData) {
      if (error && response.statusCode !== 200) {
        res.status(response.statusCode).json({ error: 'invalid-token' });
        return;
      }
      request.get(options2, async function(error, response, artistData) {
        if(error && response.statusCode !== 200) {
          res.status(response.statusCode).json({ error: 'invalid-token' });
          return;
        }
        request.get(options3, async function(error, response, body) {
          if(error && response.statusCode !== 200) {
            res.status(response.statusCode).json({ error: 'invalid-token' });
            return;
          }
          var pfpLink = "/views/defaultpfp.jpg";
          if(body.images.length) pfpLink = body.images[0].url;
          const combinedData = {
            email: body.email, 
            pfp: pfpLink, 
            userName: body.display_name.split(" ")[0], 
            tracks: trackData, 
            artists: artistData
          };
          res.json(combinedData);
          //add info to database here
          User.findOne({ email: combinedData.email })
          .then(existingUser => {
            if (!existingUser) {
              // User doesn't exist, create a new user
              const newUser = new User({
                email: combinedData.email,
                spotifyData: combinedData,
              });

              newUser.save()
                .then(() => {
                  console.log('New user data saved with email: ' + combinedData.email);
                })
                .catch(error => {
                  console.error('Error saving new user data:', error);
                });
            } else {
              // User exists, update their data
              existingUser.spotifyData = combinedData;
              existingUser.save()
                .then(() => {
                  console.log('Existing user data updated with email ' + combinedData.email);
                })
                .catch(error => {
                  console.error('Error updating existing user data:', error);
                });
            }
          })
          .catch(error => {
            console.error('Error finding user:', error);
          });
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'server-error' });
  }
});


app.get('/share', function(req,res){//need to check if we are logged in
  if(!req.session.loggedIn){
    res.redirect("/login");
  }
  else {
    console.log(req.session.shareUsers);
    res.render("share.ejs", {user: req.session.shareUsers});// , {name: {stuff ur sending over}}
  }
});

app.post('/fetch-user', function(req,res){
  const newEmail = req.body.email;
  User.findOne({ email: newEmail })
    .then(user => {
      if (user) {
        res.json(user.spotifyData); // Return user's Spotify data
      } else {
        res.json({ message: 'User currently does not exist.' });
      }
    })
    .catch(error => {
      res.status(500).json({ message: 'An error occurred.' });
    });
})



app.post("/addUser", async function(req,res){
  console.log(req.body);
  const newEmail = req.body.newUserEmail.trim();
  
  for(let i =0; i<req.session.shareUsers.length; i++){
    if(req.session.shareUsers[i].email === newEmail) return res.status(200).json({ message: "User already exists" });
  }
  //need to check if user exists or not before pushing
  //if they dont exist, make a pop up?
  //if dont exist
  User.find({}, function(err, users){
    users.forEach(function(user) {
      console.log(user);
    });
  });
  try {
    // Check if the user exists in the database
    const user = await User.findOne({ email: newEmail }).exec();
    if (user) {
      let c = "";
      for(let i =0; i<5; i++){
        if(!req.session.colorsUsed[i]){
          c = colors[i];
          req.session.colorsUsed[i] = 1;
          break;
        } 
      } 
      const userObject = {
          email: newEmail,
          pfp: user.spotifyData.pfp, 
          color: c,
          name: user.spotifyData.userName
      };
      req.session.shareUsers.push(userObject);
      return res.status(200).json({ message: "User added successfully" });
    } else {
        console.log("User not found");
        return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).json({ message: "An error occurred." });
  }
})

app.post("/deleteUser", function(req,res){
  console.log(req.body);
  const email = req.body.email;
  
  for(let i =0; i<req.session.shareUsers.length; i++){
    if(req.session.shareUsers[i].email === email){
      for(let j =0; j<5; j++){
        if(req.session.shareUsers[i].color === colors[j]){
          req.session.colorsUsed[j] = 0;
          break;
        }
      }
      req.session.shareUsers.splice(i,1);
    }
  }
  res.redirect("/share");
  //now need to add the balls to the screen
  //maybe what we can do, is sync up the button, to call here, and the share.js file?
})
console.log('Listening on 8888');
app.listen(8888);
