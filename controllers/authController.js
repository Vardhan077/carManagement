// // const User = require('../models/userModel');
// // const jwt = require('jsonwebtoken');

// // // Register a new user
// // const registerUser = async (req, res) => {
// //     const { name, email, password } = req.body;

// //     try {
// //         const userExists = await User.findOne({ email });
// //         if (userExists) {
// //             return res.status(400).json({ message: 'User already exists' });
// //         }

// //         const user = await User.create({ name, email, password });

// //         const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// //         res.status(201).json({ token, userId: user._id });
// //     } catch (error) {
// //         res.status(500).json({ message: 'Server error' });
// //     }
// // };

// // // Authenticate a user and get token
// // const authUser = async (req, res) => {
// //     const { email, password } = req.body;

// //     try {
// //         const user = await User.findOne({ email });
// //         if (!user) {
// //             return res.status(400).json({ message: 'Invalid credentials' });
// //         }

// //         const isMatch = await user.matchPassword(password);
// //         if (!isMatch) {
// //             return res.status(400).json({ message: 'Invalid credentials' });
// //         }

// //         const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// //         res.json({ token, userId: user._id });
// //     } catch (error) {
// //         res.status(500).json({ message: 'Server error' });
// //     }
// // };

// // module.exports = { registerUser, authUser };








// // controllers/authController.js
// const User = require('../models/userModel'); // User model
// const bcrypt = require('bcrypt'); // Password hashing
// const jwt = require('jsonwebtoken'); // JWT for authentication

// // Signup - Register a new user
// const signup = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // Check if user already exists
//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create a new user
//     const user = new User({ email, password: hashedPassword });

//     // Save user to database
//     await user.save();

//     // Send response with user data (without password)
//     res.status(201).json({ message: 'User registered successfully', user: { email: user.email } });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error });
//   }
// };

// // Login - Authenticate a user and return a JWT token
// const login = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // Find the user by email
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }

//     // Compare entered password with hashed password in the database
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }

//     // Generate JWT token
//     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

//     // Send response with token
//     res.status(200).json({ message: 'Login successful', token });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error });
//   }
// };

// module.exports = { signup, login };



// authController.js

const User = require('../models/userModel'); // Your user model
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare password with hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    return res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
