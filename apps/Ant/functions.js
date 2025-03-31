function setActiveTool(tool, button) {
    currentTool = tool;
    
    [anthillBtn, foodBtn, wallBtn].forEach(btn => {btn.classList.remove('active');});
    
    button.classList.add('active');
}

function createPixelRGBA(r, g, b, a) {
    let pixel = {
        r: r,
        g: g,
        b: b,
        a: a
    }
    return pixel;
}

function createPixelColor(color) {
    if(color == "black") return createPixelRGBA(0, 0, 0, 255);
    else if(color == "green") return createPixelRGBA(0, 128, 0, 255);
    else if(color == "brown") return createPixelRGBA(165, 42, 42, 255);
    else if(color == "violet") return createPixelRGBA(238, 130, 238, 255);
    else if(color == "grey") return createPixelRGBA(128, 128, 128, 255);
    return createPixelRGBA(0, 0, 0, 255);
}

function getColorPixel(pixel) {
    if(pixel.r == 0 && pixel.g == 0 && pixel.b == 0 && pixel.a == 255) return "black";
    else if(pixel.r == 0 && pixel.g == 128 && pixel.b == 0 && pixel.a == 255) return "green";
    else if(pixel.r == 165 && pixel.g == 42 && pixel.b == 42 && pixel.a == 255) return "brown";
    else if(pixel.r == 238 && pixel.g == 130 && pixel.b == 238 && pixel.a == 255) return "violet";
    else if(pixel.r == 128 && pixel.g == 128 && pixel.b == 128 && pixel.a == 255) return "grey";
    return "white";
}

function initWorld(matrix, height, width) {
    for(let i = 0; i < height; ++i) {
        let row = [];
        for(let j = 0; j < width; ++j) {
            let pixel = createPixelRGBA(255, 255, 255, 255);
            row.push(pixel);
        }
        matrix.push(row);
    }

    return;
}

function uploadChunk(main_matrix, pixel, chunk_height, chunk_width, mouse_x, mouse_y) {
    for(let i = mouse_y; i < mouse_y + chunk_height; ++i) {
        if(i < 0 || i > Math.min(main_matrix.length, mouse_y + chunk_height)) continue;
        for(let j = mouse_x; j < mouse_x + chunk_width; ++j) {
            if(j < 0 || j > main_matrix[i].length) continue;
            main_matrix[i][j] = pixel;
            if(getColorPixel(pixel) == "brown") anthillPixels.push({i, j});
        }
    }
    return;
}

function drawPixel(e, matrix, size_pixel) {
    if(!currentTool) return;
    
    // Получаем координаты курсора относительно canvas
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);
    
    ctx.fillStyle = toolColors[currentTool];

    if(currentTool == "anthill") {
        ctx.fillRect(x - size_pixel - 3, y - size_pixel - 3, size_pixel * 2, size_pixel * 2);
        uploadChunk(matrix, createPixelColor(toolColors[currentTool]), size_pixel, size_pixel, x - size_pixel - 3, y - size_pixel - 3);
    }
    else {
        ctx.fillRect(x - size_pixel/2 - 3, y - size_pixel/2 - 3, size_pixel, size_pixel);
        uploadChunk(matrix, createPixelColor(toolColors[currentTool]), size_pixel, size_pixel, x - size_pixel/2 - 3 , y - size_pixel / 2 - 3);
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
    if(!anthillPixels.length) {
        alert("The spawn point is not set");
        return;
    }

    createWorld(canvas, world, foodSet, anthillPixels);

    createColony(ants, 1000, anthillPixels);

    function simulate() {
        for (let i = 0; i < ants.length; ++i) {
            antMove(canvas, ants[i], 3, world);
        }
        
        // Рекурсивно вызываем simulate для следующего кадра
        requestAnimationFrame(simulate);
    }

    // Начинаем симуляцию
    simulate();

    return;
}