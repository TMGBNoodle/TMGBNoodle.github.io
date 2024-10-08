
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
        this.moveSpeed = Math.random() * 30
        this.target = {x: 0, y : 0}
        this.wait = 0
        this.waitThresh = Math.random() * 20 + 11
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
        let totalMove = 0
        if(run){
            modifier = 1
        }
        if(Math.abs(difX) > this.moveSpeed)
            this.position.x+=xMove*modifier
            totalMove += Math.abs(xMove)
        if(Math.abs(difY) > this.moveSpeed)
            this.position.y+=yMove*modifier
            totalMove += Math.abs(yMove)
        this.size -= totalMove
    }
    moveToTarget(run){
        this.move(this.target.x, this.target.y, run)
    }
    getSize(){
        return this.size
    }

    moveExhaustion(){
        if(this.size> 10 & this.wait ){
            this.moveToTarget
        }
        else{
            this.wait += 1
            this.size += this.wait
        }
    }
}
const test = [0,1,2,3,4,5,6,7]
console.log(test)
test.splice(4, 1)
console.log(test)
const entities = []
const targetX = 0
const targetY = 0
for (let i = 0; i < entityCount; i++) {
    const posx = Math.random()*canvas.width - 10
    const posy = Math.random()*canvas.height - 10
    const r = Math.random() * 150
    const g = Math.random() * 150
    const b = Math.random() * 150
    entities.push(new creature({x: posx, y: posy}, "circle", {r: r, g: g, b: b}))
  }

for(let i = 0; i <entities.length; i++){
    entities[i].draw()
}
function moveEntities(){
    console.log("moving")
    c.fillStyle = "navy"
    c.fillRect(0,0,canvas.width,canvas.height)
    for(let i = 0; i <entities.length; i++){
        if(entities[i].getSize() < 0){
            entities.splice(i-1, 1)
        }
        else{ 
        entities[i].moveToTarget(false)
        entities[i].draw()
        }
    }
};

function changeTargets() {
    for(let i = 0; i <entities.length; i++){
        const posx = Math.random()*canvas.width - 10
        const posy = Math.random()*canvas.height - 10
        entities[i].setTarget({x:posx,y:posy})
    }
}

timeButton.addEventListener("click", function() {
    moveEntities()
});

setInterval(moveEntities, 50)
setInterval(changeTargets, 5000)