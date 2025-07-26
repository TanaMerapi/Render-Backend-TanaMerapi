import User from '../models/UserModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Register controller (ADD THIS TO YOUR EXISTING AuthController.js)
export const register = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Create new user (password will be hashed automatically by the model hook)
    const user = await User.create({
      username,
      password
    });
    
    // Return success response (don't send password)
    res.status(201).json({
      message: 'Admin user registered successfully',
      user: {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login controller
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user by username
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Compare password (use bcrypt since passwords are hashed)
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Wrong password' });
    }
    
    // Generate tokens
    const userId = user.id;
    const accessToken = jwt.sign(
      { userId, username: user.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '20m' }
    );
    
    const refreshToken = jwt.sign(
      { userId, username: user.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '1d' }
    );
    
    // Save refresh token to database
    await User.update({ refresh_token: refreshToken }, {
      where: { id: userId }
    });
    
    // Set refresh token in cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      secure: process.env.NODE_ENV === 'production', // secure in production
      sameSite: 'strict'
    });
    
    // Send response with access token
    res.json({ 
      accessToken,
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Refresh token controller
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Find user with this refresh token
    const user = await User.findOne({
      where: { refresh_token: refreshToken }
    });
    
    if (!user) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    // Verify refresh token
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      // Generate new access token
      const accessToken = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '20m' }
      );
      
      res.json({ accessToken });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Logout controller
export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(200).json({ message: 'Logged out' });
    }
    
    // Find user with this refresh token
    const user = await User.findOne({
      where: { refresh_token: refreshToken }
    });
    
    if (user) {
      // Clear refresh token in database
      await User.update({ refresh_token: null }, {
        where: { id: user.id }
      });
    }
    
    // Clear refresh token cookie
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Logged out' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};