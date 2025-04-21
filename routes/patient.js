// 전체 환자 수 조회
router.get('/count', (req, res) => {
    const query = 'SELECT COUNT(*) as count FROM patients';

    db.get(query, [], (err, row) => {
        if (err) {
            return res.status(500).json({
                code: 500,
                message: '환자 수를 조회하는 중 오류가 발생했습니다.',
                error: err.message,
            });
        }

        res.json({
            code: 200,
            message: '전체 환자 수를 성공적으로 조회했습니다.',
            count: row.count,
        });
    });
});

// 최근 7일간 신규 환자 수 조회
router.get('/count/new', (req, res) => {
    const query = `
        SELECT COUNT(*) as count 
        FROM patients 
        WHERE created_at >= datetime('now', '-7 days')
    `;

    db.get(query, [], (err, row) => {
        if (err) {
            return res.status(500).json({
                code: 500,
                message: '신규 환자 수를 조회하는 중 오류가 발생했습니다.',
                error: err.message,
            });
        }

        res.json({
            code: 200,
            message: '신규 환자 수를 성공적으로 조회했습니다.',
            count: row.count,
        });
    });
});
