const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const path = require('path');

// Initialize Express
const app = express();
const MONGO_URI = "mongodb://127.0.0.1:27017/online_store";

// Connect to MongoDB
mongoose
    .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => console.error("MongoDB connection error:", err));

// Middleware for parsing request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Static files (HTML and CSS)
app.use(express.static(path.join(__dirname, 'public')));

// Define user schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String
});

// Create user model
const User = mongoose.model('users', userSchema);

// Product model (assumed to already exist)
const productSchema = new mongoose.Schema({
  title: String,
  price: Number
});

const Product = mongoose.model('products', productSchema);

// Order model
const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
  quantity: Number
});

const Order = mongoose.model('orders', orderSchema);

app.post('/auth', async (req, res) => {
  console.log('Request body:', req.body);  // Output request body
  try {
    const { username, email, password, action } = req.body;

    if (action === 'register') {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ username, email, password: hashedPassword });
      await user.save();
      res.json({ message: 'User registered successfully!' });
    } else if (action === 'login') {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: 'User not found' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

      const token = jwt.sign({ userId: user._id }, 'secretkey', { expiresIn: '1h' });
      res.json({ message: 'Login successful', token });
    } else {
      res.status(400).json({ message: 'Invalid action' });
    }
  } catch (err) {
    console.error('Error during auth process:', err);  // Output error
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Endpoint for getting all products
app.get('/products', async (req, res) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, 'secretkey');
    const products = await Product.find();
    res.json({ products });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Endpoint for creating an order
app.post('/orders', async (req, res) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, 'secretkey');
    const userId = decoded.userId;
    const {product_id, quantity } = req.body;

    const order = new Order({ user_id: userId, product_id, quantity });
    await order.save();
    res.json({ message: 'Order created successfully', order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// Endpoint for updating an order
app.put('/orders/:id', async (req, res) => {
  const { quantity } = req.body;
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { quantity }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order updated successfully', order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// Endpoint for deleting an order
app.delete('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
