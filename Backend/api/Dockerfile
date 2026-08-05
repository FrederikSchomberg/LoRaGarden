FROM python:3.12-slim

WORKDIR /app

# systemanforderungen & cache-bereinigung
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# requirements kopieren und installieren
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# quellcode kopieren
COPY . .

# port 8000 im container freigeben
EXPOSE 8000

# uvicorn auf 0.0.0.0 starten
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
