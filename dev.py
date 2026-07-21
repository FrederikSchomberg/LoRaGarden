import os
import subprocess
import sys
import time
from pathlib import Path


# verzeichnissvariablen 
root = Path(__file__).parent
backend = root / "Backend" / "api"
frontend = root / "Frontend"

npm = "npm.cmd" if os.name == "nt" else "npm"

# python aus der venv
venv = backend / ".venv"
python_exe = venv / "Scripts" / "python.exe" if os.name == "nt" else venv / "bin" / "python"

backend_process = None
frontend_process = None


try:
    # venv erstellen falls sie fehlt
    if not venv.exists():
        print("venv erstellen ...")
        # legt die .venv für das backend an
        subprocess.check_call([sys.executable, "-m", "venv", ".venv"], cwd=backend)

    # backend pakete installieren
    print("backend pakete isntallieren...")
    #installiert alles aus requirements.txt
    subprocess.check_call([str(python_exe), "-m", "pip", "install", "-r", "requirements.txt"], cwd=backend)

    # frontend pakete installieren falls die fehlen
    if not (frontend / "node_modules").exists():
        print("frontend pakete installieren ...")
        #installiert die npm pakete aus der package.json
        subprocess.check_call([npm, "install"], cwd=frontend)

    # backend starten
    print("starte backend...")
    backend_process = subprocess.Popen(
        [
            str(python_exe),
            "-m",
            "uvicorn",
            "main:app",
            "--reload",
            "--host",
            "127.0.0.1",
            "--port",
            "8001",
        ],
        cwd=backend,
    )

    # frontend starten
    print("starte frontend...")
    frontend_process = subprocess.Popen([npm, "run", "dev"], cwd=frontend)

    print("\nbackend:  http://127.0.0.1:8001")
    print("api docs: http://127.0.0.1:8001/docs")
    print("frontend: http://localhost:5173")
    print("\nstoppen mit strg + c\n")

    # skript offen halten damit frontend und backend weiterlaufen sonst springen wir direkt in den finally bock und beenden den prozess
    while True:
        time.sleep(1)

# strg + c akzeptieren um prozesse zu beenden
except KeyboardInterrupt:
    print("\nstoppe projekt...")

finally:
    # prozesse beenden
    if frontend_process:
        frontend_process.terminate()

    if backend_process:
        backend_process.terminate()

    