var express = require('express');
var router = express.Router();
const db = require('../database/db_connect');

router.get('/patients', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM patient');
        res.json({ code: 0, data: rows });
    } catch (err) {
        console.error('Error fetching patients:', err);
        res.status(500).json({ code: 1, message: '환자 정보 조회 실패', error: err });
    }
});
// 특정 환자 정보 조회
router.get('/patients/:id', async function (req, res) {
    const patientId = req.params.id;

    try {
        const [rows] = await db.query('SELECT * FROM patient WHERE patient_id = ?', [patientId]);

        if (rows.length > 0) {
            res.json({ code: 0, data: rows[0] });
        } else {
            res.status(404).json({ code: 1, message: '환자를 찾을 수 없습니다.' });
        }
    } catch (err) {
        console.error('Error fetching patient:', err);
        res.status(500).json({ code: 1, message: '환자 정보 조회 실패', error: err });
    }
});

module.exports = router;
