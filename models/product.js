const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: String,
    price: Number
});

module.exports = mongoose.model('products', productSchema);
