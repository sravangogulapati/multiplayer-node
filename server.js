// const http = require('http').createServer();
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const io = require('socket.io')(server);

allClients = []
player_positions = {}

app.use(express.static(__dirname));

app.get('/', (req,res) => {
    res.sendFile(__dirname + "/public/index.html");
})

// setInterval(() => {
//     // io.sockets.emit('counter', counter);
//     counter++;
// }, 100);

io.on('connection', (socket) => {
    allClients.push(socket.id)
    player_positions[socket.id] = {x: 0, y: 0};
    // console.log(player_positions)
    console.log(`${socket.id.substr(0,3)} is player ${allClients.length}`);

    socket.emit('setup', {self_id: socket.id, positions: player_positions});
    socket.broadcast.emit('player_connect', {id: socket.id, position: player_positions[socket.id]})

    socket.on('move', (data) => {
        // console.log(data)
        player_positions[socket.id] = data
        io.volatile.emit("pos_update", player_positions)
    })
    // socket.on('fromClientEvent', (data) => {
    //     console.log(`From ${socket.id.substr(0,2)}: ` + data);
    //     socket.broadcast.emit('fromServerEvent', data);
    // });
    socket.on('disconnect', () => {
        console.log(`${socket.id.substr(0,3)} disconnected`);
        io.emit('player_disconnect', socket.id)
        const index = allClients.indexOf(socket.id);
        if (index > -1) {
            allClients.splice(index, 1);
        }
        delete player_positions[socket.id]
    })
})


server.listen(8080, () => console.log('listening on http://localhost:8080'));