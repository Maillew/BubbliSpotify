var client_id = 'CLIENT ID'; // Your client id
var client_secret = 'CLIENT SECRET'; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri


const express = require ("express");
const bodyParser = require ("body-parser");
const { dirname } = require ("path");
const { fileURLToPath } = require ("url");
const request = require ("request");
const cors = require ("cors");
const querystring = require ('querystring');
const cookieParser = require ('cookie-parser');


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
   .use(cookieParser());

app.get('/', (req, res) =>{
  console.log("test");
  res.sendFile(__dirname + "/index.html");
});

app.get('/login', function(req, res) {
  console.log("pressed");
  var state = generateRandomString(16);
  console.log('State to set:', state);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-top-read';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});
var access_token = "", refresh_token = "";
app.get('/token', function (req, res){
  res.send(access_token);
})
app.get('/callback', function(req, res) {//after we are authorized, we are redirected to redirectURI, currently callback

  // your application requests refresh and access tokens
  // after checking the state parameter
  console.log("Callback request received"); // Add this line
  console.log('Stored state:', storedState);
  console.log('Received state:', state);
  console.log('Callback request received', req.query); // Log the entire query object

  res.header('Access-Control-Allow-Origin', 'http://localhost:5173'); // Allow requests from your browser app
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

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
        access_token = body.access_token,
            refresh_token = body.refresh_token;
        console.log(access_token);
        res.redirect("http://localhost:5173/user.html");
      } 
      else {
        res.json({error: 'invalid-token'});
      }
    });
  }
});

app.get('/fetch-data', async function(req, res) {
  try {
    const access_token = req.query.access_token; // Get access token from query parameter
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
    request.get(options, async function(error, response, trackData) {
      if (error && response.statusCode !== 200) {
        res.status(response.statusCode).json({ error: 'invalid-token' });
        return;
      }
      request.get(options2, async function(error, response, artistData) {
        if(error && response.statusCode !== 200) {
          res.status(response.statusCode).json({ error: 'invalid-token' });
        }
        const combinedData = {tracks: trackData, artists: artistData};
        res.json(combinedData);
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'server-error' });
  }
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

console.log('Listening on 8888');
app.listen(8888);
