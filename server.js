const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const ARCHIVO = path.join(__dirname, 'tickets.json');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));
app.use(express.static(path.join(__dirname, 'public'))); // <-- LÍNEA NUEVA

function leerTickets() {
  try {
    if (!fs.existsSync(ARCHIVO)) return [];
    const contenido = fs.readFileSync(ARCHIVO, 'utf8');
    if (!contenido.trim()) return [];
    return JSON.parse(contenido);
  } catch (error) {
    return [];
  }
}

function guardarTickets(tickets) {
  fs.writeFileSync(ARCHIVO, JSON.stringify(tickets, null, 2), 'utf8');
}

app.get('/', (req, res) => {
  res.render('index', { activa: 'inicio' });
});

app.get('/reportar', (req, res) => {
  res.render('reportar', {
    activa: 'reportar',
    exito: req.query.exito === '1'
  });
});

app.post('/reportar', (req, res) => {
  const { solicitante, ubicacion, descripcion } = req.body;
  const tickets = leerTickets();

  tickets.push({
    id: Date.now(),
    solicitante: solicitante.trim(),
    ubicacion: ubicacion.trim(),
    descripcion: descripcion.trim(),
    fecha: new Date().toLocaleString('es-CO')
  });

  guardarTickets(tickets);
  res.redirect('/reportar?exito=1');
});

app.get('/panel', (req, res) => {
  const mensajes = leerTickets();
  res.render('panel', { activa: 'panel', mensajes });
});

app.post('/panel/resolver', (req, res) => {
  const id = Number(req.body.id);
  const tickets = leerTickets().filter(t => t.id !== id);
  guardarTickets(tickets);
  res.redirect('/panel');
});

app.listen(PORT, () => {
  console.log(`HelpDesk corriendo en http://localhost:${PORT}`);
});