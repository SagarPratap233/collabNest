const express = require('express');
const dotenv = require('dotenv');
const session = require('express-session');
const OAuth2Server = require('oauth2-server');
const passport = require('passport');
const mongoose = require('mongoose')
require('./config/passport-setup.js');
//load enviornment variables from .env file     
dotenv.config();

const app = express()
const PORT = process.env.PORT || 3000

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err))


app.use(
  session({
    secret: process.env.clientSecret || 'your-session-secret',
    resave: false,
    saveUninitialized: true
  })
)

// Initialize Passport
app.use(passport.initialize())
app.use(passport.session())

//creating an oAuth server Instance
const oauth = new OAuth2Server({
    model: require('./models/User.js'),
    allowBearerTokensInQueryString: true,
    accessTokenLifetime: 60*60*24
});



app.get("/", (req, res)=> {
    res.send("You have done the first step")
})

app.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
)

// Google will redirect to this route after authentication
app.get(
  '/auth/google/callback',
  passport.authenticate('google'),
  (req, res) => {
    res.redirect('/profile') // Redirect to a protected route
  }
)

// Protected route
app.get('/profile', (req, res) => {
  if (!req.user) {
    return res.redirect('/auth/google')
  }
  res.send(`Welcome ${req.user.googleId}`)
})

app.listen(PORT, ()=> {
    console.log(`Server is listening at ${PORT}`)
})