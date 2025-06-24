#!/bin/bash
set -e

# Load environment variables
cd "$(dirname "$0")"

# Load environment variables from local .env
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs -d '\n')
fi

source .venv/bin/activate

export PYTHONPATH=./app

# Run FastAPI in dev mode
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
