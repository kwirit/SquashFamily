class Queue {
    constructor() {
        this.items = {};
        this.rear = 0;
        this.front = 0;
    }

    append(element) {
        this.items[this.rear++] = element;
    }

    pop() {
        if (this.isEmpty())
            return "Queue is empty";
        const item = this.items[this.front];
        delete this.items[this.front++];
        return item;
    }

    peekLeft() {
        if (this.isEmpty())
            return "Queue is empty";
        return this.items[this.front];
    }

    peekRight() {
        if (this.isEmpty())
            return "Queue is empty";
        return this.items[this.rear - 1];
    }

    isEmpty() {
        return this.rear - this.front === 0;
    }

    size() {
        return this.rear - this.front;
    }
}

let queueMain = new Queue();
let grid;
let gridSize;


function generateField() {
    const sizeField = document.getElementById("sizeField");
    gridSize = parseInt(sizeField.value, 10);

    if (checkSizeGrid(gridSize)) return;

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
            setStateSquare(square);
            square.addEventListener("click", changeStateSquare);
            square.addEventListener("contextmenu", function (event) {
                event.preventDefault();
                setMain(event);
            });
            container.appendChild(square);
            grid[row][col] = square;
        }
    }
}

function setStateSquare(square) {
    if (Math.floor(Math.random() * (2)) === 0)
        square.classList.add('passage');
    else
        square.classList.add('wall');
}

function checkSizeGrid(size) {
    if (isNaN(size) || size < 2 || size > 100) {
        alert("Введите корректное число от 2 до 100.");
        return true; // Возвращаем true, чтобы прекратить выполнение функции generateField
    }
    return false;
}

function changeStateSquare(event) {
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
        queueMain.pop(); // Удаляем из очереди
        return;
    }

    if (queueMain.size() >= 2) {
        const square = queueMain.pop();
        square.classList.remove('main');
    }
    newSquare.classList.add('main');
    queueMain.append(newSquare);
}

function getNeighbors(row, col) {
    const neighbors = [];
    const directions = [
        [-1, 0], // up
        [1, 0],  // down
        [0, -1], // left
        [0, 1]   // right
    ];
    for (const [dRow, dCol] of directions) {
        const newRow = row + dRow;
        const newCol = col + dCol;
        if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
            const neighbor = grid[newRow][newCol];
            if (neighbor.classList.contains('passage')) {
                neighbors.push(neighbor);
            }
        }
    }
    return neighbors;
}

function setPath(square) {
    square.classList.add('path');
    square.classList.remove('passage');
}

function findPath() {
    if (queueMain.size() !== 2) {
        alert("Выберите две точки начала и конца.");
        return;
    }

    let frontier = new Queue();
    let visited = new Map();
    let parents = new Map();

    let start = queueMain.peekLeft();
    let end = queueMain.peekRight();

    frontier.append(start);
    visited.set(start, true);

    while (!frontier.isEmpty()) {
        let current = frontier.pop();
        let row = parseInt(current.dataset.row, 10);
        let col = parseInt(current.dataset.col, 10);

        for (let neighbor of getNeighbors(row, col)) {
            if (!visited.has(neighbor)) {
                frontier.append(neighbor);
                visited.set(neighbor, true);
                parents.set(neighbor, current);
            }
        }
    }

    if (!visited.has(end)) {
        alert("Путь не найден");
        return;
    }

    let current = end;
    while (current !== null) {

        setPath(current);
        current = parents.get(current);
    }
}

window.onload = function() {
    generateField();
};