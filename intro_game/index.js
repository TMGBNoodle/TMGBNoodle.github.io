
const canvas = document.querySelector('canvas');
const timeButton = document.getElementById('moveTime');



const c = canvas.getContext("2d");
canvas.height = 512;
canvas.width = 1024;
const entityCount = 50;
const quadrantSize = 50;

class collisionGrid {
    constructor(squareSize, width, height, show = false, defaultColor = "yellow", occupiedColor = "green") {
        this.gridCount = 0
        this.squareSize = squareSize
        this.width = width
        this.height = height
        this.lateralQuadrantCount = Math.floor(width / squareSize)
        this.verticalQuadrantCount = Math.floor(height / squareSize)
        this.gridSquares = []
        this.show = show
        this.defaultColor = defaultColor
        this.occupiedColor = occupiedColor
    }
    // x1: ind * quadrantSize, x2: ind * quadrantSize + quadrantSize - 1,
    // y1: index * quadrantSize,
    // y2: index * quadrantSize + quadrantSize - 1,
    initQuadrants() { //uses default values. May create another function that allows for more control over creation
        for (let index = 0; index < this.verticalQuadrantCount; index++) {
            for (let ind = 0; ind < this.lateralQuadrantCount; ind++) {
                this.gridSquares.push(new collisionSquare(this.gridCount, this.squareSize, 
                    {x:ind*this.squareSize, y: index * this.squareSize},
                    this,
                    this.show,
                    this.defaultColor,
                    this.occupiedColor
                 ))
                 this.gridCount += 1
            }
        }
    }

    draw() { // "and" logic here, show for both the quadrant and the grid must be enabled to draw a quadrant
        if(this.show) {
            this.gridSquares.forEach(element => {
                element.draw()
            });
        }
    }
//return !(o2L > o1B.right || o2R < o1B.left || o2T > o1B.bottom || o2B < o1B.top)
    addAgent(agent) {
        const agentBounds = agent.getBounds() //Gets left, right, bottom, and top. Allows for fast checks of whether an object is within a boundary
        for (let i = 0; i < this.gridSquares.length; i++) {
            const quadrant = this.gridSquares[i];
            const quadBounds = quadrant.getBounds()
            // Negated Or statements to exit upon any single one being the case. If quad left > agent right, agent is definitely not in this quadrant. Other cases use same logic
            if(!(quadBounds.left > agentBounds.right || quadBounds.right < agentBounds.left || quadBounds.top > agentBounds.bottom || quadBounds.bottom < agentBounds.top)) {
                this.addRecursion(i, agent)
            }
        }
    }

    addRecursion(rootQuadrantID, agent) {
        const agentBounds = agent.getBounds()
        const quadrant = this.gridSquares[rootQuadrantID]
        quadrant.addAgent(agent)
        agent.addQuadrant(quadrant)
        const quadBounds = quadrant.getBounds()
        let right = false
        let down = false
        if(agentBounds.right > quadBounds.right) {
            this.addRightQuadrants(rootQuadrantID + 1, agent)
            right = true
        }
        if(agentBounds.bottom > quadBounds.bottom) {
            this.addLowerQuadrants(rootQuadrantID + 20, agent) 
            down = true
        }
        if(down && right) {
            const nextId = rootQuadrantID + 21
            this.addRecursion(nextId, agent)
        }
    }

    addLowerQuadrants(quadrantID, agent) {
        const lowerId = quadrantID + 20
        const lowerQuadrant = this.gridSquares[lowerId]
        lowerQuadrant.addAgent(agent)
        agent.addQuadrant(lowerQuadrant)
        if(agent.getBounds().bottom > lowerQuadrant.getBounds().bottom) {
            this.addlowerQuadrants(lowerId + 20, agent)
        }
    }

    addRightQuadrants(quadrantID, agent) {
        const rightId = quadrantID + 1
        const rightQuadrant = this.gridSquares[rightId]
        rightQuadrant.addAgent(agent)
        agent.addQuadrant(rightQuadrant)
        if(agent.getBounds().right > rightQuadrant.getBounds().right) {
            this.addRightQuadrants(rightId, agent)
        }
    }
}
// function checkQuadrantCollionsFromCreature(creature, quadrants) { Old collision check, used as reference for addAgent function
//     o1B = creature.getBounds()
//     o2R = quadrants.x2
//     o2L = quadrants.x1
//     o2T = quadrants.y1
//     o2B = quadrants.y2
//     return !(o2L > o1B.right || o2R < o1B.left || o2T > o1B.bottom || o2B < o1B.top)
// }
class collisionSquare {
    constructor(id, size, position, grid, show = false, defaultColor = "yellow", occupiedColor = "blue") {
        this.id = id
        this.size = size
        this.position = position
        this.bounds = {top : this.position.y, bottom : this.position.y + this.size, left: this.position.x, right : this.position.x + this.size}
        this.show = show
        this.defaultColor = defaultColor
        this.occupiedColor = occupiedColor
        this.agents = []
        this.grid = grid
    }

    addAgent(agent) {
        this.agents.push(agent)
    }

    getBounds() {
        return this.bounds
    }

    draw() {
        if(this.show) {
            if(this.agents.length > 0) {
                c.fillStyle = this.occupiedColor
            } else {
                c.fillStyle =  this.defaultColor
            }
            c.fillRect(this.position.x, this.position.y, this.size, this.size)
            c.fillStyle = "black"
            c.fillText(`${this.id}`, this.position.x + this.size/2, this.position.y + this.size/2);
        }
        c.lineWidth = 0.8

        c.beginPath()
        c.moveTo(this.bounds.left, this.bounds.top)
        c.lineTo(this.bounds.right, this.bounds.top)
        c.lineTo(this.bounds.right, this.bounds.bottom)
        c.lineTo(this.bounds.left, this.bounds.bottom)
        c.lineTo(this.bounds.left, this.bounds.top)
        c.stroke()
        c.closePath()
    }
}


class creature {
    constructor(position, type, color) {
        this.position = position
        this.type = type
        this.color = color
        this.size = (Math.random() * 15) + 10
        this.maxSize = this.size
        this.moveSpeed = 25 - this.size
        this.target = { x: this.position.x, y: this.position.y }
        this.top = this.position.y - this.size / 2
        this.bottom = this.position.y + 1.5 * (this.size)
        this.left = this.position.x - this.size / 2
        this.right = this.position.x + 1.5 * (this.size)
        this.lastMoveX = 0
        this.lastMoveY = 0
        this.quadrants = []
    }

    addQuadrant(newQuadrant) {
        this.quadrants.push(newQuadrant)
    }

    getQuadrants() {
        return this.quadrants
    }
    getPosition() {
        return this.position
    }
    draw() {
        c.fillStyle = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`;
        switch (this.type) {
            case "square":
                c.fillRect(this.position.x, this.position.y, this.size / 2, this.size / 2)
                c.lineWidth = 0.8
                c.beginPath()
                c.moveTo(this.position.x + this.size, this.position.y + this.size)
                c.lineTo(this.target.x, this.target.y)
                c.stroke()
                c.closePath()
            case "circle":
                c.lineWidth = 0.8
                c.beginPath()
                c.moveTo(this.left, this.top)
                c.lineTo(this.right, this.top)
                c.lineTo(this.right, this.bottom)
                c.lineTo(this.left, this.bottom)
                c.lineTo(this.left, this.top)
                c.stroke()
                c.closePath()
                c.beginPath()
                c.arc(this.position.x + this.size / 2, this.position.y + this.size / 2, this.size, 0, 2 * Math.PI)
                c.fill()
                c.closePath()
        }
    }
    eat() {
        this.size += 1
    }
    setTarget(tPos) {
        this.target.x = tPos.x
        this.target.y = tPos.y
    }
    move(x, y, run) {
        const difX = this.position.x - x
        const difY = this.position.y - y
        const totalDif = Math.abs(difX) + Math.abs(difY)
        const xPer = difX / totalDif
        const yPer = difY / totalDif
        const xMove = this.moveSpeed * xPer
        const yMove = this.moveSpeed * yPer
        const modifier = -1
        //let totalMove = 0
        if (run) {
            modifier = 1
        }
        if (Math.abs(difX) > this.moveSpeed) {
            let toMove = xMove * modifier
            this.position.x += toMove
            this.lastMoveX = toMove
            // totalMove += Math.abs(xMove)
            this.left = this.position.x - this.size / 2
            this.right = this.position.x + 1.5 * (this.size)
        }
        if (Math.abs(difY) > this.moveSpeed) {
            let toMove = yMove * modifier
            this.position.y += toMove
            this.lastMoveY = toMove
            // totalMove += Math.abs(yMove)
            this.top = this.position.y - this.size / 2
            this.bottom = this.position.y + 1.5 * (this.size)
        }
        //this.size -= totalMove
    }

    moveWithCollisions(worldQuadrants, run) {
        const difX = this.position.x - x
        const difY = this.position.y - y
        const QuadrantChecks = {}
        for (let index = 0; index < this.quadrants.length; index++) {
            const element = this.quadrants[index];
            QuadrantChecks[element[0].id] = element
        }
        const totalDif = Math.abs(difX) + Math.abs(difY)
        const xPer = difX / totalDif
        const yPer = difY / totalDif
        const xMove = this.moveSpeed * xPer
        const yMove = this.moveSpeed * yPer
        const modifier = -1
        //let totalMove = 0
        if (run) {
            modifier = 1
        }
        if (Math.abs(difX) > this.moveSpeed) {
            let toMove = xMove * modifier
            this.position.x += toMove
            this.lastMoveX = toMove
            // totalMove += Math.abs(xMove)
            this.left = this.position.x - this.size / 2
            this.right = this.position.x + 1.5 * (this.size)
        }
        if (Math.abs(difY) > this.moveSpeed) {
            let toMove = yMove * modifier
            this.position.y += toMove
            this.lastMoveY = toMove
            // totalMove += Math.abs(yMove)
            this.top = this.position.y - this.size / 2
            this.bottom = this.position.y + 1.5 * (this.size)
        }
    }
    moveToTarget(run) {
        this.move(this.target.x, this.target.y, run)
    }
    getSize() {
        return this.size
    }

    getBounds() {
        return { top: this.top, bottom: this.bottom, left: this.left, right: this.right }
    }

    // moveExhaustion(){
    //     if(this.size> 10 & this.wait ){
    //         this.moveToTarget
    //     }
    //     else{
    //         this.wait += 1
    //         this.size += this.wait
    //     }
    // }
    getTop() {
        return this.top
    }
    getBottom() {
        return this.bottom
    }
    getLeft() {
        return this.left
    }
    getRight() {
        return this.right
    }
}


// function checkQuadrantCollionsFromCreature(creature, quadrants) {
//     o1B = creature.getBounds()
//     o2R = quadrants.x2
//     o2L = quadrants.x1
//     o2T = quadrants.y1
//     o2B = quadrants.y2
//     return !(o2L > o1B.right || o2R < o1B.left || o2T > o1B.bottom || o2B < o1B.top)
// }

const grid = new collisionGrid(50, canvas.width, canvas.height, true)
grid.initQuadrants()
grid.draw()

const allEntities = []

//  
function generateCreatures(entityCount, type) {
    for (let i = 0; i < entityCount; i++) {
        const posx = Math.random() * (canvas.width - 90)
        const posy = Math.random() * (canvas.height - 90)
        const r = Math.random() * 150
        const g = Math.random() * 150
        const b = Math.random() * 150
        const newCreature = new creature({ x: posx, y: posy }, type, { r: r, g: g, b: b })
        allEntities.push(newCreature)
        grid.addAgent(newCreature)
    }
    for (let i = 0; i < allEntities.length; i++) {
        const element = allEntities[i]
        element.draw()
    }
}

generateCreatures(50, "circle")
grid.draw()
for (let i = 0; i < allEntities.length; i++) {
    const entity = allEntities[i]
    entity.draw()
}
// function clearQuadrants() {
//     for (let index = 0; index < entities.length; index++) {
//         const element = entities[index];
//         element[1] = []
//     }
// }

function moveEntities() {
    console.log("moving")
    c.fillStyle = "white"
    c.fillRect(0, 0, canvas.width, canvas.height)
    clearQuadrants()
    for (let i = 0; i < allEntities.length; i++) {
        const entity = allEntities[i]
        entity.moveToTarget(false)
    }
    for (let i = 0; i < allEntities.length; i++) {
        newCreature = allEntities[i]
        for (let f = 0; f < entities.length; f++) {
            let quadrant = entities[f]
            if (checkQuadrantCollionsFromCreature(newCreature, quadrant[0])) {
                quadrant[1].push(newCreature)
            }
        }
    }
    for (let i = 0; i < allEntities.length; i++) {
        const entity = allEntities[i]
        entity.draw()
    }
};

function changeTargets() {
    for (let i = 0; i < allEntities.length; i++) {
        const entity = allEntities[i]
        const posx = Math.random() * canvas.width - 10
        const posy = Math.random() * canvas.height - 10
        entity.setTarget({ x: posx, y: posy })
        entity.draw()
    }
}

function checkCollisionCreature(o1, o2) {
    o1R = o1.getRight()
    o1L = o1.getLeft()
    o1T = o1.getTop()
    o1B = o1.getBottom()
    o2R = o2.getRight()
    o2L = o2.getLeft()
    o2T = o2.getTop()
    o2B = o2.getBottom()
    return !(o2L > o1R || o2R < o1L || o2T > o1B || o2B < o1T)
}

// timeButton.addEventListener("click", function () {
//     moveEntities()
// });
// setInterval(moveEntities, 50)
// setInterval(changeTargets, 5000)