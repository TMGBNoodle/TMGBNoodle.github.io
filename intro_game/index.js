
const canvas = document.querySelector('canvas');
const timeButton = document.getElementById('moveTime');



const c = canvas.getContext("2d");
canvas.height = 512;
canvas.width = 1024;
const entityCount = 50;
const quadrantSize = 50;
class creature {
    constructor(position, type, color) {
        this.position = position
        this.type = type
        this.color = color
        this.size = (Math.random() * 15) + 10
        this.maxSize = this.size
        this.moveSpeed = 25-this.size
        this.target = {x: this.position.x, y : this.position.y}
        this.top = this.position.y - this.size/2
        this.bottom = this.position.y + 1.5 * (this.size)
        this.left = this.position.x - this.size/2
        this.right = this.position.x + 1.5 * (this.size)
        this.lastMoveX = 0
        this.lastMoveY = 0
        // this.wait = 0
        // this.waitThresh = Math.random() * 20 + 11
    }

    getPosition() {
        return this.position
    }
    draw() {
        c.fillStyle = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`; 
        switch (this.type) {
            case "square":
                c.fillRect(this.position.x, this.position.y, this.size/2, this.size/2)
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
                c.arc(this.position.x + this.size/2, this.position.y + this.size/2, this.size, 0, 2 * Math.PI)
                c.fill()
                c.closePath()
        }
    }
    eat() {
        this.size +=1
    }
    setTarget(tPos){
        this.target.x = tPos.x
        this.target.y = tPos.y
    }
    move(x, y, run){
        const difX = this.position.x - x
        const difY = this.position.y - y
        const totalDif = Math.abs(difX) + Math.abs(difY)
        const xPer = difX/totalDif
        const yPer = difY/totalDif
        const xMove = this.moveSpeed * xPer
        const yMove = this.moveSpeed * yPer
        const modifier = -1
        //let totalMove = 0
        if(run){
            modifier = 1
        }
        if(Math.abs(difX) > this.moveSpeed) {
            let toMove = xMove*modifier
            this.position.x+=toMove
            this.lastMoveX = toMove
            // totalMove += Math.abs(xMove)
            this.left = this.position.x - this.size/2
            this.right = this.position.x + 1.5 * (this.size)
        }
        if(Math.abs(difY) > this.moveSpeed) {
            let toMove = yMove*modifier
            this.position.y+= toMove
            this.lastMoveY = toMove
            // totalMove += Math.abs(yMove)
            this.top = this.position.y - this.size/2
            this.bottom = this.position.y + 1.5 * (this.size)
        }
        //this.size -= totalMove
    }
    moveToTarget(run){
        this.move(this.target.x, this.target.y, run)
    }
    getSize(){
        return this.size
    }

    getBounds() {
        return {top : this.top, bottom : this.bottom, left : this.left, right : this.right}
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
    getBottom(){
        return this.bottom
    }
    getLeft(){
        return this.left
    }
    getRight() {
        return this.right
    }
}
function checkQuadrantCollionsFromCreature(creature, quadrants) {
    o1B = creature.getBounds()
    o2R = quadrants.x2
    o2L = quadrants.x1
    o2T = quadrants.y1
    o2B = quadrants.y2
    return !(o2L > o1B.right || o2R < o1B.left || o2T  > o1B.bottom || o2B < o1B.top)
}
const entities = []

const allEntities = []
function initQuadrants(rows, columns) { 
    for (let index = 0; index < columns; index++) {
        for (let ind = 0; ind < rows; ind++) {
            entities.push([{x1:ind * quadrantSize, x2: ind * quadrantSize + quadrantSize-1, y1: index * quadrantSize, y2:index * quadrantSize + quadrantSize-1}, new Array()])
        }
    }
}
const lateralQuadrantCount = Math.floor(canvas.width/quadrantSize)
const verticalQuadrantCount = Math.floor(canvas.height/quadrantSize)
initQuadrants(lateralQuadrantCount, verticalQuadrantCount)
const quadColors = [
    "yellow",
    "green",
    "blue",
    "orange"
]
function drawQuadrants() {
    for (let index = 0; index < entities.length; index++) {
        const element = entities[index];
        const bounds = element[0]
        if(element[1].length > 0) {
            c.fillStyle = quadColors[1]
        } else
            c.fillStyle = quadColors[0]
            
        c.fillRect(bounds.x1, bounds.y1, bounds.x2-bounds.x1, bounds.y2 - bounds.y1)
        c.fillText(`${index}`,bounds.x1+50, bounds.y1+50);
        c.lineWidth = 0.8
        c.beginPath()
        c.moveTo(bounds.x1, bounds.y1)
        c.lineTo(bounds.x2, bounds.y1)
        c.lineTo(bounds.x2, bounds.y2)
        c.lineTo(bounds.x1, bounds.y2)
        c.lineTo(bounds.x1, bounds.y1)
        c.stroke()
        c.closePath()
    }
}
drawQuadrants()
function generateCreatures(entityCount, type) {
    for (let i = 0; i < entityCount; i++) {
        const posx = Math.random()*canvas.width - 10
        const posy = Math.random()*canvas.height - 10
        const r = Math.random() * 150
        const g = Math.random() * 150
        const b = Math.random() * 150
        const newCreature = new creature({x: posx, y: posy}, type, {r: r, g: g, b: b})
        allEntities.push(newCreature)
        let count = 0
        for(let f = 0; f < entities.length; f++){
            count = count +1
            let quadrant = entities[f]
            if(checkQuadrantCollionsFromCreature(newCreature, quadrant[0])){
                count += 1
                quadrant[1].push(newCreature)
            }
        }
    }
    for(let i = 0; i <allEntities.length; i++){
        const element = allEntities[i]
        element.draw()
    }
}

generateCreatures(50, "circle")
function clearQuadrants() {
    for (let index = 0; index < entities.length; index++) {
        const element = entities[index];
        element[1] = []
    }
}
function moveEntities(){
    console.log("moving")
    c.fillStyle = "white"
    c.fillRect(0,0,canvas.width,canvas.height)
    clearQuadrants()
    for(let i = 0; i < allEntities.length; i++){
        const entity = allEntities[i]
        entity.moveToTarget(false)
    }
    for (let i = 0; i < allEntities.length; i++) {
        newCreature = allEntities[i]
        for(let f = 0; f < entities.length; f++){
            let quadrant = entities[f]
            if(checkQuadrantCollionsFromCreature(newCreature, quadrant[0])){
                quadrant[1].push(newCreature)
            }
        }
    }
    drawQuadrants()
    for(let i = 0; i < allEntities.length; i++){
        const entity = allEntities[i]
        entity.draw()
    }
};

function changeTargets() {
    for(let i = 0; i < allEntities.length; i++){
        const entity = allEntities[i]
        const posx = Math.random()*canvas.width - 10
        const posy = Math.random()*canvas.height - 10
        entity.setTarget({x: posx, y:posy})
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
    return !(o2L > o1R || o2R < o1L || o2T  > o1B || o2B < o1T)
}

timeButton.addEventListener("click", function() {
    moveEntities()
});
setInterval(moveEntities, 50)
setInterval(changeTargets, 5000)