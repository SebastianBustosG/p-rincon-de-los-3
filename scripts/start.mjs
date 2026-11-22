import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import path from 'node:path';
import net from 'node:net';
const root = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const backend = path.join(root, 'backend');
const python = path.join(backend, '.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
const url = 'http://127.0.0.1:3002/';
const project = createHash('sha256').update(root.toLowerCase()).digest('hex');
const children = [];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (!child.pid || child.exitCode !== null) continue;
    if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
    else child.kill('SIGTERM');
  }
  process.exitCode = code;
}
function run(command, args, cwd) {
  const child = spawn(command, args, { cwd, stdio: 'inherit', windowsHide: true });
  children.push(child);
  child.on('error', error => { console.error(error.message); stop(1); });
  child.on('exit', code => { if (!stopping) stop(code || 0); });
  return child;
}
async function json(address) {
  return fetch(address, { signal: AbortSignal.timeout(2000) }).then(r => r.ok ? r.json() : null).catch(() => null);
}
function occupied(port) {
  return new Promise(resolve => {
    const socket = net.createConnection({ host: '127.0.0.1', port });
    const finish = value => { socket.destroy(); resolve(value); };
    socket.once('connect', () => finish(true)); socket.once('error', () => finish(false));
    socket.setTimeout(1000, () => finish(true));
  });
}
process.on('SIGINT', () => stop()); process.on('SIGTERM', () => stop());
const frontend = await json(url + '__colaciones_frontend');
if (await occupied(3002) && frontend?.project !== project) {
  console.error('El puerto 3002 está ocupado por otra aplicación o una versión anterior del servidor. Cierra esa instancia con Ctrl+C y vuelve a ejecutar iniciar.cmd.');
  process.exitCode = 1;
} else {
  const probe = await json('http://127.0.0.1:8001/api/health/');
  if (await occupied(8001) && probe?.service !== 'colaciones-django') {
    console.error('El puerto 8001 está ocupado por otra aplicación. Libéralo antes de iniciar Colaciones.');
    process.exitCode = 1;
  } else {
    if (!probe) {
      run(python, ['manage.py', 'runserver', '127.0.0.1:8001', '--noreload'], backend);
      let ready = false;
      for (let i = 0; i < 50 && !stopping; i++) {
        ready = (await json('http://127.0.0.1:8001/api/health/'))?.service === 'colaciones-django';
        if (ready) break;
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      if (!ready) { console.error('Django no pudo iniciar. Revisa el error anterior.'); stop(1); }
    }
    if (!stopping && frontend?.project === project) {
      console.log(`Colaciones ya está iniciada en ${url} Se reutiliza la instancia existente.`);
      spawnSync(python, ['-m', 'webbrowser', '-t', url], { stdio: 'ignore', windowsHide: true });
    } else if (!stopping) {
      run(process.execPath, [path.join(root, 'node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', '--port', '3002', '--strictPort', '--open'], root);
    }
  }
}