const express = require('express');
const router = express.Router();
const db = require('../database/db_connect');

// GET /api/rooms - 병실 목록 조회
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM room');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching rooms:', err);
        res.status(500).json({ error: 'Failed to fetch rooms' });
    }
});

module.exports = router;
