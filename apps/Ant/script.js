// Получаем элементы
const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');

// Конпки
const anthillBtn = document.getElementById('anthillBtn');
const foodBtn = document.getElementById('foodBtn');
const wallBtn = document.getElementById('wallBtn');



// Переменные состояния
let currentTool = null;
let canDraw = false;
// let anthill = false;

// Словарь цветов
const toolColors = {anthill: "brown", food: "green", wall: "grey"};



// // Инициализация объектов мира
// let world = []; initWorld(world, canvas.height, canvas.width); //Матрица пикселей мира
// let anthillPixels = []; // Координаты муравейника
// let ants = []; // Муравьинная колония
// let pheromones = new Map(); //Координаты - уровень феромоно. Храним феромоны, которые > min

// // Параметры
// let ALF = 1; // Параметр влияния феромонов
// let P = 0.1; // Скорость испарения феромоно
// let L = 400000000; // Длина оптимального путь
// let A = 10; // Корректировка минимального порога феромонов

// // Уровень феромонов
// let max_pheromon_lvl = 1/(P * L);
// let min_pheromon_lvl = max_pheromon_lvl / A;

// Обработка нажатия на кнопки
anthillBtn.addEventListener('click', () => {setActiveTool('anthill', anthillBtn);});
foodBtn.addEventListener('click', () => {setActiveTool('food', foodBtn);});
wallBtn.addEventListener('click', () => {setActiveTool('wall', wallBtn);});


// Обработчики для рисования на canvas
canvas.addEventListener('mousedown', (e) => {
    if (!currentTool || e.button != 0) return;
    canDraw = true;
    drawPixel(e, world, 15);
});

canvas.addEventListener('mousemove', (e) => {
    if (!canDraw || currentTool != "wall") return;
    drawPixel(e, world, 15);
});

canvas.addEventListener('mouseup', () => {
    canDraw = false;
});

canvas.addEventListener('mouseleave', () => {
    canDraw = false;
});

anthillBtn.click();

//Активируем функцию при нажатии на кнопку
spawnBtn.addEventListener('click', () => antColonySimulator(canvas));