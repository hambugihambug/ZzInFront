const express = require('express');
const router = express.Router();
const db = require('../database/db_connect');

// GET /environmental-data - 모든 병실의 현재 온습도 정보만 조회
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                room_id AS roomId,
                room_name AS roomName,
                room_temp AS temperature,
                room_humidity AS humidity,
                CASE 
                    WHEN room_temp > 26 OR room_temp < 20 OR room_humidity > 60 OR room_humidity < 40 
                    THEN '경고' 
                    ELSE '정상' 
                END AS status
            FROM room
        `);

        res.json({
            code: 0,
            data: rows,
        });
    } catch (err) {
        console.error('Error fetching room environmental data:', err);
        res.status(500).json({
            code: 1,
            message: '환경 데이터 조회 실패',
            error: err.message,
        });
    }
});

// GET /environmental-data/:roomId - 특정 병실의 온습도 정보 조회
router.get('/:roomId', async (req, res) => {
    const { roomId } = req.params;

    try {
        const [rows] = await db.query(
            `
            SELECT 
                room_id AS roomId,
                room_name AS roomName,
                room_temp AS temperature,
                room_humidity AS humidity,
                CASE 
                    WHEN room_temp > 26 OR room_temp < 20 OR room_humidity > 60 OR room_humidity < 40 
                    THEN '경고' 
                    ELSE '정상' 
                END AS status
            FROM room
            WHERE room_id = ?
            `,
            [roomId]
        );

        res.json({
            code: 0,
            data: rows,
        });
    } catch (err) {
        console.error('Error fetching room environmental data:', err);
        res.status(500).json({
            code: 1,
            message: '환경 데이터 조회 실패',
            error: err.message,
        });
    }
});

module.exports = router;
