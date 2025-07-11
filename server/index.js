const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// User Schema for MongoDB
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  membershipType: { type: String, enum: ['basic', 'premium', 'elite'], default: 'basic' },
  joinDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  purchasedPrograms: [String],
  profile: {
    age: Number,
    height: Number,
    weight: Number,
    fitnessGoals: [String],
    medicalConditions: [String]
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Program Schema
const programSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: String,
  duration: String,
  level: String,
  price: Number,
  instructor: {
    name: String,
    experience: String,
    certifications: [String]
  },
  schedule: [{
    day: String,
    time: String,
    spots: Number,
    focus: String
  }],
  benefits: [String],
  equipment: [String]
}, { timestamps: true });

const Program = mongoose.model('Program', programSchema);

// Contact/Inquiry Schema
const inquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  message: { type: String, required: true },
  type: { type: String, enum: ['general', 'membership', 'program', 'support'], default: 'general' },
  status: { type: String, enum: ['new', 'in-progress', 'resolved'], default: 'new' }
}, { timestamps: true });

const Inquiry = mongoose.model('Inquiry', inquirySchema);

// Membership Schema
const membershipSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  planType: { type: String, enum: ['basic', 'premium', 'elite'], required: true },
  startDate: { type: Date, default: Date.now },
  endDate: Date,
  isActive: { type: Boolean, default: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  amount: Number
}, { timestamps: true });

const Membership = mongoose.model('Membership', membershipSchema);

// Middleware for JWT authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'FitZone API is running',
    timestamp: new Date().toISOString()
  });
});

// User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        membershipType: user.membershipType
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        membershipType: user.membershipType,
        purchasedPrograms: user.purchasedPrograms
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get user profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password; // Don't allow password updates through this endpoint
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit contact inquiry
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, message, type = 'general' } = req.body;

    const inquiry = new Inquiry({
      name,
      email,
      phone,
      message,
      type
    });

    await inquiry.save();

    res.status(201).json({
      message: 'Inquiry submitted successfully',
      inquiryId: inquiry._id
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all programs
app.get('/api/programs', async (req, res) => {
  try {
    const programs = await Program.find();
    res.json(programs);
  } catch (error) {
    console.error('Programs fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Purchase program
app.post('/api/programs/:programId/purchase', authenticateToken, async (req, res) => {
  try {
    const { programId } = req.params;
    const userId = req.user.userId;

    // Add program to user's purchased programs
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { purchasedPrograms: programId } }
    );

    res.json({ message: 'Program purchased successfully' });
  } catch (error) {
    console.error('Program purchase error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's purchased programs
app.get('/api/user/programs', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('purchasedPrograms');
    res.json({ purchasedPrograms: user.purchasedPrograms || [] });
  } catch (error) {
    console.error('User programs fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create membership
app.post('/api/memberships', authenticateToken, async (req, res) => {
  try {
    const { planType, amount } = req.body;
    const userId = req.user.userId;

    const membership = new Membership({
      userId,
      planType,
      amount,
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });

    await membership.save();

    // Update user's membership type
    await User.findByIdAndUpdate(userId, { membershipType: planType });

    res.status(201).json({
      message: 'Membership created successfully',
      membership
    });
  } catch (error) {
    console.error('Membership creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
const startServer = async () => {
  await connectMongoDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API Health Check: http://localhost:${PORT}/api/health`);
  });
};

startServer();