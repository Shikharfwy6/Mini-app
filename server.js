require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Cloud'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Database Schema
const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    username: String,
    balance: { type: Number, default: 0 }
});
const User = mongoose.model('User', userSchema);

// API 1: Fetch Balance
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

// API 2: Add Reward
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
