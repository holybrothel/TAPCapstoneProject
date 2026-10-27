#!/bin/bash

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"

cd "$BACKEND_DIR"

export DATABASE_URL="postgresql:///tap_attendance"
export FRONTEND_ORIGIN="http://localhost:5500"

echo "===================================="
echo "  Starting T.A.P. Capstone Project"
echo "===================================="

if ! /opt/homebrew/opt/postgresql@17/bin/pg_isready -q; then
    echo "Starting PostgreSQL..."
    brew services start postgresql@17
    sleep 3
fi

if ! /opt/homebrew/opt/postgresql@17/bin/pg_isready -q; then
    echo "PostgreSQL is not ready. Check your database service."
    exit 1
fi

if [ ! -f ".venv/bin/activate" ]; then
    echo "Python virtual environment not found."
    echo "Restore the .venv environment before starting."
    exit 1
fi

source .venv/bin/activate

cleanup() {
    echo ""
    echo "Stopping T.A.P. development servers..."
    kill "$PYTHON_PID" "$NODE_PID" "$FRONTEND_PID" 2>/dev/null || true
    wait 2>/dev/null || true
}

trap cleanup EXIT INT TERM

echo "Starting DeepFace on port 5000..."
python database/deepface_service.py &
PYTHON_PID=$!

echo "Starting Node.js on port 3000..."
node src/server.js &
NODE_PID=$!

echo "Starting frontend on port 5500..."
python -m http.server 5500 --directory frontend &
FRONTEND_PID=$!

sleep 5

echo ""
echo "===================================="
echo "  T.A.P. startup attempted"
echo "===================================="
echo "Instructor Dashboard:"
echo "http://localhost:5500/instructor.html"
echo ""
echo "Press Control+C to stop the servers."

wait
