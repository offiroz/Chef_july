# Chef July

AI-powered recipe application built with Express.js and Google Gemini AI.

## Setup

1. Clone the repository
2. Run `npm install`
3. Copy `.env.example` to `.env` and fill in your values
4. Run `npm run dev` for development or `npm start` for production

## Project Structure

```
Chef_july/
├── frontend/
│   ├── css/          # Stylesheets
│   ├── js/           # Client-side JavaScript
│   ├── assets/gifs/  # Images and animations
│   └── pages/        # HTML pages
├── backend/
│   ├── config/       # App configuration
│   ├── middleware/    # Express middleware
│   ├── routes/       # API routes
│   ├── controllers/  # Route handlers
│   ├── services/     # Business logic & AI integration
│   ├── utils/        # Utility functions
│   └── db/           # Database setup & queries
├── data/             # SQLite database files
├── .env.example      # Environment variables template
└── package.json
```

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** SQLite3
- **AI:** Google Gemini AI
- **Auth:** bcrypt, express-session
