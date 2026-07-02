# CalebLib — Departmental Resource Library System

> Built for the Computer Science Department, Caleb University.

CalebLib is a full-stack web application that gives CS students a single place to find, download, and review academic materials — lecture notes, past questions, project reports, and more — uploaded by their lecturers and managed through a structured approval workflow.

**Live:** https://caleblib.vercel.app

---

## The problem it solves

Before this, course materials lived in WhatsApp groups, random Google Drive links, and individual lecturers' email threads. Students missed resources. Past questions got lost. There was no accountability for what was shared or when.

CalebLib fixes that with a proper three-portal system: students browse and download, staff upload and manage, admins approve content and oversee everything.

---

## What's inside

### Three separate portals

**Students** — register with their matric number (pre-approved by admin), then browse resources filtered by course, level, and semester. They can bookmark materials, submit requests for specific content, leave star ratings and reviews, and track their download history.

**Staff** — upload course materials with full metadata (course code, type, academic year, tags). Track how many times each resource has been viewed or downloaded. Respond to student requests. Post announcements targeted at students.

**Admin** — the control layer. Seeds the student registry from an Excel attendance sheet (bulk upload supported). Creates staff accounts with auto-assigned employee IDs (CSC/STAFF/001, CSC/STAFF/002...). Approves or rejects uploaded resources before they go live. Views the full audit log of every action taken in the system. Runs ML-powered student adaptability analytics.

---

## Machine learning feature

The admin panel includes a Random Forest classifier trained on 1,205 student records from the *Student Adaptability Level in Online Education* dataset. It predicts whether a student profile will result in Low, Moderate, or High adaptability to online learning, with 88.4% accuracy validated through 5-fold cross-validation.

The top predictors the model found: financial condition (17.1%), class duration (14.6%), and age (12.8%).

Admins can input any student profile and get a prediction plus tailored recommendations.

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router, TanStack Query |
| Backend | Node.js, Express 5, MongoDB Atlas, GridFS |
| Auth | JWT (7-day expiry), bcrypt (12 rounds) |
| ML Service | Python, Flask, scikit-learn (Random Forest) |
| File storage | GridFS (preserves original filenames on download) |
| Frontend host | Vercel |
| Backend host | Railway |
| ML host | Railway (separate service) |
| Database | MongoDB Atlas (M0 free tier) |

---

## Security

- Account lockout after 5 failed login attempts (15-minute cooldown)
- Rate limiting: 10 requests/15min on login, 200/15min globally
- Every sensitive action logged to an immutable audit trail with IP and timestamp
- Role-based access control enforced at middleware level
- Passwords hashed with bcrypt at 12 salt rounds

---

## Project structure
caleblib/
├── backend/          # Node.js/Express API
│   └── src/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       └── utils/
├── web/              # React frontend
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       │   ├── admin/
│       │   ├── staff/
│       │   ├── student/
│       │   └── landing/
│       └── services/
└── ml/               # Python ML microservice
├── ml_service.py
├── training_data.csv
├── requirements.txt
└── Procfile

---

## Running locally

You need three terminals.

**Terminal 1 — Backend**
```bash
cd backend && npm install && npm run dev
```

**Terminal 2 — Frontend**
```bash
cd web && npm install && npm run dev
```

**Terminal 3 — ML service**
```bash
cd ml && pip install -r requirements.txt && python3 ml_service.py
```

**backend/.env**
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development
PORT=8000
CLIENT_URL=http://localhost:5173

**web/.env**
VITE_API_URL=http://localhost:8000/api
VITE_ML_URL=http://localhost:5001

---

## Dataset credit

The ML feature uses the *Students Adaptability Level in Online Education* dataset — 1,205 student records covering factors affecting adaptability to online learning environments.

---

## Author

Ndabai Daniel Somtochukwu
Computer Science Department, Caleb University
Final Year Project — 2025/2026
