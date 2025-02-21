const express = require('express');
const Product = require('../models/product');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, price } = req.body;
        const product = new Product({ title, price });
        await product.save();
        res.json({ message: 'Product added successfully', product });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
});

router.get('/', authMiddleware,  async (req, res) => {
    try {
        const products = await Product.find();
        res.json({ products });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
});

router.put('/:id', authMiddleware,  async (req, res) => {
    try {
        const { title, price } = req.body;
        const product = await Product.findByIdAndUpdate(req.params.id, { title, price }, { new: true });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product updated successfully', product });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
});

router.delete('/:id', authMiddleware,  async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
});

module.exports = router;
