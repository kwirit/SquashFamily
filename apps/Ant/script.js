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

// Словарь цветов
const toolColors = {anthill: "brown", food: "green", wall: "grey"};

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