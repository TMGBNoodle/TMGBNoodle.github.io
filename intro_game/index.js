
const canvas = document.querySelector('canvas');
const timeButton = document.getElementById('moveTime');



const c = canvas.getContext("2d");
canvas.height = 512;
canvas.width = 1024;
const entityCount = 100;
class creature {
    constructor(position, type, color) {
        this.position = position
        this.type = type
        this.color = color
        this.size = (Math.random() * 15) + 10
        this.maxSize = this.size
        this.moveSpeed = 25-this.size
        this.target = {x: this.position.x, y : this.position.y}
        this.top = this.position.y - this.size
        this.bottom = this.position.y + this.size
        this.left = this.position.x - this.size
        this.right = this.position.x + this.size
        this.wait = 0
        this.waitThresh = Math.random() * 20 + 11
    }

    getPosition() {
        return this.position
    }
    draw() {
        c.fillStyle = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`; 
        switch (this.type) {
            case "square":
                c.fillRect(this.position.x, this.position.y, this.size, this.size)
            case "circle":
                c.beginPath()
                c.arc(this.position.x + 50, this.position.y + 50, this.size, 0, 2 * Math.PI)
                c.fill()
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
        if(Math.abs(difX) > this.moveSpeed)
            this.position.x+=xMove*modifier
            // totalMove += Math.abs(xMove)
            this.left = this.position.x - this.size
            this.right = this.position.x + this.size
        if(Math.abs(difY) > this.moveSpeed)
            this.position.y+=yMove*modifier
            // totalMove += Math.abs(yMove)
            this.top = this.position.y - this.size
            this.bottom = this.position.y + this.size
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
    o1Bounds = creature.getBounds()
    o2R = quadrants.x2
    o2L = quadrants.x1
    o2T = quadrants.y1
    o2B = quadrants.y2
    return !(o2L > o1Bounds.right || o2R < o1Bounds.left || o2T  > o1Bounds.bottom || o2B < o1Bounds.top)
}
const entities = []
function initQuadrants(rows, columns) { 
    for (let index = 0; index < columns; index++) {
        for (let ind = 0; ind < rows; ind++) {
            entities.push([{x1:ind * 100, x2: ind * 100 + 99, y1: index * 100, y2:index * 100 + 99}, new Array()])
        }
    }
}
initQuadrants(Math.floor(canvas.width/100), Math.floor(canvas.height/100))
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
        c.fillStyle = quadColors[index]
        c.fillRect(bounds.x1, bounds.y1, bounds.x2-bounds.x1, bounds.y2 - bounds.y1)
    }
}
drawQuadrants()
console.log(entities.length)
function generateCreatures(entityCount, type) {
    for (let i = 0; i < entityCount; i++) {
        const posx = Math.random()*canvas.width - 10
        const posy = Math.random()*canvas.height - 10
        const r = Math.random() * 150
        const g = Math.random() * 150
        const b = Math.random() * 150
        const newCreature = new creature({x: posx, y: posy}, type, {r: r, g: g, b: b})
        let count = 0
        for(let f = 0; f < entities.length; f++){
            count = count +1
            let quadrant = entities[f]
            newCreature.draw()
            if(checkQuadrantCollionsFromCreature(newCreature, quadrant[0])){
                count += 1
                quadrant[1].push(newCreature)
                if(count >= 4){
                    break
                }
            }
        }
    }
    for(let i = 0; i <entities.length; i++){
        creatures = entities[i][1]
        for (let f = 0; f < creatures.length; f++) {
            const element = creatures[f]
            element.draw()
        }
    }
}
generateCreatures(100, "square")
function moveEntities(){
    console.log("moving")
    c.fillStyle = "navy"
    c.fillRect(0,0,canvas.width,canvas.height)
    for(let i = 0; i <entities.length; i++){
        entities[i].moveToTarget(false)
        entities[i].draw()
    }
};

function changeTargets() {
    for(let i = 0; i <entities.length; i++){
        const posx = Math.random()*canvas.width - 10
        const posy = Math.random()*canvas.height - 10
        entities[i].setTarget({x:posx,y:posy})
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