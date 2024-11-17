const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const connectDB = require('./config/db');
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const salt = 10;

// Middleware to increase body size limit
app.use(express.json({ limit: '20mb' }));  // Increase the body size limit if needed
app.use(express.urlencoded({ limit: '20mb', extended: true }));

app.use('/uploads', express.static(__dirname + '/uploads'));


// Middleware setup
app.use(cookieParser());

// Configure CORS
const allowedOrigins = ['http://localhost:3000'];

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dg9itycrz',
  secure:true,
  api_key: 'N73DwUhXeY-awDwks0HNE_rLm68',
  api_secret: 'your-api-secret',
});

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// MongoDB connection
connectDB();

// Ensure the 'uploads' directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir); // Create the directory if it doesn't exist
}

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// Set up storage engine for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // Use the 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique file name with extension
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fieldSize: 10 * 1024 * 1024 // Increase file size limit to 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg','image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('File type is not supported'), false);
    }
    cb(null, true);
  }
});

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

const User = mongoose.model('User', userSchema);

// Car Schema (updated to store image path)
const carSchema = new mongoose.Schema({
  email: String, // Associated user
  title: String,
  description: String,
  image: String, // Store the image path
});

const Car = mongoose.model('Car', carSchema);

// Middleware to verify JWT
const verifyUser = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];  // Extract token from Authorization header
  if (!token) {
    return res.json({ Error: 'You are not authenticated' });
  }

  jwt.verify(token, 'kiri-kiri', (err, decoded) => {
    if (err) return res.json({ Error: 'Invalid Token' });
    req.email = decoded.email;
    req.name = decoded.name;
    next();
  });
};

// Routes

// User registration
app.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const newUser = new User({ ...req.body, password: hashedPassword });
    await newUser.save();
    res.json({ Status: 'Success' });
  } catch (error) {
    console.error(error);
    res.json({ Error: 'Registration error' });
  }
});

// User login
app.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.json({ Error: 'No user found' });

    const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordValid) return res.json({ Error: 'Invalid credentials' });

    const token = jwt.sign({ name: user.name, email: user.email }, 'kiri-kiri', { expiresIn: '1d' });
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
    res.json({ Status: 'Success', token: { token } });
  } catch (error) {
    console.error(error);
    res.json({ Error: 'Login error' });
  }
});

// Logout
app.get('/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'none' });
  res.json({ Status: 'Success' });
});

// Get cars
app.get('/cars', async (req, res) => {
  try {
    const cars = await Car.find();
    res.json(cars);
  } catch (error) {
    console.error(error);
    res.json({ Error: 'Failed to fetch cars' });
  }
});

// Add car with image upload


// Route to add a car with Cloudinary image upload
app.post('/add', verifyUser, async (req, res) => {
  try {
    const { title, description, image } = req.body;
    let imageUrl = image;

    if (image) {
      // If the image is provided, upload it to Cloudinary
      const cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: 'cars', // optional, change to your folder name
      });
      imageUrl = cloudinaryResponse.secure_url; // Save the URL of the uploaded image
    }

    const newCar = new Car({
      email: req.email,
      title,
      description,
      image: imageUrl, // Save the Cloudinary image URL
    });

    await newCar.save();
    res.json({ Status: 'Car added successfully' });
  } catch (error) {
    console.error(error);
    res.json({ Error: 'Failed to add car' });
  }
});


// Remove car
app.post('/removeitem', verifyUser, async (req, res) => {
  try {
    await Car.findByIdAndDelete(req.body.id);
    res.json({ Status: 'Success' });
  } catch (error) {
    console.error(error);
    res.json({ Error: 'Failed to remove car' });
  }
});

// Update car
app.put('/cars/:id', verifyUser, upload.single('image'), async (req, res) => {
  try {
    const carId = req.params.id;
    const { title, description, image } = req.body;
    const car = await Car.findById(carId);

    if (!car) {
      return res.status(404).json({ Error: 'Car not found' });
    }

    // Update car details
    car.title = title || car.title;
    car.description = description || car.description;
    // car.image = image || car.image;

    if (req.file) {
      car.image = `/uploads/${req.file.filename}`; // Update image if uploaded
    }
    
    await car.save();
    res.json({ Status: 'Success', car });
  } catch (error) {
    console.error(error);
    res.status(500).json({ Error: 'Internal Server Error' });
  }
});

// Delete car
app.delete('/cars/:id', verifyUser, async (req, res) => {
  try {
    const carId = req.params.id;
    const car = await Car.findByIdAndDelete(carId);

    if (!car) {
      return res.status(404).json({ Error: 'Car not found' });
    }

    res.json({ Status: 'Success', message: 'Car deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ Error: 'Internal Server Error' });
  }
});




app.get('/cars/:carId', async (req, res) => {
  try {
    const { carId } = req.params;
    
    // Find car by ID in the database
    const car = await Car.findById(carId);

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Send the car details in the response
    console.log(car,'is carrrrrrr')
    return res.json(car);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});



// Server setup
app.listen(8081, () => console.log('Server running on port 8081'));
