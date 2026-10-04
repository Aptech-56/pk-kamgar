import { createServer } from 'vite';
import http from 'http';

async function start() {
  const server = await createServer({
    server: {
      port: 5173,
      host: '127.0.0.1'
    }
  });
  await server.listen();
  console.log(`VITE_READY: http://localhost:5173/`);
}

start().catch(console.error);
