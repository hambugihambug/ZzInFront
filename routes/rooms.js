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

// GET /api/rooms/:roomname - 특정 병실 정보 조회
router.get('/:roomname', async (req, res) => {
    const { roomname } = req.params;
    try {
        // 병실 기본 정보와 해당 병실의 환자 정보를 함께 조회
        const [roomData] = await db.query(
            `SELECT r.*, 
                    COUNT(p.patient_id) as patient_count,
                    GROUP_CONCAT(
                        JSON_OBJECT(
                            'patient_id', p.patient_id,
                            'patient_name', p.patient_name,
                            'patient_age', p.patient_age,
                            'patient_blood', p.patient_blood,
                            'bed_id', p.bed_id
                        )
                    ) as patients
             FROM room r
             LEFT JOIN patient p ON r.room_id = p.bed_id
             WHERE r.room_name = ?
             GROUP BY r.room_id`,
            [roomname]
        );

        if (roomData.length === 0) {
            return res.status(404).json({
                code: 1,
                message: '해당 병실을 찾을 수 없습니다.',
            });
        }

        // patients 문자열을 JSON 배열로 파싱
        const room = roomData[0];
        room.patients = room.patients ? JSON.parse(`[${room.patients}]`) : [];

        res.json({
            code: 0,
            data: room,
        });
    } catch (err) {
        console.error('Error fetching room:', err);
        res.status(500).json({
            code: 1,
            message: '병실 정보 조회 실패',
            error: err.message,
        });
    }
});

module.exports = router;
