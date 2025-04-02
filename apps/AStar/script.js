import { Queue, UnionFind } from "./structures.js";

let queueMain = new Queue();
let grid;
let gridSize;
let path = new Array(0);
const directions = [[0, 1], [0, -1], [-1, 0], [1, 0]];


function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createGrid() {
    function checkGridSize(size) {
        if (isNaN(size) || size < 2 || size > 1000) {
            alert("Введите корректное число от 2 до 100.");
            return true;
        }
        return false;
    }

    const sizeGrid = document.getElementById("sizeGrid");
    gridSize = parseInt(sizeGrid.value, 10);

    if (checkGridSize(gridSize)) return;

    grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(null));

    const container = document.getElementById("container");
    container.innerHTML = "";

    container.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    container.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const square = document.createElement("div");
            square.dataset.row = row;
            square.dataset.col = col;
            square.classList.add('square');
            square.classList.add("wall");
            square.addEventListener("click", editPassage);
            square.addEventListener("contextmenu", function (event) {
                event.preventDefault();
                setMain(event);
            });
            container.appendChild(square);
            grid[row][col] = square;
        }
    }
    generateMazeKruskal();
}

function generateMazeKruskal() {
    let walls = [];

    for (let row = 0; row < gridSize; row += 2) {
        for (let col = 0; col < gridSize; col += 2) {
            grid[row][col].classList.remove('wall');
            grid[row][col].classList.add('passage');

            if (row + 2 < gridSize)
                walls.push([[row, col], [row + 2, col]]);
            if (col + 2 < gridSize)
                walls.push([[row, col], [row, col + 2]]);
        }
        if (gridSize % 2 === 0 && random(0, 1) === 0){
            grid[row][gridSize - 1].classList.remove('wall');
            grid[row][gridSize - 1].classList.add('passage');
        }
    }
    for (let idx = 0; idx < gridSize; idx++) {
        if (gridSize % 2 === 0 && random(0, 100) <= 30){
            grid[idx][gridSize - 1].classList.remove('wall');
            grid[idx][gridSize - 1].classList.add('passage');
        }
        if (gridSize % 2 === 0 && random(0, 100) <= 30){
            grid[gridSize - 1][idx].classList.remove('wall');
            grid[gridSize - 1][idx].classList.add('passage');
        }
    }

    walls.sort(() => Math.random() - 0.5);

    const uf = new UnionFind(gridSize * gridSize);

    for (const [[row1, col1], [row2, col2]] of walls) {
        const index1 = row1 * gridSize + col1;
        const index2 = row2 * gridSize + col2;

        if (uf.find(index1) !== uf.find(index2)) {
            uf.union(index1, index2);
            grid[row1][col1].classList.remove('wall');
            grid[row1][col1].classList.add('passage');
            grid[row2][col2].classList.remove('wall');
            grid[row2][col2].classList.add('passage');

            const wallRow = (row1 + row2) / 2;
            const wallCol = (col1 + col2) / 2;
            grid[wallRow][wallCol].classList.remove('wall');
            grid[wallRow][wallCol].classList.add('passage');
        }
    }
}

function editPassage(event) {
    const square = event.target;
    if (square.classList.contains('wall')) {
        square.classList.remove('wall');
        square.classList.add('passage');
    } else if (square.classList.contains('passage')) {
        square.classList.add('wall');
        square.classList.remove('passage');
    }
}

function setMain(event) {
    const newSquare = event.target;
    if (newSquare.classList.contains('wall')) return;

    if (newSquare.classList.contains('main')) {
        newSquare.classList.remove('main');
        if (queueMain.peekLeft() === newSquare)
            queueMain.popLeft();
        else if (queueMain.peekRight() === newSquare)
            queueMain.popRight();
        return;
    }

    if (queueMain.size() >= 2) {
        const square = queueMain.popLeft();
        square.classList.remove('main');
    }
    newSquare.classList.add('main');
    queueMain.append(newSquare);
}


function clear() {
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (grid[row][col].classList.contains('main'))
                grid[row][col].classList.remove('main');
            if (grid[row][col].classList.contains('path'))
                grid[row][col].classList.remove('path');
            if (grid[row][col].classList.contains('sidePath'))
                grid[row][col].classList.remove('sidePath');
            if (grid[row][col].classList.contains('mainPath'))
                grid[row][col].classList.remove('mainPath');
        }
    }
    path.length = 0;
}

function bottonFindPath(){
    if (queueMain.size() !== 2) {
        alert("Выберите две точки начала и конца.");
        return;
    }
    findPath();
    printPath();
}

function printPath(){
    for (let square of path)
        square.classList.add('path');

}
function getPassageNeighbors(square) {
    const neighbors = [];
    let row = parseInt(square.dataset.row, 10);
    let col = parseInt(square.dataset.col, 10);
    for (const [dRow, dCol] of directions) {
        const newRow = row + dRow;
        const newCol = col + dCol;
        if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
            const neighbor = grid[newRow][newCol];
            if (neighbor.classList.contains('passage'))
                neighbors.push(neighbor);

        }
    }
    return neighbors;
}

function findPath() {
    path.length = 0;

    let frontier = new Queue();
    let visited = new Set();
    let parents = new Map();

    let start = queueMain.peekLeft();
    let end = queueMain.peekRight();

    frontier.append(start);
    visited.add(start);

    while (!frontier.isEmpty()) {
        let current = frontier.popLeft();
        for (let neighbor of getPassageNeighbors(current))
            if (!visited.has(neighbor)) {
                frontier.append(neighbor);
                visited.add(neighbor);
                parents.set(neighbor, current);
            }
    }

    if (!visited.has(end)) {
        alert("Путь не найден");
        return;
    }

    let current = end;
    while (current !== start) {
        path.push(current);
        current.classList.add('pointedPath')
        current = parents.get(current);
    }
    path.push(start);
    current.classList.add('pointedPath')
    path = path.reverse();
}

function getPath(){
    async function DFS(current){
        await delay(100)
        if (current === end && currPath !== path.length - 1)
            return;
        visited.add(current);
        if (visited.has(end))
            return;
        if (current.classList.contains('pointedPath')) {
            current.classList.add("mainPath");
            currPath++;
        }
        else
            current.classList.add("sidePath");

        for (let neighbor of getPassageNeighbors(current)) {
            if (neighbor.classList.contains('pointedPath') && !visited.has(neighbor))
                await DFS(neighbor);
            if (!visited.has(neighbor))
                await DFS(neighbor);
        }

    }
    if (path.length === 0 && queueMain.size() === 0) {
        alert("Выберите две точки, для нахождения пути между ними");
        return;
    }
    if (path.length === 0 && queueMain.size() === 2) {}
        findPath();

    let visited = new Set();

    let start = queueMain.peekLeft();
    let end = queueMain.peekRight();
    let currPath = 0;
    visited.add(start);

    DFS(start);
    if (visited.has(end))
        end.classList.add("mainPath");

}

window.createGrid = createGrid;
window.findPath = bottonFindPath;
window.getPath = getPath;
window.deletePath = clear;


window.onload = function() {
    createGrid();
};