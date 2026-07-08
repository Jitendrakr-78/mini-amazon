const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Get all products
router.get('/', async (req, res) => {
    try {
        const [products] = await db.query('SELECT * FROM products');
        res.json(products);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Add product (Admin only logic can be handled via frontend check or middleware)
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const { title, description, price, image_url, stock } = req.body;
    try {
        await db.query('INSERT INTO products (title, description, price, image_url, stock) VALUES (?, ?, ?, ?, ?)', 
            [title, description, price, image_url, stock]);
        res.status(201).json({ message: 'Product added successfully' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete product
router.delete('/:id', auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    try {
        await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ message: 'Product deleted successfully' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
