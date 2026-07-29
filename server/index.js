import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Initial mock data if DB doesn't exist
const initialData = {
  reports: [
    {
      id: 'rep-1706695200000',
      title: 'Banjir Bandang',
      category: 'BANJIR',
      description: 'Air setinggi pinggang orang dewasa merendam jalan utama.',
      latitude: -7.2575,
      longitude: 112.7521,
      status: 'UNVERIFIED',
      createdAt: new Date().toISOString(),
      upvotes: 5,
      validationsCount: 1,
      commentsCount: 0,
      comments: []
    }
  ]
};

// Load DB
let db = { reports: [] };
try {
  if (fs.existsSync(DB_FILE)) {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    db = JSON.parse(data);
  } else {
    db = initialData;
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  }
} catch (e) {
  console.error('Error loading DB:', e);
  db = initialData;
}

const saveDb = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error('Error saving DB:', e);
  }
};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Send initial data to the new client
  socket.emit('init_data', db.reports);

  // Handle new report
  socket.on('add_report', (report) => {
    db.reports.push(report);
    saveDb();
    io.emit('report_added', report); // broadcast to all
  });

  // Handle update report
  socket.on('update_report', (updatedReport) => {
    const index = db.reports.findIndex((r) => r.id === updatedReport.id);
    if (index !== -1) {
      db.reports[index] = updatedReport;
      saveDb();
      io.emit('report_updated', updatedReport);
    }
  });

  // Handle new comment
  socket.on('add_comment', ({ reportId, comment }) => {
    const index = db.reports.findIndex((r) => r.id === reportId);
    if (index !== -1) {
      if (!db.reports[index].comments) db.reports[index].comments = [];
      db.reports[index].comments.push(comment);
      db.reports[index].commentsCount = db.reports[index].comments.length;
      saveDb();
      io.emit('report_updated', db.reports[index]);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = 3001;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Socket.IO Server running on http://0.0.0.0:${PORT}`);
});
