# FinanceBuddy

FinanceBuddy is a modern, open source personal finance management web application. It helps users track accounts, transactions, budgets, and recurring payments with a clean, intuitive interface.

![FinanceBuddy Dashboard](screenshot.png)

## Features

### Core Functionality
- **Dashboard:** Overview of balances, income, expenses, and budget progress
- **Accounts:** Manage multiple financial accounts with different types
- **Transactions:** Add, edit, and categorize transactions with detailed tracking
- **Budgets:** Set and monitor monthly budgets by category with visual progress
- **Recurring Transactions:** Automate regular income and expenses with flexible scheduling
- **Categories:** Organize transactions with custom income and expense categories

### User Experience
- **Authentication:** Secure user login and session management
- **Responsive UI:** Works great on desktop and mobile devices
- **Dark/Light Theme:** Toggle between themes for comfortable viewing
- **Real-time Updates:** Live dashboard updates and transaction tracking

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** Express, TypeScript
- **Database:** PostgreSQL (via Drizzle ORM)
- **Build Tools:** Vite, esbuild

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/dina0elsergani/FinanceBuddy.git
   cd FinanceBuddy
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure the database:**
   - Set up a PostgreSQL database.
   - Copy `.env.example` to `.env` and update with your database credentials.
4. **Run database migrations:**
   ```bash
   npm run db:push
   ```
5. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5000`.

## Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Variables
Create a `.env` file with the following variables:
```
DATABASE_URL=postgresql://username:password@localhost:5432/financebuddy
SESSION_SECRET=your-session-secret
```

## Scripts
- `npm run dev` — Start the app in development mode
- `npm run build` — Build the app for production
- `npm run start` — Start the app in production mode
- `npm run db:push` — Run database migrations

## Contributing

Contributions are welcome! To contribute:
1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to your fork and open a pull request

Please follow the code style and include tests where appropriate.

## License

This project is licensed under the MIT License. 