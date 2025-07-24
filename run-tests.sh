#!/bin/bash

echo "🎭 Adrian Wedd Terminal Interface - Test Suite"
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🎭 Installing Playwright browsers..."
npx playwright install

echo "🧪 Running Playwright tests..."
npx playwright test --reporter=html

echo ""
echo "📊 Test Results:"
echo "- Screenshots saved to: tests/screenshots/"
echo "- HTML report: playwright-report/index.html"
echo ""
echo "🚀 To view the HTML report:"
echo "npx playwright show-report"
echo ""
echo "📸 To update screenshots:"
echo "npm run screenshots"