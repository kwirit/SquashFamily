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


// function getChunk(canvasData, canvasWidth, x, y, chunkWidth, chunkHeight) {
//     const chunk = [];
//     const bytesPerPixel = 4; // Каждый пиксель имеет 4 компонента: R, G, B, A

//     for (let row = 0; row < chunkHeight; row++) {
//         const chunkRow = [];
//         const sourceY = y + row; // Вычисляем текущую строку в canvas
        
//         for (let col = 0; col < chunkWidth; col++) {
//             const sourceX = x + col; // Вычисляем текущий столбец в canvas
            
//             // Вычисляем позицию в одномерном массиве
//             const index = (sourceY * canvasWidth + sourceX) * bytesPerPixel;
            
//             // Создаём пиксель, передавая значения RGBA
//             const pixel = createPixelRGBA(
//                 canvasData[index],       // R
//                 canvasData[index + 1],   // G
//                 canvasData[index + 2],   // B
//                 canvasData[index + 3]    // A
//             );
            
//             chunkRow.push(pixel);
//         }
//         chunk.push(chunkRow);
//     }

//     return chunk;
// }

// function uploadChunk(destinationData, destinationWidth, sourceChunk, mouseX, mouseY) {
//     const chunkHeight = sourceChunk.length;
//     const chunkWidth = sourceChunk[0].length;
    
//     for (let row = 0; row < chunkHeight; row++) {
//         for (let col = 0; col < chunkWidth; col++) {
//             const destX = mouseX + col;
//             const destY = mouseY + row;
            
//             // Пропускаем пиксели за границами canvas
//             if (destX < 0 || destY < 0 || destX >= destinationWidth || destY >= (destinationData.length / (destinationWidth * 4))) {
//                 continue;
//             }
            
//             const destIndex = (destY * destinationWidth + destX) * 4;
//             const pixel = sourceChunk[row][col];
            
//             // Копируем RGBA
//             destinationData[destIndex]     = pixel[0]; // R
//             destinationData[destIndex + 1] = pixel[1]; // G
//             destinationData[destIndex + 2] = pixel[2]; // B
//             destinationData[destIndex + 3] = pixel[3]; // A
//         }
//     }
// }

// const canvas = document.getElementById('mapCanvas');

// canvas.addEventListener('mousemove', (event) => {
//     const rect = canvas.getBoundingClientRect(); // Границы canvas на странице
//     const x = Math.floor(event.clientX - rect.left); // Координата X внутри canvas
//     const y = Math.floor(event.clientY - rect.top);  // Координата Y внутри canvas
    
//     console.log(`Координаты курсора на canvas: x=${x}, y=${y}`);
// });


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
    for(let i = mouse_y; i < chunk_height; ++i) {
        if(i < 0 || i > Math.min(main_matrix.length, mouse_y + chunk_height)) continue;
        for(let j = mouse_x; j < chunk_width; ++j) {
            if(j < 0 || j > main_matrix[i].length) continue;
            main_matrix[i][j] = pixel;
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

    // console.log(x, y)
    // console.log(chunk);

    return;
}

// function getCanvasMatrix(canvas) {
//     const cntx = canvas.getContext("2d");
//     const imageData = cntx.getImageData(0, 0, canvas.width, canvas.height);
//     const data = imageData.data;

//     const width = canvas.width;
//     const height = canvas.height;
//     const result = [];

//     for (let y = 0; y < height; y++) {
//         const row = [];
//         for (let x = 0; x < width; x++) {
//             const index = (y * width + x) * 4; // Индекс пикселя в массиве
//             const pixel = createPixelRGBA(data[index], data[index + 1], data[index + 2], data[index + 3]);
//             row.push(pixel);
//         }
//         result.push(row);
//     }
//     return result;
// }

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