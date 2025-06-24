FROM python:3.11-slim

WORKDIR /app

COPY ./apps/backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ./apps/backend/app ./app
## COPY ./apps/backend/.env .env

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

