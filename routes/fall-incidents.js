const express = require('express');
const router = express.Router();
const db = require('../database/db_connect');

// GET /accidents - 환자 목록 조회
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                a.accident_id,
                a.patient_id,
                p.patient_name,    -- patient 테이블의 patient_name 컬럼
                a.accident_date,
                a.accident_YN
            FROM accident a
            LEFT JOIN patient p ON a.patient_id = p.patient_id  -- patient 테이블과 patient_id로 조인
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

module.exports = router;
