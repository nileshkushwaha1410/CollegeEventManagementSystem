# College Event Management System

A web-based application designed to simplify college event management by connecting students and administrators through a centralized platform.

## Features

- Student registration and login
- Student and admin dashboards
- Create, update, and delete events
- Browse and search college events
- Event registration and cancellation
- QR code-based attendance management
- Event feedback and ratings
- Announcements and notifications
- Event reminders
- Admin analytics and reports

## Technology Stack

### Frontend
- React
- Vite
- JavaScript
- HTML and CSS
- React Router

### Backend
- Node.js
- Express.js
- MongoDB

## Project Structure

```text
CollegeEventManagementSystem/
├── Backend/
└── FrontEnd/
    └── college-event-management/
        ├── public/
        ├── src/
        ├── package.json
        └── README.md
```

## Getting Started

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Start the frontend

```bash
cd FrontEnd/college-event-management
npm install
npm run dev
```

Open the local URL displayed in your terminal.

### 3. Start the backend

Open another terminal:

```bash
cd Backend
npm install
```

Configure the required environment variables in a local `.env` file before starting the backend. Never commit passwords, API keys, or database credentials.

Run the backend using the start command configured in `Backend/package.json`.

## Project Status

This project is under development as an academic mini project.

## Purpose

The goal is to make college event organization, student registration, attendance tracking, announcements, and event reporting easier through one platform.