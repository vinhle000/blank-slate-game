# Blank Slate Game

A multiplayer, real-time game inspired by **[Blank Slate](https://boardgamegeek.com/boardgame/254188/blank-slate)** with WebSocket-based communication, a PostgreSQL database backend, and a sleek front-end built using **React** and **Vite**.

## **Game Description**

Blank Slate is a fun, interactive game where players submit their answers to a given prompt and score points based on matching answers. Players can join a room, participate in rounds, and compete to become the highest scorer. This project is a full-stack application that supports multiple players, real-time game updates, and stores player data in a PostgreSQL database.


Play the live game 👉 [blank-slate-game.vercel.app](https://blank-slate-game.vercel.app)

<!--- ---

## 📚 Table of Contents
- [🖼️ Demo (Game Flow)](#️-demo-game-flow)
- [🛠 Tech Stack](#-tech-stack)
- [🧪 How to Run Locally](#-how-to-run-locally)
- [🚀 Deployment](#-deployment)
- [⚙️ Features](#️-features)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)
- [🙏 Acknowledgements](#-acknowledgements)

--- --->


<h2>Demo (Game Flow)</h2>

<p float="left">
  <img src="https://github.com/user-attachments/assets/3af62597-5b83-4cfb-9bea-9de910c2f830" width="150" />
  <img src="https://github.com/user-attachments/assets/07551a8c-f655-4445-be7b-f64d5c173d00" width="150" />
</p>
<p><strong>1. Landing Page</strong> &nbsp;&nbsp;&nbsp;&nbsp; <strong>2. Host Lobby</strong></p>

<br/>

<p float="left">
  <img src="https://github.com/user-attachments/assets/c5b128a3-ddde-4393-9549-a498b8623a8e" width="300" />
  <img src="https://github.com/user-attachments/assets/39918ad8-1000-4271-a3da-b7cb7a6b90d0" width="300" />
</p>
<p><strong>3. Players Join Room</strong> &nbsp;&nbsp;&nbsp;&nbsp; <strong>      4. Host Chooses Prompt</strong></p>

<br/>

<p float="left">
  <img src="https://github.com/user-attachments/assets/61350e35-202a-411a-900b-91791e94cea0" width="300" />
  <img src="https://github.com/user-attachments/assets/28990d0b-6705-498e-9613-f0b77fb8fe4c" width="300" />
</p>
<p><strong>5. Players Submit Answers</strong> &nbsp;&nbsp;&nbsp;&nbsp; <strong>      6. Answer Reveal</strong></p>

<br/>

<p float="left">
  <img src="https://github.com/user-attachments/assets/27a6949a-d0ef-4acb-bf6c-89a29d0ae578" width="300" />
</p>
<p><strong>7. Round Results & Scoreboard</strong></p>
---

## Tech Stack

- **Frontend**: React, Vite, TailwindCSS
- **Backend**: Node.js, Express, WebSockets (Socket.io)
- **Database**: PostgreSQL (hosted on [Neon](https://neon.tech))
- **Hosting**:
  - **Frontend**: Vercel
  - **Backend**: Render

---

## How to Run Locally

### Prerequisites

- Node.js (>= 14.x)
- PostgreSQL (local or Neon-hosted)
- Vite (for frontend)
- Socket.io-client

### Backend Setup

```bash
git clone https://github.com/your-username/blank-slate-game.git
cd blank-slate-game/server
npm install
```

Create a `.env` file in `server/`:
```env
DATABASE_URL=postgresql://your-username:your-password@localhost:5432/your-db-name
VITE_API_BASE_URL=http://localhost:3000
```

Start the backend:
```bash
npm start
```

### Frontend Setup

```bash
cd ../client
npm install
```

Create a `.env` in `client/`:
```env
VITE_API_BASE_URL=http://localhost:3000
```

Start the frontend:
```bash
npm run dev
```

### Accessing the App
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:3000](http://localhost:3000)

---

## Deployment

This project is live on:
- **Frontend (Vercel)**: [blank-slate-game.vercel.app](https://blank-slate-game.vercel.app)
- **Backend (Render)**: [blank-slate-game.onrender.com](https://blank-slate-game.onrender.com)

---

## Features

- Real-time multiplayer gameplay with Socket.io
- Persistent player data in PostgreSQL
- Game state synced across users in real-time
- Room-based flow (join, submit answers, score)
- Clean, mobile-friendly UI with TailwindCSS

---

## Contributing

This is a solo portfolio project, but feel free to fork it or reach out with suggestions!

---

## License

This project is intended for personal and educational use only.

---

## Acknowledgements

- [Socket.io](https://socket.io/)
- [Vite](https://vitejs.dev/)
- [Neon](https://neon.tech/)
- [Render](https://render.com/)
- [Vercel](https://vercel.com/)
- [TailwindCSS](https://tailwindcss.com/)
