const canvas = document.querySelector('canvas');
const timeButton = document.getElementById('moveTime');

canvas.width = 1600
canvas.height = 5000
const c = canvas.getContext("2d")

class vertex {
    constructor(position, ind, binVal) {
        this.ind = ind
        this.binVal = binVal
        this.position = position
        this.connected = new Array();
        this.color = "black"
    }
    setVisited() {
        this.color = "green"
    }
    addConnection(other) {
        this.connected.push(other)
    }

    getConnected() {
        return this.connected
    }

    getPos() {
        return this.position
    }

    draw() {
        c.fillStyle = this.color
        c.beginPath()
        c.arc(this.position.x, this.position.y, 5, 0, 2 * Math.PI)
        c.fill()
        console.log(`${this.binVal} is connected to ${this.connected}`)
        for(i = 0; i < this.connected.length; i++) {
            let vert = this.connected[i]
            let oPos = vert.getPos()
            c.lineWidth = 0.5
            c.beginPath()
            c.moveTo(this.position.x, this.position.y)
            c.lineTo(oPos.x, oPos.y)
            c.stroke()
        }
    }

    getBin() {
        return this.binVal
    }

    clearCon() {
        this.connected = new Array()
    }
}

class graph {
    constructor(V, E) {
        this.vertices = []
        this.edges = []

        for (let index = 0; index < V; index++) {
            this.vertices.push(new vertex());
        
        }
    }
}