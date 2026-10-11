#!/bin/bash
set -e
cd "$(dirname "$0")"
if ! command -v npm >/dev/null 2>&1; then
  echo "Node.js/npm was not found. Install Node.js 20 or newer, then run this file again."
  read -r -p "Press Enter to close..." _
  exit 1
fi
if [ ! -d node_modules ]; then
  echo "Installing project dependencies..."
  npm install
fi
echo "Starting Monthwise. Leave this Terminal window open."
npm run dev
