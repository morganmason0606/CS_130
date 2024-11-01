cd backend
source venv/bin/activate
python app.py >./log.txt 2>&1 &
cd ../VitalMotion
npx expo start
