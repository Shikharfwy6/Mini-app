require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
app.use(express.json());

// Serve static files from root directory
app.use(express.static(__dirname));

// MongoDB Connection Configuration
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("CRITICAL ERROR: MONGODB_URI environment variable is not defined.");
} else {
    mongoose.connect(MONGODB_URI)
        .then(() => console.log('Connected to MongoDB Cloud'))
        .catch(err => console.error('MongoDB connection error:', err));
}

// User Database Schema
const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    username: String,
    balance: { type: Number, default: 0 }
});
const User = mongoose.model('User', userSchema);

// Route 1: Serve Frontend index.html at root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route 2: API Fetch User Balance
app.get('/api/user/:id', async (req, res) => {
    try {
        let user = await User.findOne({ userId: req.params.id });
        if (!user) {
            user = await User.create({ userId: req.params.id, balance: 0 });
        }
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Route 3: API Add Reward
app.post('/api/reward', async (req, res) => {
    const { userId, username, reward } = req.body;
    try {
        let user = await User.findOneAndUpdate(
            { userId },
            { $inc: { balance: reward }, $setOnInsert: { username } },
            { new: true, upsert: true }
        );
        res.json({ success: true, balance: user.balance });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Export app for Vercel Serverless environment
module.exports = app;

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
