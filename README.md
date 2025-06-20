# Items App

A full-stack Node.js application to catalogue items (clothes, shoes, sports gear, etc.) with the ability to add new items and browse them with rich UI.

## Features

* **Add Items** – Form to upload name, type, description, cover image, and extra images.
* **View Items** – Responsive grid of items; clicking opens a details modal with an image carousel.
* **Enquire** – Visitors can send an enquiry e-mail; SMTP settings pulled from `.env`.
* **Images** – Stored locally in `uploads/` directory.
* **SQLite** database persistence.
* Modern Bootstrap 5 UI and custom CSS.

## Getting Started

### Prerequisites

* Node.js ≥ 16
* npm

### Installation

```bash
# clone the repo (or download)
cd items-app
npm install
cp .env.example .env    # and fill in SMTP credentials
npm start               # starts server on http://localhost:3000
```

### SMTP Setup (Gmail example)

1. Enable 2-Step Verification on your Google account.
2. Generate a 16-character App Password.
3. Put the values in `.env`:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=you@gmail.com
SMTP_PASS=16charapppassword
```

## Project Structure

```
products/
├── public/          # Front-end (HTML/CSS/JS)
├── uploads/         # Uploaded images (generated at runtime)
├── server.js        # Express server & API routes
├── database.sqlite  # SQLite DB (generated at runtime)
├── .env.example     # Sample env vars
└── ...
```

## License

MIT
