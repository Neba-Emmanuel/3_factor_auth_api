const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
const generateCaptcha = require('./captcha');

const User = require('./models/User');

// Captcha route
router.get('/captcha', (req, res) => {
    const captcha = generateCaptcha();
    req.session.captcha = captcha.text; // Store the CAPTCHA text in the session
  
    res.type('svg').send(captcha.data);
  });

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, captcha} = req.body;
    const sessionCaptcha = req.session.captcha;

    // Validate the CAPTCHA
    if (captcha !== sessionCaptcha) {
        return res.status(401).json({ error: 'Invalid CAPTCHA' });
    }

    // Clear the CAPTCHA from the session
    delete req.session.captcha;

    try {
        // Rest of the registration code...
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
    const newUser = new User({ username, email, password: hashedPassword, otp, captcha });
    newUser.otp = otp; // Assign the OTP value directly to the 'otp' property
    await newUser.save();


      // Create a transporter with your email provider details
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: 'email-address',
      pass: 'password',
    },
  });
  
  // Define the email content
  const mailOptions = {
    from: 'email-address',
    to: req.body.email,
    subject: 'Registration OTP',
    text: `Your OTP for registration is: ${otp}`,
  };
  
  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Failed to send OTP' });
    } else {
      console.log('OTP sent successfully');
      res.status(201).json({ message: 'User registered successfully' });
    }
  });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }

});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password, otp } = req.body;

    // Check if the user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (user.otp !== req.body.otp) {
        return res.status(401).json({ error: 'Invalid OTP' });
    }      

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, 'your-secret-key');

    res.json({ token });

    user.otp = '';
    await user.save();
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Protected route
router.get('/profile', (req, res) => {
  res.json({ message: 'Protected route: User profile' });
});
  
module.exports = router;
