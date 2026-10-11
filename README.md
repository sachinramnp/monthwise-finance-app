# Monthwise — Broke But Functional: Survive the Month

A responsive personal-finance planning app built for the PROMPT RUN challenge. The sample plan starts with ₹10,000 across 30 days and focuses on making the impact of everyday spending visible before a decision is made.

## Stack

- React 18
- TypeScript
- Vite
- Lucide React icons
- Custom responsive CSS (no UI framework required)
- Browser localStorage for persistence

This is a frontend-only MVP. It does not connect to bank accounts or external financial APIs, and it requires no API keys or backend server.

## Features

- Live budget balance and remaining-budget progress
- Daily safe-spend amount after active commitments
- Purchase decision simulator with live impact preview
- Month-end spending forecast
- Category spending breakdown
- Add income and expense transactions
- Search and category filter on activity history
- Delete transactions and export the ledger as CSV
- Savings goal with editable target and saved amount
- Toggle rent, utilities, subscriptions, and other commitments
- Select the current day in a 30-day plan
- Responsive desktop/tablet/mobile layouts
- localStorage persistence and reset-demo action
- Keyboard focus styles, accessible form labels, dialog semantics, and reduced-motion support

## Run locally

Requires Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`). Keep the terminal process running while using the app.

For a production build:

```bash
npm run build
npm run preview
```

## Suggested demo flow

1. Start on the Overview page and point out the ₹10,000 plan, current balance, safe daily spend, and planned bills.
2. Open **Can I afford something?** and test ₹450, then ₹1,000. Show that the forecast, remaining balance, and daily allowance change before committing the purchase.
3. Record a simulated expense and show the updated activity and spending breakdown.
4. Visit **Goals & bills**, toggle the gym membership, and show the available budget change.
5. Visit **Activity**, filter by category, add income or an expense, and export CSV.
6. Resize to a phone viewport and verify layout and modal/drawer behavior.

## Calculation notes

- Current balance = ₹10,000 starting plan + added income − recorded expenses.
- Protected commitments = the sum of enabled commitments.
- Safe daily spend = (current balance − protected commitments) divided by the remaining plan days.
- Forecast = current balance minus projected spending at the observed average pace and protected commitments.
- Financial pulse is a simple planning indicator derived from available budget and safe daily spend. It is not a bank score or personalized financial advice.

All numbers are illustrative demo data. Use the reset action to restore the original state in the current browser.
