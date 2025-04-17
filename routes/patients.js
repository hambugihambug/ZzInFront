const express = require('express');
const router = express.Router();
const db = require('../database/db_connect');

// GET /api/patients - 환자 목록 조회
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM patient');
        res.json({ code: 0, data: rows });
    } catch (err) {
        console.error('Error fetching patients:', err);
        res.status(500).json({ code: 1, message: '환자 정보 조회 실패', error: err });
    }
});

// POST /patients - 환자 추가
router.post('/', async (req, res) => {
    const {
        patient_name,
        patient_age,
        patient_height,
        patient_weight,
        patient_blood,
        guardian_id,
        bed_id,
        patientCrte_id,
        patientCrte_dt,
        patientUpte_id,
        patientUpte_dt,
    } = req.body;

    try {
        const [result] = await db.query(
            `INSERT INTO patient (
                patient_name,
                patient_age,
                patient_height,
                patient_weight,
                patient_blood,
                guardian_id,
                bed_id,
                patientCrte_id,
                patientCrte_dt,
                patientUpte_id,
                patientUpte_dt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                patient_name,
                patient_age,
                patient_height,
                patient_weight,
                patient_blood,
                guardian_id,
                bed_id,
                patientCrte_id,
                patientCrte_dt,
                patientUpte_id,
                patientUpte_dt,
            ]
        );
        res.status(201).json({ patient_id: result.insertId, ...req.body });
    } catch (err) {
        console.error('Error adding patient:', err);
        res.status(500).json({ error: 'Failed to add patient' });
    }
});

// DELETE /api/patients/:id - 환자 삭제
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM patient WHERE patient_id = ?', [id]);
        res.status(204).send();
    } catch (err) {
        console.error('Error deleting patient:', err);
        res.status(500).json({ error: 'Failed to delete patient' });
    }
});

module.exports = router;
