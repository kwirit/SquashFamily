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

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createColony(ants, count_ants, anthillPixels) {
    for(let i = 0; i < count_ants; ++i) {
        let anthillPixel = anthillPixels[getRandomInt(0, anthillPixels.length - 1)];
        const new_ant = structuredClone(ant);
        new_ant.y = anthillPixel.y;
        new_ant.x = anthillPixel.x;
        ants.push(new_ant);
    }
    return;
}

function getAvailablePixels(worldMatrix, ant, lvl_visible) {
    let result = [];
    let color;
    let pixel;
    for(let i = ant.y - 1; (i >= ant.y - lvl_visible) && !(i < 0); --i) {
        pixel = {y:i, x:ant.x};
        color = getColorPixel(worldMatrix[pixel.y][pixel.x]);
        if(color == "grey") break;
        else if((!ant.food && color == "green") || (ant.food && color == "brown")) return new Array(pixel);
        else if(!ant.visited.has(pixel)) result.push(pixel);
    }
    for(let i = ant.y + 1; (i <= ant.y + lvl_visible) && !(i >= worldMatrix.length); ++i) {
        pixel = {y:i, x:ant.x};
        color = getColorPixel(worldMatrix[pixel.y][pixel.x]);
        if(color == "grey") break;
        else if((!ant.food && color == "green") || (ant.food && color == "brown")) return new Array(pixel);
        else if(!ant.visited.has(pixel)) result.push(pixel);
    }
    for(let i = ant.x - 1; (i >= ant.x - lvl_visible) && !(i < 0); --i) {
        pixel = {y:ant.y, x:i};
        color = getColorPixel(worldMatrix[pixel.y][pixel.x]);
        if(color == "grey") break;
        else if((!ant.food && color == "green") || (ant.food && color == "brown")) return new Array(pixel);
        else if(!ant.visited.has(pixel)) result.push(pixel);
    }
    for(let i = ant.x + 1; (i <= ant.x + lvl_visible) && !(i >= worldMatrix[ant.y].length); ++i) {
        pixel = {y:ant.y, x:i};
        color = getColorPixel(worldMatrix[pixel.y][pixel.x]);
        if(color == "grey") break;
        else if((!ant.food && color == "green") || (ant.food && color == "brown")) return new Array(pixel);
        else if(!ant.visited.has(pixel)) result.push(pixel);
    }

    return result;


    // for(let i = ant.y - lvl_visible; i <= ant.y + lvl_visible; ++i) {
    //     if(i < 0) continue;
    //     else if(i > worldMatrix.length - 1) break;

    //     for(let j = ant.x - lvl_visible; j <= ant.x + lvl_visible; ++j) {
    //         if(j < 0) continue;
    //         else if(j > worldMatrix[i].length - 1) break;

    //         let color_pixel = getColorPixel(worldMatrix[i][j]);
    //         if(color_pixel != "grey") {
    //             if((!ant.food && color_pixel == "green") || (ant.food && color_pixel == "brown")) return new Array({y:i, x:j});
    //             else if(!ant.visited.has({i, j})) result.push({y:i, x:j}); //i = y; j = x;
    //         }
    //     }
    // }
    
    // return result;
}

// Пропорциональный выбор по пригодности (Fitness proportionate selection)
function getPixelForJump(pheromonesMap, availeblePixels) {
    let sum = 0;
    for(let i = 0; i < availeblePixels.length; ++i) {
        if(pheromonesMap.has(availeblePixels[i])) {
            sum += pheromonesMap[availeblePixels[i]];
        }
        else sum += min_pheromon_lvl;
    }

    // Рулетка
    let normalizedPheromones = [];
    for(let i = 0; i < availeblePixels.length; ++i) {
        if(pheromonesMap.has(availeblePixels[i])) normalizedPheromones.push(pheromonesMap[availeblePixels[i]] / sum);
        else normalizedPheromones.push(min_pheromon_lvl / sum);
    }

    // Выбираем случайное значение
    let ptr = Math.random();

    // Проверяем на что указывает указатель
    sum = 0;
    for(let i = 0; i < normalizedPheromones.length; ++i) {
        sum += normalizedPheromones[i];
        if(ptr <= sum) return availeblePixels[i];
    }
}

function killAnt(canvas, worldMatrix, anthillPixels, ant, ant_size) {
    ant.visited.clear();
    
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = getColorPixel(worldMatrix[ant.y][ant.x]);
    ctx.fillRect(ant.x, ant.y, ant_size, ant_size);

    let spawn = anthillPixels[getRandomInt(0, anthillPixels.length - 1)];
    ant.y = spawn.y;
    ant.x = spawn.x;
    return;
}

function moveAnt(canvas, worldMatrix, anthillPixels, pheromonesMap, ant, ant_size, lvl_visible, limit_distance) {
    if((ant.visited.size > limit_distance)) {
        killAnt(canvas, worldMatrix, anthillPixels, ant, ant_size);
        return;
    }

    let availeblePixels = getAvailablePixels(worldMatrix, ant, lvl_visible);

    if(availeblePixels.length == 0) {
        killAnt(canvas, worldMatrix, anthillPixels, ant, ant_size); // Если муравей оказался в стене
        return;
    }
    
    // Находим следующий пиксель и помечаем текущий как посещённый
    let next_pixel = getPixelForJump(pheromonesMap, availeblePixels);

    // Убираем муравья
    let color = getColorPixel(worldMatrix[ant.y][ant.x]);
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = color;
    ctx.fillRect(ant.x, ant.y, ant_size, ant_size);

    // Рисуем муравья
    ctx.fillStyle = "black";
    ctx.fillRect(next_pixel.x, next_pixel.y, ant_size, ant_size);
    
    ant.visited.add({y:ant.y, x:ant.x});
    ant.y = next_pixel.y;
    ant.x = next_pixel.x;

    return;
}

function antColonySimulator(canvas) {
    if(!anthillPixels.length) {
        alert("The spawn point is not set");
        return;
    }

    createColony(ants, 10000, anthillPixels);
    
    function simulate() {
        // Обновляем всех муравьев
        for (let i = 0; i < ants.length; ++i) {
            moveAnt(canvas, world, anthillPixels, pheromones, ants[i], 1, 20, 1000);
        }
        
        // Запуск анимации
        requestAnimationFrame(simulate);
    }
    
    simulate();


    return;
}








// Инициализация объектов мира
// const canvas = document.getElementById('mapCanvas');
let world = []; initWorld(world, canvas.height, canvas.width); //Матрица пикселей мира
let anthillPixels = []; // Координаты муравейника
let ants = []; // Муравьинная колония
let ant = {
    y: 0,
    x: 0,
    visited: new Set(),
    food: false,
}
let pheromones = new Map(); //Координаты - уровень феромоно. Храним феромоны, которые > min

// Параметры
let ALF = 1; // Параметр влияния феромонов
let P = 0.1; // Скорость испарения феромоно
let L = 400000000; // Длина оптимального путь
let A = 10; // Корректировка минимального порога феромонов

// Уровень феромонов
let max_pheromon_lvl = 1/(P * L);
let min_pheromon_lvl = max_pheromon_lvl / A;