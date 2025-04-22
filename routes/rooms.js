const express = require('express');
const router = express.Router();
const db = require('../database/db_connect');

// GET /api/rooms - 병실 목록 조회
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                r.*,
                COUNT(b.bed_id) as total_beds,
                SUM(CASE WHEN b.bed_status = 'occupied' THEN 1 ELSE 0 END) as occupied_beds
            FROM room r
            LEFT JOIN bed b ON r.room_id = b.room_id
            GROUP BY r.room_id
        `);
        res.json({
            code: 0,
            data: rows,
        });
    } catch (err) {
        console.error('Error fetching rooms:', err);
        res.status(500).json({
            code: 1,
            message: '병실 목록 조회 실패',
            error: err.message,
        });
    }
});
// GET /api/rooms/:roomname - 특정 병실 정보 조회
router.get('/:roomname', async (req, res) => {
    const { roomname } = req.params;

    try {
        const [rows] = await db.query(
            `
            SELECT 
                r.room_id,
                r.room_name,
                r.room_temp,
                r.room_humi as humidity,
                COUNT(b.bed_id) as total_beds,
                SUM(CASE WHEN b.bed_status = 'occupied' THEN 1 ELSE 0 END) as occupied_beds,
                GROUP_CONCAT(
                    DISTINCT
                    CASE WHEN p.patient_id IS NOT NULL 
                    THEN JSON_OBJECT(
                        'patient_id', p.patient_id,
                        'patient_name', p.patient_name,
                        'bed_id', b.bed_id,
                        'bed_num', b.bed_num
                    )
                    END
                ) as patients
            FROM room r
            LEFT JOIN bed b ON r.room_id = b.room_id
            LEFT JOIN patient p ON b.bed_id = p.bed_id
            WHERE r.room_name = ?
            GROUP BY r.room_id
        `,
            [roomname]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                code: 1,
                message: '병실을 찾을 수 없습니다.',
            });
        }

        res.json({
            code: 0,
            data: rows[0],
        });
    } catch (err) {
        console.error('Error fetching room details:', err);
        res.status(500).json({
            code: 1,
            message: '병실 정보 조회 실패',
            error: err.message,
        });
    }
});

module.exports = router;
