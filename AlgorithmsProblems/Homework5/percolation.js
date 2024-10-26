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


const canvas = document.querySelector('canvas');

const widthInput = document.getElementById('widthbox')
const heightInput = document.getElementById('heightbox')
const inputButton = document.getElementById('submit')

inputButton.addEventListener("click", function() {
    gridWidth = parseInt(widthInput.value)
    gridHeight = parseInt(heightInput.value)
    squareSize = canvas.width / gridWidth
    main()
});

const c = canvas.getContext("2d");
canvas.height = 2048;
canvas.width = 2048;

let gridWidth = 50;
let gridHeight = 50;

const colors = {
    "open" : "green",
    "closed" : "red",
    "path" : "blue"
}
const gridX = 500
const gridY = 500
let squareSize = 25

class UnionFind { 
    constructor(n) {
        this.parents = []
        this.heights = []
        for (let i = 0; i < n; i++) {
            this.parents.push(i) // intialize the structure with each node having a parent of itself.
            this.heights.push(0)
        }
    }

    find(u) {
        let toChange = [u]
        let r = this.parents[u]
        // console.log("finding")
        while(this.parents[r] != r) {
            toChange.push(r)
            r = this.parents[r]
            // console.log("searching")
        }
        toChange.forEach(node => {
            this.parents[node] = r
        });
        return r
    }

    connected(u, v) {
        let uRoot = this.find(u)
        let vRoot = this.find(v)
        //console.log(uRoot)
        //console.log(vRoot)
        return uRoot == vRoot
    }

    union(u, v) {
        let uRoot = this.find(u)
        let vRoot = this.find(v)
        if(this.heights[uRoot] > this.heights[vRoot]) {
            this.parents[vRoot] = uRoot
        } else if(this.heights[uRoot] < this.heights[vRoot]) {
            this.parents[uRoot] = vRoot
        } else {
            this.parents[uRoot] = vRoot
            this.heights[vRoot] += 1
        }
    }
}

class Vertex {
    constructor(id, state) { 
        this.id = id
        this.state = state
        this.visited = false
        this.connected = []
    }

    visit() {
        this.visited = true
    }

    checkVisited() {
        return this.visited
    }

    addConn(newVertex) {
        if(!this.connected.includes(newVertex))
            this.connected.push(newVertex)
    }

    setState(newState) {
        this.state = newState
    }

    getState() {
        return this.state
    }

    getConnected() {
        return this.connected
    }

    getId() {
        return this.id
    }
}

class Grid {
    constructor(width, height) {
        this.width = width
        this.height = height
        this.squares = []
        for (let i = 0; i < this.height; i++) {
            for (let f = 0; f < this.width; f++) {
                const element = new GridSquare(this.squares.length, {x: f, y : i}, "closed")
                this.squares.push(element)
            }
        }
    }
x
    draw() {
        this.squares.forEach(element => {
            element.draw()
        });
    }

    setSquareState(id, state) { 
        let square = this.squares[id]
        square.setState(state)
    }
}

class GridSquare {
    constructor(id, position, state) {
        this.id = id
        this.position = position
        this.state = state
        this.size = squareSize
    }

    setState(newState) {
        //setting as new state
        this.state = newState
    }

    draw() {
        c.fillStyle = colors[this.state]
        c.fillRect((this.position.x) * this.size, (this.position.y) * this.size, this.size, this.size)
        c.lineWidth = 0.8
        c.beginPath()
        c.moveTo(this.position.x  * this.size, this.position.y  * this.size)
        c.lineTo(this.position.x  * this.size + this.size, this.position.y  * this.size)
        c.lineTo(this.position.x  * this.size + this.size, this.position.y  * this.size + this.size)
        c.lineTo(this.position.x  * this.size, this.position.y  * this.size + this.size)
        c.lineTo(this.position.x  * this.size, this.position.y  * this.size)
        c.stroke()
        c.closePath()
    }
}

// function checkPercolation(openTop, openBottom, union) {
//     openTop.forEach(u => {
//         openBottom.forEach(v => {
//             console.log("checking top vs bottom")
//             if(union.connected(u,v)) {
//                 return true
//             }
//         })
//     });
//     return false
// }

function getAdj(i, gridWidth, totalVert) {
    if((i - gridWidth) < 0) {
        if(i % gridWidth == 0) {
            return [i+1, i+gridWidth]
        } else if((i + 1) % gridWidth == 0) {
            return [i-1, i+gridWidth]
        } else {
            return [i+1, i-1, i+gridWidth]
        }
    } else if((i + gridWidth) > totalVert - 1) {
        if(i % gridWidth == 0) {
            return [i+1, i-gridWidth]
        } else if((i + 1) % gridWidth == 0) {
            return [i-1, i-gridWidth]
        } else {
            return [i+1, i-1, i-gridWidth]
        }
    } else if(i % gridWidth == 0) {
        return [i+1, i-gridWidth, i+gridWidth]
    } else if((i + 1) % gridWidth == 0) {
        return [i-1, i-gridWidth, i+gridWidth]
    }
    return [i-1, i+1, i-gridWidth, i+gridWidth]
}

function BFS(graph, node) {
    let Q = []
    parents = {}
    layer = {}
    node.visit()
    Q.push(node)
    while(Q.length > 0) {
        //console.log("Test")
        let i = Q.shift()
        let visited = i.getConnected()
        visited.forEach(element => {
            if(!element.checkVisited()){
                element.visit()
                element.setState("path")
                Q.push(element)
                parents[element.getId()] = i
                //console.log(i)
                layer[element.getId()] = layer[i] + 1
            }
        });
    }
    return [parents, layer]
}

function main() {
    const openTop = []
    const openBottom = []
    const opened = []
    const vertexCount = gridHeight * gridWidth
    //console.log(vertexCount)
    const vertices = []
    for (let i = 0; i < gridHeight; i++) {
        for (let f = 0; f < gridWidth; f++) {
            vertices.push(new Vertex(vertices.length, "closed"))
        }
    }
    vertices.push(new Vertex(vertices.length, "closed"))
    vertices.push(new Vertex(vertices.length, "closed"))

    const grid = new Grid(gridWidth, gridHeight)
    grid.draw()
    const unionFind = new UnionFind(vertexCount + 2) //extra nodes 2500 and 2501 to make checking faster
    for (let index = 0; index < gridWidth; index++) { //all nodes between 0 and 49 with gridwidth of 50
        unionFind.union(index, vertexCount)
        vertices[index].addConn(vertices[vertexCount])
        vertices[vertexCount].addConn(vertices[index])
    }
    for (let index = vertexCount-1; index > vertexCount - 1 - gridWidth; index--) { //all nodes between 2499 and 2449 with gridwidth of 50
        unionFind.union(index, vertexCount+1)
        vertices[index].addConn(vertices[vertexCount+1])
        vertices[vertexCount+1].addConn(vertices[index])
    }
    while(!unionFind.connected(vertexCount, vertexCount+1)) {
        if(opened.length > vertexCount) { 
            break
        }
        let newOpening = Math.round(Math.random() * (vertexCount - 1))
        while(opened.includes(newOpening)) {
            //console.log("regenerating")
            newOpening = Math.round(Math.random() * (vertexCount - 1))
        }
        if(newOpening < gridWidth) {
            openTop.push(newOpening)
            unionFind.union()
        } else if (newOpening > vertexCount - gridWidth) {
            openBottom.push(newOpening)
        }
        // console.log(newOpening)
        let newOpen = vertices[newOpening]
        newOpen.setState("open")
        grid.setSquareState(newOpening, "open")
        const adj = getAdj(newOpening, gridWidth, vertexCount)
        adj.forEach(ind => { //Constant time
            let otherVert = vertices[ind]
            //console.log(ind)
            //console.log(adj)
            if(otherVert.getState() == "open") {
                otherVert.addConn(newOpen)
                newOpen.addConn(otherVert)
                unionFind.union(newOpening, ind)
            }
        });
        //grid.draw()
        opened.push(newOpening)
        //console.log("New thing added")
    }
    //console.log("finished")
    grid.draw()
    let orderedGraph = BFS(vertices, vertices[vertexCount])
    let parents = orderedGraph[0]
    let layers = orderedGraph[1]
    //console.log("Parents: ")
    console.log(parents)
    let vert = parents[vertexCount + 1]
    grid.draw()
    grid.setSquareState(vert.getId(), "path")
    while(parents[vert.getId()] != vertices[vertexCount] && parents[vert.getId()] != vert){
        vert = parents[vert.getId()]
        console.log(vert.getId())
        grid.setSquareState(vert.getId(), "path")
    }
    grid.draw()
}

main()

function unionFindTest() {
    let union = new UnionFind(50)
    console.log(union.find(1))
    console.log(union.find(2))
    union.union(1, 2)
    console.log(union.find(1))
    console.log(union.find(2))
    for (let index = 0; index < 50; index++) {
        union.union(1, index)
        console.log(union.find(index))
    }
    console.log(union.find(49))
}

// unionFindTest()