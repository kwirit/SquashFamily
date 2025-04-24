// Получаем элементы
const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');

// Конпки
const anthillBtn = document.getElementById('anthillBtn');
const foodBtn = document.getElementById('foodBtn');
const wallBtn = document.getElementById('wallBtn');
const eraserBtn = document.getElementById('eraserBtn');

// Поле для ввода
document.getElementById('brushSize-rangeButton').addEventListener('change', function () {
    BRUSH_SIZE = parseInt(this.value);
})

// Кисть
let BRUSH_SIZE = 10; // Размер кисти
let START = false;

// Переменные состояния
let currentTool = null;
let canDraw = false;

// Словарь цветов
const toolColors = {anthill: "brown", food: "green", wall: "grey", eraser: "white"};

// Обработка нажатия на кнопки
anthillBtn.addEventListener('click', () => {
    setActiveTool('anthill', anthillBtn);
});
foodBtn.addEventListener('click', () => {
    setActiveTool('food', foodBtn);
});
wallBtn.addEventListener('click', () => {
    setActiveTool('wall', wallBtn);
});
eraserBtn.addEventListener('click', () => {
    setActiveTool('eraser', eraserBtn);
});


// Обработчики для рисования на canvas
canvas.addEventListener('mousedown', (e) => {
    if (!currentTool || e.button != 0) return;
    canDraw = true;
    drawPixel(e, world, BRUSH_SIZE);
});

canvas.addEventListener('mousemove', (e) => {
    if (canDraw && (currentTool == "wall" || currentTool == "eraser")) drawPixel(e, world, BRUSH_SIZE);
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

async function loadTemplate(url, elementId) {
    const response = await fetch(url);
    if (response.ok) {
        const text = await response.text();
        document.getElementById(elementId).innerHTML = text;
    } else console.error('Error load template');
}

loadTemplate('../../templates/footer.html', 'footer-templates');
loadTemplate('../../templates/headerAlgorithms.html', 'header-templates');

document.addEventListener('DOMContentLoaded', function () {
    const buttons = document.querySelectorAll('.general-buttons .btn :not(#spawnBtn)');

    buttons.forEach(button => {
        button.addEventListener('click', function () {
            buttons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
});
document.addEventListener('DOMContentLoaded', function () {
    const rangeInput = document.getElementById('brushSize-rangeButton');
    const rangeValue = document.getElementById('brushSize-rangeValue');

    rangeInput.addEventListener('input', function () {
        BRUSH_SIZE = parseInt(rangeInput.value, 10);
        rangeValue.textContent = rangeInput.value;
    });

    BRUSH_SIZE = parseInt(rangeInput.value, 10);
    rangeValue.textContent = rangeInput.value;
});

