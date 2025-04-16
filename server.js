const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'), (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        createTables();
    }
});

// Create tables
function createTables() {
    db.run(`
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            age INTEGER NOT NULL,
            gender TEXT NOT NULL,
            room TEXT NOT NULL,
            status TEXT NOT NULL,
            condition TEXT NOT NULL
        )
    `);
}

// Routes
// Get all patients
app.get('/api/patients', (req, res) => {
    db.all('SELECT * FROM patients', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Add new patient
app.post('/api/patients', (req, res) => {
    const { name, age, gender, room, status, condition } = req.body;

    db.run(
        'INSERT INTO patients (name, age, gender, room, status, condition) VALUES (?, ?, ?, ?, ?, ?)',
        [name, age, gender, room, status, condition],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({
                id: this.lastID,
                name,
                age,
                gender,
                room,
                status,
                condition,
            });
        }
    );
});

// Delete patient
app.delete('/api/patients/:id', (req, res) => {
    const id = req.params.id;

    db.run('DELETE FROM patients WHERE id = ?', id, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Patient not found' });
            return;
        }
        res.json({ message: 'Patient deleted successfully' });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
