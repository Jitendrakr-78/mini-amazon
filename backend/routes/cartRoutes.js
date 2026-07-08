const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Get Cart Items
router.get('/', auth, async (req, res) => {
    try {
        const [cartItems] = await db.query(
            `SELECT cart.id, products.title, products.price, products.image_url, cart.quantity, cart.product_id 
             FROM cart JOIN products ON cart.product_id = products.id WHERE cart.user_id = ?`, [req.user.id]
        );
        res.json(cartItems);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Add to Cart
router.post('/', auth, async (req, res) => {
    const { product_id, quantity } = req.body;
    try {
        const [existing] = await db.query('SELECT * FROM cart WHERE user_id = ? AND product_id = ?', [req.user.id, product_id]);
        if (existing.length > 0) {
            await db.query('UPDATE cart SET quantity = quantity + ? WHERE id = ?', [quantity, existing[0].id]);
        } else {
            await db.query('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)', [req.user.id, product_id, quantity]);
        }
        res.json({ message: 'Added to cart' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Remove from Cart
router.delete('/:id', auth, async (req, res) => {
    try {
        await db.query('DELETE FROM cart WHERE id = ?', [req.params.id]);
        res.json({ message: 'Removed from cart' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
