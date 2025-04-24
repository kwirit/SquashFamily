import {Queue, UnionFind} from "./structures.js";
import {delay, random, loadTemplate} from "./utilites.js";

let queueMain = new Queue();
let stopVisualization = true;
let grid;
let gridSize;
let path = [];
let state = "Main";
const directions = [[0, 1], [0, -1], [-1, 0], [1, 0]];

let buttonCreateGrid = document.getElementById("buttonCreateGrid");
let buttonSettingsWalls = document.getElementById("buttonSettingsWalls");
let buttonFindPath = document.getElementById("buttonFindPath");
let buttonVisualizationPath = document.getElementById("buttonVisualisationPath");
let buttonClearPath = document.getElementById("buttonClearPath");

loadTemplate('../../templates/footer.html', 'footer-templates');
loadTemplate('../../templates/headerAlgorithms.html', 'header-templates');


buttonCreateGrid.addEventListener("click", function (event) {
    if (!stopVisualization) stopVisualization = true;
    clear();
    createGrid();
})
buttonSettingsWalls.addEventListener("click", () => {
    if (!stopVisualization) stopVisualization = true;
    clear();
    changeStateEditWalls();
});
buttonFindPath.addEventListener("click", () => {
    if (!stopVisualization) stopVisualization = true;
    if (state === "Main") findPathWrapper();
});
buttonVisualizationPath.addEventListener("click", () => {
    if (state === "Main") {
        stopVisualization = false;
        visualizationPath();
    }
});
buttonClearPath.addEventListener('click', async () => {
    if (!stopVisualization) stopVisualization = true;
    await delay(250);
    clear();
});

function changeStateEditWalls() {
    if (state === "Main") {
        state = "EditWalls";
        document.getElementById("container").classList.add("editMode");
        buttonSettingsWalls.classList.add("editModeButton");
        buttonClearPath.classList.add("disabled");
        buttonFindPath.classList.add("disabled");
        buttonVisualizationPath.classList.add("disabled");
    } else {
        state = "Main";
        document.getElementById("container").classList.remove("editMode");
        buttonSettingsWalls.classList.remove("editModeButton");
        buttonClearPath.classList.remove("disabled");
        buttonFindPath.classList.remove("disabled");
        buttonVisualizationPath.classList.remove("disabled");
    }

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

    grid = Array.from({length: gridSize}, () => Array(gridSize).fill(null));

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
            square.addEventListener("click", (event) => {
                if (state === "EditWalls") editPassage(event);
            });
            square.addEventListener("click", function (event) {
                if (state === "Main") setMain(event);
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

            if (row + 2 < gridSize) walls.push([[row, col], [row + 2, col]]);
            if (col + 2 < gridSize) walls.push([[row, col], [row, col + 2]]);
        }
        if (gridSize % 2 === 0 && random(0, 1) === 0) {
            grid[row][gridSize - 1].classList.remove('wall');
            grid[row][gridSize - 1].classList.add('passage');
        }
    }
    for (let idx = 0; idx < gridSize; idx++) {
        if (gridSize % 2 === 0 && random(0, 100) <= 30) {
            grid[idx][gridSize - 1].classList.remove('wall');
            grid[idx][gridSize - 1].classList.add('passage');
        }
        if (gridSize % 2 === 0 && random(0, 100) <= 30) {
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
        if (queueMain.peekLeft() === newSquare) queueMain.popLeft(); else if (queueMain.peekRight() === newSquare) queueMain.popRight();
        return;
    }

    if (queueMain.size() >= 2) {
        const square = queueMain.popLeft();
        square.classList.remove('main');
    }
    newSquare.classList.add('main');
    queueMain.append(newSquare);
}


function clear(exceptions = new Set([])) {
    let clearsType = new Set(['main', 'path', 'sidePath', 'mainPath', 'pointedPath', 'currentPath']);
    clearsType = clearsType.difference(exceptions);

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {

            for (let type of clearsType) if (grid[row][col].classList.contains(type)) grid[row][col].classList.remove(type);

        }
    }
    if (clearsType.has('main')) queueMain.clear();
    path.length = 0;
}


function findPathWrapper() {
    if (queueMain.size() !== 2) {
        alert("Выберите две точки начала и конца.");
        return;
    }
    findPath();
    printPath();
}


function printPath() {
    for (let square of path) square.classList.add('path');

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
            if (neighbor.classList.contains('passage')) neighbors.push(neighbor);

        }
    }
    return neighbors;
}


function findPath() {
    clear(new Set(['main']));
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
        for (let neighbor of getPassageNeighbors(current)) if (!visited.has(neighbor)) {
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


async function visualizationPath() {
    if (path.length === 0 && queueMain.size() < 2) {
        alert("Выберите две точки, для нахождения пути между ними");
        return;
    }
    if (path.length === 0 && queueMain.size() === 2) findPath();

    let visited = new Set();
    let frontier = new Queue();

    let start = queueMain.peekLeft();
    let end = queueMain.peekRight();

    visited.add(start);
    frontier.append(start);

    while (!frontier.isEmpty() && !stopVisualization) {
        if (visited.has(end)) break;
        let current = frontier.popLeft();
        current.classList.add('currentPath');
        if (current.classList.contains('pointedPath')) current.classList.add("mainPath"); else current.classList.add('sidePath')

        await delay(300);
        for (let neighbor of getPassageNeighbors(current)) if (!visited.has(neighbor)) {
            frontier.append(neighbor);
            visited.add(neighbor);
        }
        current.classList.remove('currentPath');
    }

    if (visited.has(end)) end.classList.add("mainPath");

}


window.onload = function () {
    createGrid();
};