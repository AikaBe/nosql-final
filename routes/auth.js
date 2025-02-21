const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const adminEmails = ["admin@example.com", "owner@example.com"];

router.post('/', async (req, res) => {
    try {
        const { username, email, password, action } = req.body;

        if (action === 'register') {
            const hashedPassword = await bcrypt.hash(password, 10);
            const role = adminEmails.includes(email) ? 'admin' : 'user';
            const user = new User({ username, email, password: hashedPassword, role });
            await user.save();
            res.json({ message: 'User registered successfully!' });
        } else if (action === 'login') {
            const user = await User.findOne({ email });
            if (!user) return res.status(400).json({ message: 'User not found' });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

            const token = jwt.sign({ userId: user._id, role: user.role }, 'secretkey', { expiresIn: '1h' });
            res.json({ message: 'Login successful', token });
        } else {
            res.status(400).json({ message: 'Invalid action' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

router.get('/me', authMiddleware, async (req, res) => {
    try {
        console.log("Fetching user with ID:", req.user.userId);

        const user = await User.findById(req.user.userId).select('role');

        if (!user) {
            console.log("User not found in database");
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ role: user.role });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
