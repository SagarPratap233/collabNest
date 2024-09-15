const http = require('http')
const express = require('express')
const { Server } = require('socket.io')
const dotenv = require('dotenv')
const session = require('express-session')
const cors = require('cors')
const passport = require('passport')
const mongoose = require('mongoose')
require('./config/passport-setup.js')

// Load environment variables
dotenv.config()

const app = express()
const server = http.createServer(app) // Create HTTP server
const io = new Server(server) // Create Socket.io server

const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.static('public')) // Serve static files

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
    saveUninitialized: true,
  })
)

app.use(passport.initialize())
app.use(passport.session())

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A user connected')
  socket.on('disconnect', () => {
    console.log('User disconnected')
  })
})

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html')
})

app.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
)

app.get(
  '/auth/google/callback',
  passport.authenticate('google'),
  (req, res) => {
    res.redirect('/profile')
  }
)

app.get('/profile', (req, res) => {
  if (!req.user) {
    return res.redirect('/auth/google')
  }
  res.send(`Welcome ${req.user.googleId}`)
})

// Start server
server.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`)
})
