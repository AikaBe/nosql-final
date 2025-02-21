const express = require('express');
const Order = require('../models/order');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware,async (req, res) => {
    try {
        const { product_id, quantity } = req.body;
        const order = new Order({ user_id: req.user.userId, product_id, quantity });
        await order.save();
        res.json({ message: 'Order created successfully', order });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
});

router.get('/', authMiddleware,async (req, res) => {
    try {
        const orders = await Order.find({ user_id: req.user.userId });
        res.json({ orders });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
});

router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { quantity } = req.body;
        const order = await Order.findOneAndUpdate(
            { _id: req.params.id, user_id: req.user.userId },
            { quantity },
            { new: true }
        );
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json({ message: 'Order updated successfully', order });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const order = await Order.findOneAndDelete({ _id: req.params.id, user_id: req.user.userId });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json({ message: 'Order deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
});
module.exports = router;
