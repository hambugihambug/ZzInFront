const express = require('express');
const router = express.Router();
const db = require('../database/db_connect');

// GET /accidents - 낙상 사고 목록 조회
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                a.accident_id,
                a.patient_id,
                p.patient_name,
                a.accident_dt as accident_date,
                a.accident_YN,
                b.bed_num,
                r.room_name
            FROM accident a
            LEFT JOIN patient p ON a.patient_id = p.patient_id
            LEFT JOIN bed b ON p.bed_id = b.bed_id
            LEFT JOIN room r ON b.room_id = r.room_id
            ORDER BY a.accident_dt DESC
        `;

        const [rows] = await db.query(query);
        res.json({
            code: 0,
            message: '낙상 사고 목록을 성공적으로 조회했습니다.',
            data: rows,
        });
    } catch (error) {
        console.error('Error fetching fall incidents:', error);
        res.status(500).json({
            code: 1,
            message: '낙상 사고 데이터를 불러오는데 실패했습니다.',
        });
    }
});

// GET /fall-incidents/stats - 시간대별 낙상 사고 통계
router.get('/stats', async (req, res) => {
    try {
        const query = `
            SELECT 
                FLOOR(HOUR(accident_dt) / 3) * 3 as hour_start,
                COUNT(*) as count
            FROM accident
            WHERE accident_YN = 'Y'
            GROUP BY FLOOR(HOUR(accident_dt) / 3)
            ORDER BY hour_start
        `;

        const [rows] = await db.query(query);

        // 3시간 간격으로 8개 구간 데이터 생성 (없는 시간대는 0으로 채움)
        const hourlyStats = Array(8)
            .fill(0)
            .map((_, index) => {
                const hourStart = index * 3;
                const found = rows.find((row) => row.hour_start === hourStart);
                return {
                    hour: `${hourStart}시-${hourStart + 2}시`,
                    count: found ? found.count : 0,
                };
            });

        res.json({
            code: 0,
            data: hourlyStats,
        });
    } catch (error) {
        console.error('Error fetching fall incident stats:', error);
        res.status(500).json({
            code: 1,
            message: '낙상 사고 통계를 불러오는데 실패했습니다.',
        });
    }
});

module.exports = router;
