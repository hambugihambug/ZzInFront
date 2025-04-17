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

// DELETE /api/rooms/:id - 병실 삭제
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query(`DELETE FROM room WHERE id = ?`, [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Room not found' });
        }
        res.json({ message: 'Room deleted successfully' });
    } catch (err) {
        console.error('Error deleting room:', err);
        res.status(500).json({ error: 'Failed to delete room' });
    }
});

// GET /api/rooms/:id - 특정 병실 조회
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await db.query(`SELECT * FROM room WHERE id = ?`, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Room not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching room:', err);
        res.status(500).json({ error: 'Failed to fetch room' });
    }
});
module.exports = router;
