var express = require('express');
var session = require('cookie-session'); // Charge le middleware de sessions

var app = express();
var server = require('http').createServer(app);

/* On utilise les sessions */
app.use(session({secret: 'todotopsecret'}));

var io = require('socket.io').listen(server);

app.get('/', (req, res, next) => {
  res.sendFile(__dirname + '/views/todo.html');
})

var liste = [];

io.sockets.on('connection', (socket, message) => {

  /* 1ere action
     au démarrage de la page, on charge la liste, qu'elle soit vide ou non
  */
  //console.log('serveur connecté !!' + liste);
  socket.emit('liste', liste);
  socket.broadcast.emit('liste', liste);

  /* A réception d'un nouveau todo, on l'insère dans la liste, puis on
    "broadcaste" la liste mise à jour aux autres clients
  */
  socket.on('message', message => {
    //console.log('message reçu côté serveur: ' + message);
    liste.push(message);
    socket.emit('liste', liste);
    socket.broadcast.emit('liste', liste);
    //console.log('liste envoyée : ' + liste);
  });

  /* lorsqu'une demande de suppression est reçu, io retire l'élément reçu en
     argument de la liste et renvoie la liste mise à jour à tous les clients
  */
  socket.on('remove', removed => {
    //console.log(removed);
    liste.splice(removed, 1);
    socket.emit('liste', liste);
    socket.broadcast.emit('liste', liste);
  })

});

server.listen(8080);
