const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const MONGO_URI = "mongodb://127.0.0.1:27017/online_store";

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Подключаем маршруты
app.use('/auth', require('./routes/auth'));
app.use('/products', require('./routes/products'));
app.use('/orders', require('./routes/orders'));

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
