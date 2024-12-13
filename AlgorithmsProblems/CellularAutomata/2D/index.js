//Thinking through the problem.
//Intitialize the graph. Progressively open nodes until there is a percolating graph. Relatively simple, just keep unioning opened
//nodes until a bottom node is connected to a top node. Can simplify slightly by only checking opened bottom and top nodes. 
//My implimentation for Union find initializes every single node as an unconnected alone one. When a node is opened, check for
//adjacent opened nodes, and if there is one union them. 
//I can then check if any of the opened bottom or top nodes are connected. Keep a list of opened bottom or top nodes.
//More efficient solution? I know a bottom node is connected to a top node if I call connected on both nodes. Both nodes must be open.
//The issue with my current union-find is that with find, nodes are no longer connected in union-find in the same way they are 
//connected on the percolation graph. Can I manage another set of the same nodes to allow myself to run a pathfinding algorithm on the final graph?
//Changing find would slow down recognition of a percolating graph. Worst case BFS takes V+E time. 50 by 50 means 2500 vertices,
//The maximum number of edges for a general graph is 2500^2 vertices which is a lot. With a percolating graph, each vertex can have
//at most 4 edges. Without considering that the edges will have fewer edges, that means there will be 10000 edges worst case. 
//With 10^8 as a good guidance, BFS on a graph solely constructed from basic edge connections is reasonable.
//I can probably optimize adding to the graph though. I only need to add to the graph when vertices are connected to the top
//or bottom. However, vertices can be newly connected to the top and bottom and they could be part of a union find where it is
//difficult to get all the vertices in that set. 

//Oh. I can just. Make a vertex class. That stores all the connected stuff. I am silly.

// Using a 'ghost node' allows me to speed up pathfinding and checking a lot.
const canvas = document.querySelector('canvas');

const widthInput = document.getElementById('widthbox')
const heightInput = document.getElementById('heightbox')
const inputButton = document.getElementById('submit')

inputButton.addEventListener("click", function() {
    c.fillStyle = "white"
    c.fillRect(0,0,canvas.width,canvas.height)
    gridWidth = parseInt(widthInput.value)
    gridHeight = parseInt(heightInput.value)
    squareSize = Math.min(canvas.width / gridWidth, squareSize)
    main()
});

const c = canvas.getContext("2d");
canvas.height = 2048;
canvas.width = 2048;

const colors = {
    "open" : "green",
    "closed" : "red",
    "path" : "blue"
}




class cellgrid {
    constructor(squareSize, width, height, show = false, defaultColor = "yellow", occupiedColor = "green") {
        this.gridCount = 0
        this.squareSize = squareSize
        this.width = width
        this.height = height
        this.lateralQuadrantCount = Math.floor(width / squareSize)
        this.verticalQuadrantCount = Math.floor(height / squareSize)
        this.gridSquares = []
        this.changed = []
        this.show = show
        this.defaultColor = defaultColor
        this.occupiedColor = occupiedColor
    }

    initCells() {
        for (let index = 0; index < this.verticalQuadrantCount; index++) {
            for (let ind = 0; ind < this.lateralQuadrantCount; ind++) {
                let newCell = new cell(this.gridCount, this.squareSize, 
                    {x:ind*this.squareSize, y: index * this.squareSize},
                    this,
                    this.show,
                    this.defaultColor,
                    this.occupiedColor
                 )
                this.gridSquares.push(newCell)
                 this.gridCount += 1
            }
        }
        for (let index = 0; index< this.gridSquares.length; index++) {
            let topLeft = index-1 - this.lateralQuadrantCount
            let top = index - this.lateralQuadrantCount
            let topRight = 
            this.gridSquares[index].addNeighbor(this.gridSquares[topLeft])
            this.gridSquares[index].addNeighbor(this.gridSquares[top])
            this.gridSquares[index].addNeighbor(this.gridSquares[index + 1 - this.lateralQuadrantCount])
            this.gridSquares[index].addNeighbor(this.gridSquares[index-1])
            this.gridSquares[index].addNeighbor(this.gridSquares[index-1 - this.lateralQuadrantCount])
            this.gridSquares[index].addNeighbor(this.gridSquares[index-1 - this.lateralQuadrantCount])
            this.gridSquares[index].addNeighbor(this.gridSquares[index-1 - this.lateralQuadrantCount])
            this.gridSquares[index].addNeighbor(this.gridSquares[index-1 - this.lateralQuadrantCount])
        }
    }

    addChanged(changedCell) {
        this.changed.push(changedCell)
    }

    draw() { // "and" logic here, show for both the quadrant and the grid must be enabled to draw a quadrant
        if(this.show) {
            this.changed.forEach(element => {
                element.draw()
            });
        }
    }
}

class cell {
    constructor(id, size, position, grid, show = false, defaultColor = "white", aliveColor = "black") {
        this.state = 0
        this.id = id
        this.neighbors = []  //will have 8 neighbors. Don't need to know anything about their 
                                    // positions, only needs to know about their cumulative states. 
        this.aliveAdj = 0
        this.outerRing = [] //May impliment recognizing states of cells beyond the neighbors.
        this.size = size
        this.position = position
        this.deadColor = defaultColor
        this.aliveColor = aliveColor
        this.grid = grid
    }

    getId() {
        return this.id
    }
    
    addNeighbor(neighbor) { 
        this.neighbors.push(neighbor)
    }

    neighborRevived() {
        this.aliveAdj += 1
    }

    neighborKilled() {
        this.aliveAdj -= 1
    }

    setAlive() {
        if(this.state = 0) {
            this.grid.addChanged(this)
            this.state = 1
            this.neighbors.forEach(element => {
                element.neighborRevived()
            });
        }
    }

    setDead() { 
        if(this.state = 1) {
            this.grid.addChanged(this)
            this.state = 0
            this.neighbors.forEach(element => {
                element.neighborKilled()
            })
        }
    }

    draw() {
        if(this.state = 1) {
            c.fillStyle = this.occupiedColor
        } else {
            c.fillStyle =  this.defaultColor
        }
        c.fillRect(this.position.x, this.position.y, this.size, this.size)
        // c.lineWidth = 0.8

        // c.beginPath()
        // c.moveTo(this.bounds["left"], this.bounds.top)
        // c.lineTo(this.bounds["right"], this.bounds.top)
        // c.lineTo(this.bounds["right"], this.bounds.bottom)
        // c.lineTo(this.bounds["left"], this.bounds.bottom)
        // c.lineTo(this.bounds["left"], this.bounds.top)
        // c.stroke()
        // c.closePath()
    }
}


function main() {

}

main()