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
        this.connected = []
        this.color = "black"
        this.visited = false;
        this.depth = 0
    }
    setVisited() {
        this.visited = true
        this.color = "green"
    }

    setDepth(n) {
        this.depth = n
    }

    getDepth() {
        return this.depth
    }
    getVisited() {
        return this.visited
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

vertex.prototype.toString = function vertToString() {
    return `${this.binVal}`
}
function compareBins(bin, obin) {
    if(obin.length > bin.length) {
        bin = bin.padStart(obin.length, "0")
    } else {
        obin = obin.padStart(bin.length, "0")
    }
    let fChar1 = bin[0]
    let fChar2 = obin[0]
    if(fChar1 !== fChar2) {
        let text1 = bin.substring(1, bin.length)
        let text2 = obin.substring(1, obin.length)
        if(text1 === text2){
            return true
        } else
        {
            return false
        }
    } else {
        return false
    }
    
}
function generatePowerOf2Graph(n) {
    const vertexCount = Math.pow(2, n)
    const vertices = new Array()
    let colNum = 0
    let maxCol = Math.pow(2, colNum)
    let colCount = 0
    for(i = 0; i < vertexCount; i++) {
        let bin = i.toString(2)
        colCount += 1
        if(colCount >= maxCol) {
            colCount = 0
            colNum += 1
            maxCol = colNum^2
        }
        //let posy = colCount * 25 + 50
        //let posx = colNum * 25 + 10
        let posy = Math.random() * 500 + 50
        let posx = Math.random() * 1000 + 10
        const vert = new vertex({x: posx, y: posy}, i, bin)
        for(h = 0; h < vertices.length; h++) {
            const oVert = vertices[h]
            if(compareBins(vert.getBin(), oVert.getBin())) {
                vert.addConnection(oVert)
                oVert.addConnection(vert)
            }
        }
        vertices.push(vert)
    }
    for(g = 0; g < vertices.length; g++) {
        let avert = vertices[g]
        avert.draw()
    }
    return vertices
}

function BFS(v, graph){
    let depth = 0
    let depthArrays = {}
    let VCount = {}
    let Q = []
    Q.push(v)
    depthArrays[0] = [v]
    while(Q.length > 0){
        vert = Q.shift()
        newDepth = vert.getDepth() + 1
        connected = vert.getConnected()
        connected.forEach(element => {
            if(element.getVisited() == false){

                if(depthArrays[newDepth] == null)
                {
                    depthArrays[newDepth] = [element]
                } else {
                    depthArrays[newDepth].push(element)
                }
                Q.push(element)
                element.setVisited()
                element.setDepth(newDepth)
            }
        });
    }
    return depthArrays
}


graph = generatePowerOf2Graph(10)

layerStuff = BFS(graph[0], graph)
console.log(layerStuff[6])