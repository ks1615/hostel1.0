import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  INITIAL_ROOMS, 
  INITIAL_RESIDENTS, 
  INITIAL_PAYMENTS, 
  INITIAL_MAINTENANCE, 
  INITIAL_NOTICES, 
  INITIAL_UPI_CONFIG 
} from './data/initialData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data', 'db.json');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Ensure db.json exists
function loadDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialDb = {
        rooms: INITIAL_ROOMS,
        residents: INITIAL_RESIDENTS,
        payments: INITIAL_PAYMENTS,
        maintenance: INITIAL_MAINTENANCE,
        notices: INITIAL_NOTICES,
        upiConfig: INITIAL_UPI_CONFIG,
        lastUpdated: new Date().toISOString()
      };
      saveDb(initialDb);
      return initialDb;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading db.json:', err);
    return {
      rooms: INITIAL_ROOMS,
      residents: INITIAL_RESIDENTS,
      payments: INITIAL_PAYMENTS,
      maintenance: INITIAL_MAINTENANCE,
      notices: INITIAL_NOTICES,
      upiConfig: INITIAL_UPI_CONFIG,
      lastUpdated: new Date().toISOString()
    };
  }
}

function saveDb(data) {
  try {
    const dataToSave = {
      ...data,
      lastUpdated: new Date().toISOString()
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error saving db.json:', err);
    return false;
  }
}

// REST API Endpoints

// GET full database
app.get('/api/data', (req, res) => {
  const db = loadDb();
  res.json(db);
});

// POST save/update room
app.post('/api/rooms', (req, res) => {
  const roomData = req.body;
  const db = loadDb();

  const idx = db.rooms.findIndex(r => r.id === roomData.id);
  if (idx >= 0) {
    const existingBeds = db.rooms[idx].beds || [];
    const newBeds = Array.from({ length: roomData.capacity }, (_, i) => {
      const bedNo = i + 1;
      const match = existingBeds.find(b => b.bedNo === bedNo);
      return match || { bedNo, residentId: null };
    });
    db.rooms[idx] = { ...roomData, beds: newBeds };
  } else {
    const newBeds = Array.from({ length: roomData.capacity }, (_, i) => ({
      bedNo: i + 1,
      residentId: null
    }));
    db.rooms.push({ ...roomData, beds: newBeds });
  }

  saveDb(db);
  res.json({ success: true, room: roomData });
});

// DELETE room
app.delete('/api/rooms/:id', (req, res) => {
  const roomId = req.params.id;
  const db = loadDb();

  db.rooms = db.rooms.filter(r => r.id !== roomId);
  db.residents = db.residents.filter(r => r.roomId !== roomId);

  saveDb(db);
  res.json({ success: true, message: `Room ${roomId} deleted` });
});

// POST save/update resident
app.post('/api/residents', (req, res) => {
  const residentData = req.body;
  const db = loadDb();

  const idx = db.residents.findIndex(r => r.id === residentData.id);
  if (idx >= 0) {
    db.residents[idx] = residentData;
  } else {
    db.residents.push(residentData);
  }

  // Update bed allocation in rooms
  db.rooms = db.rooms.map(room => {
    if (room.id === residentData.roomId) {
      const updatedBeds = room.beds.map(bed => {
        if (bed.bedNo === residentData.bedNo) {
          return { ...bed, residentId: residentData.id };
        }
        return bed;
      });
      const occCount = updatedBeds.filter(b => b.residentId).length;
      const status = occCount >= room.capacity ? 'Full' : room.status === 'Maintenance' ? 'Maintenance' : 'Occupied';
      return { ...room, beds: updatedBeds, status };
    }
    return room;
  });

  saveDb(db);
  res.json({ success: true, resident: residentData });
});

// POST vacate bed
app.post('/api/residents/vacate', (req, res) => {
  const { roomId, bedNo, residentId } = req.body;
  const db = loadDb();

  db.rooms = db.rooms.map(room => {
    if (room.id === roomId) {
      const updatedBeds = room.beds.map(bed => {
        if (bed.bedNo === bedNo) {
          return { ...bed, residentId: null };
        }
        return bed;
      });
      const occCount = updatedBeds.filter(b => b.residentId).length;
      const status = occCount === 0 ? 'Available' : 'Occupied';
      return { ...room, beds: updatedBeds, status };
    }
    return room;
  });

  db.residents = db.residents.filter(r => r.id !== residentId);

  saveDb(db);
  res.json({ success: true, message: 'Resident vacated' });
});

// POST save payment
app.post('/api/payments', (req, res) => {
  const payment = req.body;
  const db = loadDb();

  db.payments.unshift(payment);
  db.residents = db.residents.map(r => {
    if (r.id === payment.residentId) {
      return { ...r, rentStatus: 'Paid' };
    }
    return r;
  });

  saveDb(db);
  res.json({ success: true, payment });
});

// POST save notice
app.post('/api/notices', (req, res) => {
  const notice = req.body;
  const db = loadDb();

  const idx = db.notices.findIndex(n => n.id === notice.id);
  if (idx >= 0) {
    db.notices[idx] = notice;
  } else {
    db.notices.unshift(notice);
  }

  saveDb(db);
  res.json({ success: true, notice });
});

// DELETE notice
app.delete('/api/notices/:id', (req, res) => {
  const noticeId = req.params.id;
  const db = loadDb();

  db.notices = db.notices.filter(n => n.id !== noticeId);
  saveDb(db);
  res.json({ success: true, message: `Notice ${noticeId} deleted` });
});

// POST sync complete database state
app.post('/api/sync', (req, res) => {
  const syncData = req.body;
  if (!syncData || typeof syncData !== 'object') {
    return res.status(400).json({ success: false, error: 'Invalid data' });
  }
  const cleanData = {
    rooms: syncData.rooms || INITIAL_ROOMS,
    residents: syncData.residents || [],
    payments: syncData.payments || [],
    maintenance: syncData.maintenance || [],
    notices: syncData.notices || [],
    upiConfig: syncData.upiConfig || INITIAL_UPI_CONFIG,
    lastUpdated: new Date().toISOString()
  };
  saveDb(cleanData);
  res.json({ success: true, db: cleanData });
});

// POST reset database
app.post('/api/reset', (req, res) => {
  const initialDb = {
    rooms: INITIAL_ROOMS,
    residents: INITIAL_RESIDENTS,
    payments: INITIAL_PAYMENTS,
    maintenance: INITIAL_MAINTENANCE,
    notices: INITIAL_NOTICES,
    upiConfig: INITIAL_UPI_CONFIG,
    lastUpdated: new Date().toISOString()
  };
  saveDb(initialDb);
  res.json({ success: true, db: initialDb });
});

app.listen(PORT, () => {
  console.log(`✅ Sakhare Plot Hostel Backend Express Server running on http://localhost:${PORT}`);
});
