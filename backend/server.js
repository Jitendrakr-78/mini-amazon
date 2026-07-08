const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);

// Mock Checkout Endpoint
app.post('/api/checkout', require('./middleware/auth'), async (req, res) => {
    const { total_price } = req.body;
    try {
        await require('./config/db').query('INSERT INTO orders (user_id, total_price, status) VALUES (?, ?, ?)', 
            [req.user.id, total_price, 'Paid (Mock Payment)']);
        await require('./config/db').query('DELETE FROM cart WHERE user_id = ?', [req.user.id]); // Clear cart
        res.json({ message: 'Order Placed Successfully!' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
