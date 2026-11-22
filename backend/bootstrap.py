import subprocess, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent
PYTHON = ROOT / '.venv' / ('Scripts/python.exe' if sys.platform == 'win32' else 'bin/python')
def run(args): subprocess.run(args, cwd=ROOT, check=True)
if not PYTHON.exists(): run([sys.executable, '-m', 'venv', str(ROOT / '.venv')])
if subprocess.run([str(PYTHON), '-c', 'import django; assert django.VERSION[:2] == (6, 0)'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode:
    run([str(PYTHON), '-m', 'pip', 'install', '-r', str(ROOT / 'requirements.txt')])
run([str(PYTHON), 'manage.py', 'migrate', '--noinput'])
run([str(PYTHON), 'manage.py', 'init_local'])
