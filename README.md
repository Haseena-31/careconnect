# CareConnect – Healthcare Support Web App

A concept-level healthcare support platform built for an NGO. Patients can submit
healthcare support requests through a simple form, and an automated FAQ chatbot
("CareBot") answers common questions instantly.

**This project was built as a Full Stack Developer internship assignment (concept-level).**

---

## Overview

CareConnect connects individuals with healthcare support, volunteers, and essential
assistance through a simple and accessible platform. Visitors can:

- Browse available support services
- Submit a healthcare support request through a validated form
- Receive an automatically generated Request ID and priority level
- Get instant answers from **CareBot 🤖**, an automated FAQ assistant
- Learn about the NGO use case and contact the organization

The app runs fully as a **frontend-only application** using `localStorage`, so it can
be deployed in minutes with zero backend setup. A complete **Express + MongoDB backend**
is also included and structured so the same frontend can be pointed at a real API
later with minimal changes.

---

## Features

- Responsive navbar with mobile menu
- Hero section with clear calls to action
- 4 service category cards
- Fully validated "Request Healthcare Support" form
- Automatic Request ID generation (e.g. `CC-482913`)
- Rule-based priority categorization (High / Medium / Low)
- Live request summary panel + recent requests list (stored in the browser)
- FAQ accordion + floating **CareBot** chatbot with keyword-based matching
- Typing indicator, timestamps, and a clear-chat option in CareBot
- About / NGO use case section
- Contact section with a demo contact form
- Accessible markup: labeled fields, skip link, keyboard-friendly interactions
- No external AI API is used — CareBot is transparently an FAQ-matching concept

---

## Tech Stack

**Frontend:** HTML5, CSS3, Vanilla JavaScript (no frameworks, no build step)
**Backend (included, optional for deployment):** Node.js, Express.js
**Database (included, optional for deployment):** MongoDB (via Mongoose)
**Storage used by default:** Browser `localStorage` (works with zero configuration)

---

## AI/Automation Concept — CareBot

CareBot is an **automated FAQ assistant concept**, not a connection to ChatGPT,
OpenAI, or any external AI service. It works by:

1. Maintaining a predefined knowledge base of question/answer pairs (`FAQ_KB` in
   `script.js`), each tagged with keywords.
2. Matching the visitor's typed message against those keywords using simple string
   matching in JavaScript, scoring each FAQ entry and returning the best match.
3. Falling back to a friendly "I don't have an exact answer" message when nothing
   matches well, so the bot never fabricates information.

The same rule-based approach is used for **priority categorization**: the support
type and description are checked against simple keyword rules (e.g. "Emergency
Assistance" → High priority) — a transparent categorization concept, explicitly
**not** a medical diagnosis or emergency triage tool.

---

## NGO Use Case

CareConnect is designed to help NGOs organize incoming healthcare support requests
and connect people with the right kind of assistance:

- **Easier request collection** — one structured form instead of scattered messages
- **Automated FAQ responses** — CareBot handles repetitive questions instantly
- **Request categorization** — every request gets a Request ID and priority level
- **Better volunteer coordination** — categorized requests are easier to route
- **Improved accessibility** — simple, responsive, mobile-friendly interface

---

## Project Structure

```
careconnect/
│
├── frontend/
│   ├── index.html        # All page sections + CareBot markup
│   ├── style.css          # Design system, layout, responsive rules
│   └── script.js          # Nav, form validation, CareBot, localStorage logic
│
├── backend/
│   ├── server.js          # Express app entry point
│   ├── package.json
│   ├── .env.example       # Template for environment variables
│   ├── routes/
│   │   └── requests.js    # POST/GET /api/requests endpoints
│   └── models/
│       └── Request.js     # Mongoose schema for a support request
│
├── README.md
└── .gitignore
```

---

## How to Run Locally

### Option A — Frontend only (recommended, zero setup)

The app is fully functional using only the frontend and `localStorage`.

1. Download or clone the project.
2. Open `frontend/index.html` directly in a browser, **or** serve it locally:
   ```bash
   cd careconnect/frontend
   npx serve .
   ```
3. Visit the printed local URL (e.g. `http://localhost:3000`).

### Option B — With the backend + MongoDB

1. Install dependencies:
   ```bash
   cd careconnect/backend
   npm install
   ```
2. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
3. Fill in `MONGODB_URI` in `.env` with a MongoDB connection string (a free
   [MongoDB Atlas](https://www.mongodb.com/atlas) cluster works well).
4. Start the server:
   ```bash
   npm start
   ```
   The API will run at `http://localhost:5000`.
5. To make the frontend use the API instead of `localStorage`, update the form
   submit handler in `frontend/script.js` to `fetch()` from
   `http://localhost:5000/api/requests` (the current version uses `localStorage`
   by default so it works without any backend).

---

## Environment Variables

Defined in `backend/.env.example` (copy to `backend/.env`, never commit the real file):

| Variable       | Description                                  |
|----------------|-----------------------------------------------|
| `MONGODB_URI`  | MongoDB connection string                     |
| `PORT`         | Port for the Express server (default `5000`)  |

---

## API Endpoints

| Method | Endpoint                    | Description                                  |
|--------|------------------------------|-----------------------------------------------|
| GET    | `/api/health`                | Health check + DB connection status           |
| POST   | `/api/requests`               | Create a new healthcare support request       |
| GET    | `/api/requests`               | List recent requests (most recent first)      |
| GET    | `/api/requests/:requestId`    | Fetch a single request by its Request ID      |

**Example — create a request:**
```bash
curl -X POST http://localhost:5000/api/requests \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Jane Doe",
    "age": 34,
    "email": "jane@example.com",
    "phone": "+1 555 000 1234",
    "location": "Springfield",
    "supportType": "Medicine Support",
    "description": "Need help accessing regular prescription medicine.",
    "contactMethod": "Email"
  }'
```

---

## Deployment

### 1. Push to GitHub

```bash
cd careconnect
git init
git add .
git commit -m "Initial commit: CareConnect concept app"
git branch -M main
git remote add origin https://github.com/<your-username>/careconnect.git
git push -u origin main
```

*(Create the empty repository first at github.com → New repository, then run the
commands above from your project folder.)*

### 2. Deploy the frontend (required — this gives you the mandatory live link)

The frontend is static, so any static host works. **Netlify** is a simple option:

1. Go to [netlify.com](https://www.netlify.com) → **Add new site → Deploy manually**.
2. Drag and drop the `frontend/` folder, **or** connect your GitHub repo and set
   the **Base directory** to `frontend`.
3. Netlify gives you a live URL (e.g. `https://careconnect-demo.netlify.app`) —
   this is your live hosted link for the submission.

*(Vercel, GitHub Pages, or Render Static Sites work the same way — just point the
host at the `frontend/` folder.)*

### 3. Deploy the backend (optional — only if using the API instead of localStorage)

1. Create a free web service on [Render](https://render.com) or [Railway](https://railway.app).
2. Set the **root directory** to `backend`.
3. Build command: `npm install` — Start command: `npm start`.
4. Add the `MONGODB_URI` and `PORT` environment variables in the host's dashboard
   (never commit `.env` to GitHub).
5. Create a free MongoDB cluster at [MongoDB Atlas](https://www.mongodb.com/atlas),
   allow network access from anywhere (`0.0.0.0/0`) for demo purposes, and copy the
   connection string into `MONGODB_URI`.
6. Once deployed, the host gives you a live API URL — update the `fetch()` calls
   in `frontend/script.js` to point to it.

---

## Future Improvements

- Real AI integration (e.g. a connected language model for richer conversations)
- NGO admin dashboard to view, filter, and update request status
- Automated volunteer matching based on location and support type
- User authentication for patients and NGO staff
- Email/SMS notifications on request status changes
- Real-time request tracking
- Production-grade secure database with role-based access control
- Multilingual support

---

## Disclaimer

This project is a concept-level healthcare support application created for
demonstration purposes. It does not provide medical diagnosis or emergency
medical services. For emergencies, contact your local emergency service or
healthcare provider.
