const socket = io('ws://localhost:8080');
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

pressed_keys = {'w': false, 'a': false, 's': false, 'd': false}

class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.speed = 3
    }

    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 
                0, 2* Math.PI, false)
        ctx.fillStyle = this.color
        ctx.fill()
    }

    update() {
        if (pressed_keys['w']) {
            this.y -= this.speed
        }
        if (pressed_keys['a']) {
            this.x -= this.speed
        }
        if (pressed_keys['s']) {
            this.y += this.speed
        }
        if (pressed_keys['d']) {
            this.x += this.speed
        }
        if (pressed_keys['w'] || pressed_keys['a'] || pressed_keys['s'] || pressed_keys['d']) {
            socket.emit("move", {x: player.x, y: player.y})
        }
    }
}

class OtherPlayer {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 
                0, 2* Math.PI, false)
        ctx.fillStyle = this.color
        ctx.fill()
    }

    update() {

    }
}

const player_x = canvas.width / 2
const player_y = canvas.height / 2

const player = new Player(player_x, player_y, 30, 'blue')

all_players = {}

function animate() {
    requestAnimationFrame(animate)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    Object.keys(all_players).forEach((p_id) => {
        all_players[p_id].update()
        all_players[p_id].draw();
    })
    // console.log(pressed_keys['w'])
}

window.addEventListener('keydown', (event) => {
    if (!pressed_keys['w'] && event.key == 'w') {
        pressed_keys['w'] = true
    }
    if (!pressed_keys['a'] && event.key == 'a') {
        pressed_keys['a'] = true
    }
    if (!pressed_keys['s'] && event.key == 's') {
        pressed_keys['s'] = true
    }
    if (!pressed_keys['d'] && event.key == 'd') {
        pressed_keys['d'] = true
    }
})

window.addEventListener('keyup', (event) => {
    if (event.key == 'w') {
        pressed_keys['w'] = false
    }
    if (event.key == 'a') {
        pressed_keys['a'] = false
    }
    if (event.key == 's') {
        pressed_keys['s'] = false
    }
    if (event.key == 'd') {
        pressed_keys['d'] = false
    }
})

animate()

socket.on('counter', data => {
    // console.log("From server: " + data);
})

self_id = null

socket.on('setup', (data) => {
    // console.log(data)
    // console.log(Object.keys(data));
    self_id = data.self_id
    all_players[self_id] = player
    Object.keys(data.positions).forEach((player_id) => {
        // console.log(player_id)
        if (player_id != self_id) {
            const p = new OtherPlayer(data.positions[player_id].x, data.positions[player_id].y, 30, 'red')
            // p.draw()
            all_players[player_id] = p;
            // console.log(all_players);
        }
    })
})

socket.on('player_connect', (data) => {
    const p = new OtherPlayer(data.position.x, data.position.y, 30, 'red')
    // p.draw()
    all_players[data.id] = p;
})

socket.on('player_disconnect', (p_id) => {
    // console.log(p_id)
    delete all_players[p_id]
})

socket.on('pos_update', (data) => {
    // console.log("self id: " + self_id)
    Object.keys(data).forEach((player_id) => {
        if (player_id != self_id) {
            // console.log(player_id)
            // console.log(all_players)
            all_players[player_id].x = data[player_id].x;
            all_players[player_id].y = data[player_id].y;
            // console.log(all_players);
        }
    })
})