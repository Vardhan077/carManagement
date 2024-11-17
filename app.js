// // const express = require('express');
// // const dotenv = require('dotenv');
// // const connectDB = require('./config/db');
// // const authRoutes = require('./routes/authRoutes');
// // const carRoutes = require('./routes/carRoutes');

// // dotenv.config();
// // connectDB();

// // const app = express();
// // app.use(express.json()); // for parsing application/json

// // app.use('/api', authRoutes);
// // app.use('/api', carRoutes);

// // module.exports = app;


// // app.js or server.js
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const authRoutes = require('./routes/authRoutes');

// dotenv.config(); // To load environment variables

// const app = express();

// // Middlewares
// app.use(express.json());
// app.use(cors()); // To handle CORS issues

// // Routes
// app.use('/api/auth', authRoutes); // Mount auth routes

// // Connect to MongoDB
// mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('Database connected'))
//   .catch((err) => console.log('Error connecting to database:', err));

// // Start the server
// const port = process.env.PORT || 5000;
// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });



// app.js or server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const connectDB = require('./config/db');

dotenv.config(); // To load environment variables

const app = express();

// Enable CORS for all domains (you can restrict this to specific origins)
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests only from the frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // Allow cookies to be sent with the requests
}));

// Middleware to parse JSON
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes); // Mount auth routes

// Connect to MongoDB
// mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('Database connected'))
//   .catch((err) => console.log('Error connecting to database:', err));
connectDB();

// Start the server
// const port = process.env.PORT || 5000;
// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });
module.exports = app;
