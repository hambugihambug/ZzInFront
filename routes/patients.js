const express = require('express');
const router = express.Router();
const db = require('../database/db_connect');

// GET /api/patients - 환자 목록 조회
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                *,
                TIMESTAMPDIFF(YEAR, patient_age, CURDATE()) as age
            FROM patient
        `);
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

// PUT /api/patients/:id - 환자 정보 수정
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { patient_name, patient_age, patient_height, patient_weight, patient_blood, guardian_id, bed_id } = req.body;

    try {
        // 먼저 환자가 존재하는지 확인
        const [existingPatient] = await db.query('SELECT * FROM patient WHERE patient_id = ?', [id]);

        if (existingPatient.length === 0) {
            return res.status(404).json({
                code: 1,
                message: '환자 정보를 찾을 수 없습니다.',
            });
        }

        // 환자 정보 업데이트
        const [result] = await db.query(
            `UPDATE patient SET 
                patient_name = ?,
                patient_age = ?,
                patient_height = ?,
                patient_weight = ?,
                patient_blood = ?,
                guardian_id = ?,
                bed_id = ?,
                patientUpte_id = 1,  -- 임시로 1로 설정 (실제로는 로그인한 사용자의 ID를 사용해야 함)
                patientUpte_dt = CURRENT_TIMESTAMP
            WHERE patient_id = ?`,
            [patient_name, patient_age, patient_height, patient_weight, patient_blood, guardian_id, bed_id, id]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({
                code: 1,
                message: '환자 정보 수정에 실패했습니다.',
            });
        }

        // 업데이트된 환자 정보 조회
        const [updatedPatient] = await db.query('SELECT * FROM patient WHERE patient_id = ?', [id]);

        res.json({
            code: 0,
            message: '환자 정보가 성공적으로 수정되었습니다.',
            data: updatedPatient[0],
        });
    } catch (err) {
        console.error('Error updating patient:', err);
        res.status(500).json({
            code: 1,
            message: '서버 오류가 발생했습니다.',
            error: err.message,
        });
    }
});

// GET /api/patients/:id - 특정 환자 상세 정보 조회
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [patient] = await db.query(
            `
            SELECT 
                *,
                TIMESTAMPDIFF(YEAR, patient_age, CURDATE()) as age
            FROM patient 
            WHERE patient_id = ?
        `,
            [id]
        );

        if (patient.length === 0) {
            return res.status(404).json({
                code: 1,
                message: '환자 정보를 찾을 수 없습니다.',
            });
        }

        res.json({
            code: 0,
            data: patient[0],
        });
    } catch (err) {
        console.error('Error fetching patient:', err);
        res.status(500).json({
            code: 1,
            message: '서버 오류가 발생했습니다.',
            error: err.message,
        });
    }
});

module.exports = router;
