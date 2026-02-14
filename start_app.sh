#!/bin/bash

# Navigate to the script directory
cd "$(dirname "$0")"

echo "🚀 Starting Task Tracker..."

# Install dependencies if missing (only runs if node_modules doesn't exist)
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the latest version
echo "🔨 Building..."
npm run build

# Check if 'serve' is installed, otherwise use npx
echo "🟢 Serving App..."
echo "Your app is running at: http://localhost:3000"
echo "Press Ctrl+C to stop."

# Serve the 'dist' folder on port 3000
npx serve -s dist -l 3000
