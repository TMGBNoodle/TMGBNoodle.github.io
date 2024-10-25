
const canvas = document.querySelector('canvas');
const timeButton = document.getElementById('moveTime');



const c = canvas.getContext("2d");
canvas.height = 512;
canvas.width = 1024;
const entityCount = 50;
const quadrantSize = 50;

const entitySizeVariation = 15;
const entitySizeBase = 25;

const directions = {
    "top" : -1,
    "bottom" : 1,
    "left" : -1,
    "right" : 1,
}

const dirX = {
    0 : "left",
    2 : "right"
}

const dirY = {
    0 : "top",
    2 : "bottom"
}


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
            if(!(quadBounds["left"] > agentBounds["right"] || quadBounds["right"] < agentBounds["left"] || quadBounds.top > agentBounds.bottom || quadBounds.bottom < agentBounds.top)) {
                // console.log(`Agent Id: ${agent.getId()}, Quad Id: ${quadrant.getId()}`)
                this.addRecursion(i, agent)
                agent.flagCorners()
                break
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
        if(agentBounds["right"] > quadBounds["right"]) {
            // console.log(`Agent Id: ${agent.getId()}, Quad Id: ${rootQuadrantID + 1}, agent right at ${agent.getBounds().right}, quadrant right at ${quadrant.getBounds().right}`)
            this.addRightQuadrants(rootQuadrantID + 1, agent)
            right = true
        }
        if(agentBounds.bottom > quadBounds.bottom) {
            // console.log(`Agent Id: ${agent.getId()}, Quad Id: ${rootQuadrantID + 20}, agent bottom at ${agent.getBounds().bottom}, quadrant bottom at ${quadrant.getBounds().bottom}`)
            this.addLowerQuadrants(rootQuadrantID + this.lateralQuadrantCount, agent) 
            down = true
        }
        if(down && right) {
            const nextId = rootQuadrantID + this.lateralQuadrantCount+1
            if(nextId < this.gridCount - 1){
                 this.addRecursion(nextId, agent)
            }
        }
    }

    addLowerQuadrants(quadrantID, agent) {
        if(quadrantID <= this.gridCount-1) {
            const lowerQuadrant = this.gridSquares[quadrantID]
            lowerQuadrant.addAgent(agent)
            agent.addQuadrant(lowerQuadrant)
            if(agent.getBounds().bottom > lowerQuadrant.getBounds().bottom) {
                // console.log(`Agent Id: ${agent.getId()}, Quad Id: ${quadrantID}, agent bottom at ${agent.getBounds().bottom}, quadrant bottom at ${lowerQuadrant.getBounds().bottom}`)
                this.addLowerQuadrants(quadrantID + this.lateralQuadrantCount, agent)
            }
        }
    }

    addRightQuadrants(quadrantID, agent) {
        if(quadrantID <= this.gridCount-1) {
            const rightQuadrant = this.gridSquares[quadrantID]
            rightQuadrant.addAgent(agent)
            agent.addQuadrant(rightQuadrant)
            if(agent.getBounds().right > rightQuadrant.getBounds().right) {
                // console.log(`Agent Id: ${agent.getId()}, Quad Id: ${quadrantID}, agent right at ${agent.getBounds().right}, quadrant right at ${rightQuadrant.getBounds().right}`)
                this.addRightQuadrants(quadrantID + 1, agent)
            }
        }
    }
}
// function checkQuadrantCollionsFromCreature(creature, quadrants) { Old collision check, used as reference for addAgent function
//     o1B = creature.getBounds()
//     o2R = quadrants.x2
//     o2L = quadrants.x1
//     o2T = quadrants.y1
//     o2B = quadrants.y2
//     return !(o2L > o1B.right || o2R < o1B["left"] || o2T > o1B.bottom || o2B < o1B.top)
// }
class collisionSquare {
    constructor(id, size, position, grid, show = false, defaultColor = "yellow", occupiedColor = "blue") {
        this.id = id
        this.size = size
        this.position = position
        this.bounds = {"top" : this.position.y, "bottom" : this.position.y + this.size, "left": this.position.x, "right" : this.position.x + this.size}
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

    getId() {
        return this.id
    }

    setCorner(newColor) {
        this.occupiedColor = newColor
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
        c.moveTo(this.bounds["left"], this.bounds.top)
        c.lineTo(this.bounds["right"], this.bounds.top)
        c.lineTo(this.bounds["right"], this.bounds.bottom)
        c.lineTo(this.bounds["left"], this.bounds.bottom)
        c.lineTo(this.bounds["left"], this.bounds.top)
        c.stroke()
        c.closePath()
    }
}


class creature {
    constructor(position, type, color, id) {
        this.id = id
        this.position = position
        this.type = type
        this.color = color
        this.size = (Math.random() * entitySizeVariation) + entitySizeBase
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
        // this.rightQuadrants = [] //I want to keep track of the edge quadrants so that I can easily check quadrants
        // this.leftQuadrants = [] // in a direction when an object moves. I could use a set of quadrants with some conditionals
        // this.topQuadrants = [] // to construct lists of edges. This requires a fair amount of maintenance, but it may also allow
        // this.bottomQuadrants = [] // for easy changing of quadrant occupation.
        this.corners = {"top_left": null, "top_right": null, "bottom_left": null, "bottom_right": null}
    }

    addQuadrant(newQuadrant) {
        // console.log(`Quadrant : ${newQuadrant.getId()}, Agent: ${this.id}`)
        for (const key in this.corners) {
            if (Object.prototype.hasOwnProperty.call(this.corners, key)) {
                const element = this.corners[key];
                if(element == null) {
                    this.corners[key] = newQuadrant
                    newQuadrant.setCorner("blue")
                } else {
                    let names = key.split("_")
                    let xName = names[1]
                    let yName = names[0]
                    let currBounds = element.getBounds()
                    let newBounds = newQuadrant.getBounds()
                    if(Math.sign(newBounds[yName] - currBounds[yName]) == directions[yName]) {
                        this.corners[key] = newQuadrant
                    }
                    if(Math.sign(newBounds[xName] - currBounds[xName]) == directions[xName]) {
                        this.corners[key] = newQuadrant
                    }
                }
            }
        }
        this.quadrants.push(newQuadrant)
    }

    flagCorners() {
        for (const key in this.corners) {
            if (Object.prototype.hasOwnProperty.call(this.corners, key)) {
                let element = this.corners[key]
                element.setCorner("blue")
            }
        }
    }

    getId() {
        return this.id
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
                c.moveTo(this["left"], this.top)
                c.lineTo(this.right, this.top)
                c.lineTo(this.right, this.bottom)
                c.lineTo(this["left"], this.bottom)
                c.lineTo(this["left"], this.top)
                c.stroke()
                c.closePath()
                c.beginPath()
                c.arc(this.position.x + this.size / 2, this.position.y + this.size / 2, this.size, 0, 2 * Math.PI)
                c.fill()
                c.closePath()
                c.fillStyle = "black"
                c.fillText(`${this.id}`, this.position.x + this.size/2, this.position.y + this.size/2);
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

    moveWithCollisions(run) {
        const difX = this.target.x -this.position.x
        const difY = this.target.y -this.position.y
        const quadrantsToCheck = []
        quadrantsToCheck.concat(this.quadrants)
        const cornerKey = dirY[(Math.sign(difY) + 1)] + dirX[(Math.sign(difX) + 1)]
        const corner = this.corners[cornerKey]
        const totalDif = Math.abs(difX) + Math.abs(difY)
        const xPer = difX / totalDif
        const yPer = difY / totalDif
        const xMove = this.moveSpeed * xPer
        const yMove = this.moveSpeed * yPer
        const nextQuadrants = corner.getOtherQuadrants(corner, cornerKey, this.moveSpeed)
        quadrantsToCheck.concat(nextQuadrants)
        const modifier = 1
        //let totalMove = 0
        if (run) {
            modifier = -1
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
        return { "top": this.top, "bottom": this.bottom, "left": this.left, "right": this.right }
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

const grid = new collisionGrid(30, canvas.width, canvas.height, true)
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
        const newCreature = new creature({ x: posx, y: posy }, type, { r: r, g: g, b: b }, i)
        allEntities.push(newCreature)
        grid.addAgent(newCreature)
    }
    for (let i = 0; i < allEntities.length; i++) {
        const element = allEntities[i]
        element.draw()
    }
}

generateCreatures(10, "circle")
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
    // console.log("moving")
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