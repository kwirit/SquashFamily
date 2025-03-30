function setActiveTool(tool, button) {
    currentTool = tool;
    
    [anthillBtn, foodBtn, wallBtn].forEach(btn => {btn.classList.remove('active');});
    
    button.classList.add('active');
}

function drawPixel(e) {
    if(!currentTool || (currentTool == "anthill" && anthill)) return;
    
    // Получаем координаты курсора относительно canvas
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.fillStyle = toolColors[currentTool];
    
    if(currentTool == "anthill") {
        ctx.fillRect(x, y, 30, 30);
        anthill = true;
    }

    ctx.fillRect(x, y, 100, 100);

    return;
}

function getColorPixel(pixel) {
    if(pixel.r == 0 && pixel.g == 0 && pixel.b == 0 && pixel.a == 255) return "black";
    else if(pixel.r == 0 && pixel.g == 128 && pixel.b == 0 && pixel.a == 255) return "green";
    else if(pixel.r == 165 && pixel.g == 42 && pixel.b == 42 && pixel.a == 255) return "brown";
    else if(pixel.r == 238 && pixel.g == 130 && pixel.b == 238 && pixel.a == 255) return "violet";
    else if(pixel.r == 128 && pixel.g == 128 && pixel.b == 128 && pixel.a == 255) return "grey";
    return "#f0f0f0";
}

function createWorld(canvas, world, foodSet, anthillPixels) {
    const cntx = canvas.getContext("2d");
    const imageData = cntx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const width = canvas.width;
    const height = canvas.height;
    const result = [];

    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4; // Индекс пикселя в массиве
            
            // Создаем объект пикселя
            const pixel = {
                r: data[index],       // Красный
                g: data[index + 1],   // Зеленый
                b: data[index + 2],   // Синий
                a: data[index + 3]    // Альфа (Прозрачность)
            };
            
            if(getColorPixel(pixel) == "green") foodSet.add({y, x});
            else if(getColorPixel(pixel) == "brown") anthillPixels.push({y, x});
            
            row.push(pixel);
        }
        world.push(row);
    }
    return;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createColony(ants, count_ants, anthillPixels) {
    for(let i = 0; i < count_ants; ++i) {
        let anthillPixel = anthillPixels[getRandomInt(0, anthillPixels.length - 1)];
        ant = {
            y: anthillPixel.y,
            x: anthillPixel.x,
            bufferPixel: "brown",
            food: false,
            visitedPixels: new Set()
        }
        ants.push(ant);
    }
    return;
}

function antMove(canvas, ant, lvlVisible, world) {
    let jump = []; //массив с координатами, куда муравей может прыгнуть

    for(let i = ant.y - lvlVisible; i < ant.y + lvlVisible + 1; ++i) {
        for(let j = ant.x - lvlVisible; j < ant.x + lvlVisible + 1; ++j) {
            if (i < 0 || i >= world.length || j < 0 || j >= world[i].length) continue;
            else if((i == ant.y && j == ant.x) || (getColorPixel(world[i][j]) == "grey")) continue;
            jump.push({y:i, x:j});
        }
    }

    // Выбираем случайную позицию из возможных для прыжка
    let nextPosition = jump[getRandomInt(0, jump.length - 1)];
    
    let cntx = canvas.getContext("2d");

    // Убираем муравья
    cntx.fillStyle = ant.bufferPixel;
    // cntx.fillRect(ant.x, ant.y, 5, 5);
    cntx.fillRect(ant.x * 1, ant.y * 1, 1, 1);

    
    // Рисуем нового муравья
    ant.bufferPixel = getColorPixel(world[nextPosition.y][nextPosition.x]); // Сохраняем цвет пикселя, на котороый прыгнет мурывай
    cntx.fillStyle = "black";
    cntx.fillRect(nextPosition.x, nextPosition.y, 1, 1);

    ant.y = nextPosition.y;
    ant.x = nextPosition.x;

    return;
}

function antColonySimulator() {
    //Инициализация объектов мира
    let world = []; //Матрица пикселей мира
    let foodSet = new Set(); // Координаты еды
    let anthillPixels = []; // Координаты муравейника
    let ants = []; // Муравьинная колония
    let pheromon = new Set; //Координаты феромонов
    
    createWorld(canvas, world, foodSet, anthillPixels);

    createColony(ants, 10000, anthillPixels);

    function simulate() {
        for (let i = 0; i < ants.length; ++i) {
            antMove(canvas, ants[i], 5, world);
        }
        
        // Рекурсивно вызываем simulate для следующего кадра
        requestAnimationFrame(simulate);
    }

    // Начинаем симуляцию
    simulate();

    return;
}