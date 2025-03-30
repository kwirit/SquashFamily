// Получаем элементы
const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');

const anthillBtn = document.getElementById('anthillBtn');
const foodBtn = document.getElementById('foodBtn');
const wallBtn = document.getElementById('wallBtn');

// Переменные состояния
let currentTool = null;
let canDraw = false;
let anthill = false;

// Словарь цветов
const toolColors = {
    anthill: "brown",
    food: "green",
    wall: "grey"
};

anthillBtn.addEventListener('click', () => {setActiveTool('anthill', anthillBtn);});
foodBtn.addEventListener('click', () => {setActiveTool('food', foodBtn);});
wallBtn.addEventListener('click', () => {setActiveTool('wall', wallBtn);});


// Обработчики для рисования на canvas
canvas.addEventListener('mousedown', (e) => {
    if (!currentTool || e.button != 0) return;
    canDraw = true;
    drawPixel(e);
});

canvas.addEventListener('mousemove', (e) => {
    if (!canDraw || !currentTool) return;
    drawPixel(e);
});

canvas.addEventListener('mouseup', () => {
    canDraw = false;
});

canvas.addEventListener('mouseleave', () => {
    canDraw = false;
});

anthillBtn.click();



//Активируем функцию при нажатии на кнопку
startBtn.addEventListener('click', () => antColonySimulator());