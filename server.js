const express = require('express');
const app = express();
const connectDB = require('./db');
const authRouter = require('./auth');
const session = require('express-session');

const port = 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Session middleware
app.use(
    session({
      secret: 'keyboard cat',
      resave: false,
      saveUninitialized: true,
    })
  );
app.use('/api/auth', authRouter);

// Routes
app.get('/', (req, res) => {
  res.send('API is running');
});

// Start the server
app.listen(port, () => {
  connectDB();
  console.log(`Server is running on port ${port}`);
});
