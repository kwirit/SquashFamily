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

// function initWorld(matrix, height, width) {
//     for(let i = 0; i < height; ++i) {
//         let row = [];
//         for(let j = 0; j < width; ++j) {
//             let pixel = createPixelRGBA(255, 255, 255, 255);
//             row.push(pixel);
//         }
//         matrix.push(row);
//     }

//     return;
// }

function uploadChunk(main_matrix, pixel, chunk_height, chunk_width, mouse_x, mouse_y) {
    // console.log(mouse_y, mouse_x);
    for(let i = mouse_y; i < mouse_y + chunk_height; ++i) {
        if(i < 0) continue;
        else if(i > main_matrix.length - 1) break;

        for(let j = mouse_x; j < mouse_x + chunk_width; ++j) {
            if(j < 0) continue;
            else if(j > main_matrix[i].length - 1) break;

            main_matrix[i][j] = pixel;
            if(getColorPixel(pixel) == "brown") anthillPixels.push({y:i, x:j});
            // console.log(getColorPixel(pixel));
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
        ctx.fillRect(x, y, size_pixel * 2, size_pixel * 2);
        uploadChunk(matrix, createPixelColor(toolColors[currentTool]), size_pixel * 2, size_pixel * 2, x, y);
    }
    else {
        ctx.fillRect(x, y, size_pixel, size_pixel);
        uploadChunk(matrix, createPixelColor(toolColors[currentTool]), size_pixel, size_pixel, x, y);
    }

    return;
}




// function getRandomInt(min, max) {
//     return Math.floor(Math.random() * (max - min + 1)) + min;
// }

// function createColony(ants, count_ants, anthillPixels) {
//     for(let i = 0; i < count_ants; ++i) {
//         let anthillPixel = anthillPixels[getRandomInt(0, anthillPixels.length - 1)];
//         ant = {
//             y: anthillPixel.y,
//             x: anthillPixel.x,
//             visited: new Set(),
//             // path: 0,
//             food: false,
//         }
//         ants.push(ant);
//     }
//     return;
// }

// function getAvailablePixels(worldMatrix, ant, lvl_visible) {
//     let result = [];
//     for(let i = ant.y - lvl_visible; i < ant.y + lvl_visible; ++i) {
//         if(i < 0) continue;
//         else if(i > worldMatrix.length - 1) break;

//         for(let j = ant.x - lvl_visible; j < ant.x + lvl_visible; ++j) {
//             if(j < 0) continue;
//             else if(j > worldMatrix[i].length - 1) break;

//             let color_pixel = getColorPixel(worldMatrix[i][j]);
//             if(color_pixel != "grey") {
//                 if((!ant.food && color_pixel == "green") || (ant.food && color_pixel == "brown")) return new Array({i, j});
//                 else if(!ant.visited.has({i, j})) result.push({i, j});
//             }
//         }
//     }
    
//     return result;
// }

// // Пропорциональный выбор по пригодности (Fitness proportionate selection)
// function getPixelForJump(pheromonesMap, availeblePixels) {
//     let sum = 0;
//     for(let i = 0; i < availeblePixels.length; ++i) {
//         if(pheromonesMap.has(availeblePixels[i])) {
//             sum += pheromonesMap[availeblePixels[i]];
//         }
//         else sum += min_pheromon_lvl;
//     }

//     // Рулетка
//     let normalizePheromonesLvlAvaileblePixels = [];
//     for(let i = 0; i < availeblePixels.length; ++i) {
//         if(pheromonesMap.has(availeblePixels[i])) normalizePheromonesLvlAvaileblePixels.push(pheromonesMap[availeblePixels[i]] / sum);
//         else normalizePheromonesLvlAvaileblePixels.push(min_pheromon_lvl / sum);
//     }

//     // Выбираем случайное значение
//     let ptr = Math.random();

//     // Возвращаем выбранное значение
//     sum = 0;
//     for(let i = 0; i < normalizePheromonesLvlAvaileblePixels.length; ++i) {
//         sum += normalizePheromonesLvlAvaileblePixels[i];
//         if(ptr <= sum) return availeblePixels[i];
//     }
// }

// function jump(ant, next_position, size_ant) {
//     ant.visited.add({y:ant.y, x:ant.x});

//     let ctx = canvas.getContext("2d")

//     // Закрашиваем муравья
//     ctx.fillStyle = getColorPixel(world[ant.y][ant.x]);
//     ctx.fillRect(ant.x, ant.y, 1, 1);
    
//     // Рисуем муравья на новой позиции
//     ctx.fillStyle = "black";
//     ctx.fillRect(next_position.x * size_ant, next_position.y * size_ant, 1, 1);
    
//     return;
// }

// function killAnt(ant, size_ant) {
//     ant.visited.clear();

//     ctx.fillStyle = getColorPixel(world[ant.y][ant.x]);
    
//     let spawn = getRandomInt(0, anthillPixels.length);
//     ant.y = spawn.y;
//     ant.x = spawn.x;
//     ctx.fillRect(ant.y, ant.x, size_ant, size_ant);

//     return;
// }

// function moveAnt(worldMatrix, ant, size_ant, lvl_visible, limit_distance) {
//     if(ant.visited.size > limit_distance) killAnt(ant, size_ant);

//     let availeblePixels = getAvailablePixels(worldMatrix, ant, lvl_visible);
//     let next_pixel = getPixelForJump(pheromones, availeblePixels);
//     jump(ant, next_pixel, size_ant);
    
//     return;
// }

// function antColonySimulator() {
//     if(!anthillPixels.length) {
//         alert("The spawn point is not set");
//         return;
//     }

//     createColony(ants, 1000, anthillPixels);
    
//     function simulate() {
//         // Обновляем всех муравьев
//         for (let i = 0; i < ants.length; ++i) {
//             moveAnt(world, ants[i], 2, 2, 1000);
//         }
        
//         // Запуск анимации
//         requestAnimationFrame(simulate);
//     }
    
//     simulate();


//     return;
// }