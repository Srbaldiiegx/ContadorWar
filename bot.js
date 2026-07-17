const tmi = require('tmi.js');
const admin = require('firebase-admin');

// 1. Configura Firebase Admin (Necesitarás el archivo de servicio que explicaré abajo)
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://contador2k26-default-rtdb.europe-west1.firebasedatabase.app"
});

const db = admin.database();

// 2. Conexión a Twitch
const client = new tmi.Client({
  channels: ['srbaldiiegx']
});

const http = require('http');
// Crea un servidor básico que responde 200 OK para que Render sepa que está vivo
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Bot activo');
}).listen(process.env.PORT || 3000);

client.connect();

client.on('message', (channel, tags, message, self) => {
  if (self) return;

  const args = message.split(' ');
  const command = args[0]; // !rojo, !verde, etc.
  const points = parseInt(args[1]); // el número

  // Solo permitir a broadcasters o moderadores
  if (tags.mod || tags['badges-raw']?.includes('broadcaster')) {
    if (['!rojo', '!verde', '!azul'].includes(command)) {
      const team = command.replace('!', '');
      const ref = db.ref('puntos/' + team);
      
      ref.transaction((currentPoints) => {
        return (currentPoints || 0) + (isNaN(points) ? 0 : points);
      });
    }
  }
});
