#!/bin/bash
cd backend
source venv/bin/activate
python app.py >./log.txt 2>&1 &
BACKEND_PID=$!
cd ../VitalMotion
npx expo start
trap "echo 'Terminating backend...'; kill $BACKEND_PID; exit" INT
wait $BACKEND_PID
