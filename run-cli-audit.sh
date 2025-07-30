#!/bin/bash

# CLI Command Audit Runner
# Quick script to run CLI tests for the Adrian Wedd terminal

echo "🚀 CLI Command Audit Tool"
echo "========================="
echo ""

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found. Please run from the project root directory."
    exit 1
fi

# Check for dependencies
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "❌ Error: Python not found. Please install Python to run the test server."
    exit 1
fi

echo "📡 Starting local server..."

# Start local server in background
PORT=8888
$PYTHON_CMD -m http.server $PORT &
SERVER_PID=$!

# Wait for server to start
sleep 2

echo "🌐 Server running at http://localhost:$PORT"
echo "📊 Opening CLI test interface..."

# Open the test page
if command -v open &> /dev/null; then
    # macOS
    open "http://localhost:$PORT/cli-test-simple.html"
elif command -v xdg-open &> /dev/null; then
    # Linux
    xdg-open "http://localhost:$PORT/cli-test-simple.html"
elif command -v start &> /dev/null; then
    # Windows
    start "http://localhost:$PORT/cli-test-simple.html"
else
    echo "🔧 Manual: Open http://localhost:$PORT/cli-test-simple.html in your browser"
fi

echo ""
echo "📋 Test Instructions:"
echo "1. Click 'Quick Test' for basic commands only"
echo "2. Click 'Run Full Audit' for comprehensive testing"
echo "3. Check 'Show Terminal Frame' to see command execution"
echo "4. Results will show as: ✅ Passed | ❌ Failed | 💥 Error | ⚠️ No Output"
echo ""
echo "⚠️  Note: Some commands like 'chat', 'monitor', 'split' may appear to fail"
echo "   because they open interactive interfaces that the test can't detect."
echo ""
echo "🛑 Press Ctrl+C to stop the server when done testing"

# Keep server running until user stops it
trap "echo ''; echo '🛑 Stopping server...'; kill $SERVER_PID; exit 0" INT

# Wait for user to stop
while kill -0 $SERVER_PID 2>/dev/null; do
    sleep 1
done

echo "✅ Server stopped."