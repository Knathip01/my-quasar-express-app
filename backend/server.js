const express = require('express'); 
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());  
app.use(express.json());

// สร้างโฟลเดอร์ logs ถ้ายังไม่มี
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// =========================
// หน้า ROOT ป้องกัน Cannot GET /
// =========================
app.get('/', (req, res) => {
    res.send(`
        <h1>🚀 Backend is Running!</h1>
        <p>Express API พร้อมใช้งานแล้ว</p>
        <p>ลองเรียก <code>/api/demo</code> เพื่อดูตัวอย่างข้อมูล</p>
    `);
});

// =========================
// API Demo
// =========================
app.get('/api/demo', (req, res) => {
    const logMessage = `Request at ${new Date().toISOString()}: ${req.ip}\n`;
    fs.appendFileSync(path.join(logsDir, 'access.log'), logMessage);

    res.json({
        git: {
            title: 'Advanced Git Workflow',
            detail: 'ใช้ branch protection บน GitHub, code review ใน PR, และ squash merge เพื่อ history ที่สะอาด'
        },
        docker: {
            title: 'Advanced Docker',
            detail: 'ใช้ multi-stage build, healthcheck, และ orchestration ด้วย Docker Compose/Swarm'
        }
    });
});

// =========================
// Error Handling
// =========================
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// =========================
// Start Server
// =========================
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
