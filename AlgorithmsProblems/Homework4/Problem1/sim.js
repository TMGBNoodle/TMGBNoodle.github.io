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
        c.fillStyle = "black"
        c.beginPath()
        c.arc(this.position.x, this.position.y, 5, 0, 2 * Math.PI)
        c.fill()
        console.log(`${this.binVal} is connected to ${this.connected}`)
        for(i = 0; i < this.connected.length; i++) {
            let vert = this.connected[i]
            let oPos = vert.getPos()
            c.lineWidth = 0.1
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
    let lenDif = Math.abs(obin.length - bin.length)
    if(lenDif == 0){
        let fChar1 = Array.from(bin)[0];
        let fChar2 = Array.from(obin)[0];
        if(fChar1 != fChar2) {
            const text1 = bin.substring(1, bin.length)
            const text2 = obin.substring(1, obin.length)
            if(text1.localeCompare(text2) == 1){
                console.log(`Easy Connection found with bin values ${bin} and ${obin}`)
                return true
            } else 
            {
                return false
            }
        } else {
            return false
        }
    } else if(lenDif <= 1) {
        if(obin.length > bin.length) {
            bin = "0" + bin
        } else {
            obin = "0" + obin
        }
        let fChar1 = bin[0]
        let fChar2 = obin[0]
        if(fChar1 !== fChar2) {
            let text1 = bin.substring(1, bin.length)
            let text2 = obin.substring(1, obin.length)
            if(text1 === text2){
                console.log(`Connection found with bin values ${text1} and ${text2}`)
                console.log(text1.localeCompare(text2) == 1)
                return true
            } else
            {
                return false
            }
        } else {
            return false
        }
    }
    else{
        return false
    }
}
function generateGraph(n) {
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
            console.log(`Max vertices in a column, ${maxCol} current column numbers ${colNum}`)
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
}
console.log(compareBins("1111111111", "100000000"))
generateGraph(10)