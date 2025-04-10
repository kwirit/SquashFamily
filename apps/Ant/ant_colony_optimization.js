let world = []; initWorld(world, canvas.height, canvas.width); // Матрица пикселей(rgba) мира
let anthillPixels = []; // Массив с координатами муравейников
let colony = []; // Массив с муравьями
let phHome = new Map(); // JSON {y, x} - lvl
let phFood = new Map(); // JSON {y, x} - lvl


let MAX_PH_LVL = 1;
let MAX_PATH = 1000;
let MIN_PH_LVL = MAX_PH_LVL / MAX_PATH;
let P = 0.1;
let ALF = 3;


// Муравей
class Ant {
    x;
    y;
    direction;
    hungry;
    path;

    constructor(x = 0, y = 0, direction = 0, hungry = true) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.hungry = hungry;
        this.path = 1;
    }

    newDirection(newDirection) {
        this.direction = newDirection;
    }

    newPosition(new_x, new_y) {
        this.x = new_x;
        this.y = new_y;
    }

    forgetPath() {
        this.path = 1;
    }

    // getPos() {
    //     return {y:this.ant.y, x:this.ant.x};
    // }
};




function initWorld(worldMatrix, height, width) {
    for(let i = 0; i < height; ++i) {
        let row = [];
        for(let j = 0; j < width; ++j) {
            let pixel = createPixelRGBA(255, 255, 255, 255); // Белый пиксель
            row.push(pixel);
        }
        worldMatrix.push(row);
    }

    return;
}

function degToRad(deg) {
    return deg * Math.PI / 180;
}
  
function radToDeg(rad) {
    return rad * 180 / Math.PI;
}

function getRandomInt(min, max) {
    if (min > max) [min, max] = [max, min]; // Меняем местами, если нужно
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function initColony(colony, anthill, count_ants) {
    for(let i = 0; i < count_ants; ++i) {
        let ant_position = anthill[getRandomInt(0, anthill.length - 1)];
        let ant_direction = getRandomInt(0, 360);
        let ant = new Ant(ant_position.x, ant_position.y, ant_direction, true);
        colony.push(ant);
    }
    return;
}

function drawAnt(canvas, ant, size_ant, color_ant) {
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = color_ant;
    ctx.fillRect(ant.x, ant.y, size_ant, size_ant);
    return;
}

function eraseAnt(canvas, worldMatrix, ant, size_ant) {
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = getColorPixel(worldMatrix[ant.y][ant.x]);
    ctx.fillRect(ant.x, ant.y, size_ant, size_ant);
}

function searchPhFood(phFood, ar_cells) {
    let pheromone_food = [];
    for(let i = 0; i < ar_cells.length; ++i) {
        let position = JSON.stringify(ar_cells[i]);
        if(phFood.has(position)) {
            let lvl = phFood.get(position);
            pheromone_food.push({y:ar_cells[i].y, x:ar_cells[i].x, lvl:lvl});
        }
        // else {
        //     pheromone_food.push({y:ar_cells[i].y, x:ar_cells[i].x, lvl:MIN_PH_LVL});
        // }
    }

    return pheromone_food;
}

function searchPhHome(phHome, ar_cells) {
    let pheromone_home = [];
    for(let i = 0; i < ar_cells.length; ++i) {
        let position = JSON.stringify(ar_cells[i]);
        if(phHome.has(position)) {
            let lvl = phHome.get(position);
            pheromone_home.push({y:ar_cells[i].y, x:ar_cells[i].x, lvl:lvl});
        }
        // else {
        //     pheromone_home.push({y:ar_cells[i].y, x:ar_cells[i].x, lvl:MIN_PH_LVL});
        // }
    }

    return pheromone_home;
}

function getReverseBlock(ant, length_jump) {
    let reverse_direction = convertDeg(ant.direction + 180);
    
    let x = ant.x + length_jump * Math.cos(degToRad(reverse_direction));
    let y = ant.y + length_jump * Math.sin(degToRad(reverse_direction));
    
    
    x = Math.round(x);
    y = Math.round(y);
    
    return {y:y, x:x};
}

function getAvailableCells(world, ant) {
    let result = [];
    let reverse_block = getReverseBlock(ant, 1);
    for(let y = ant.y - 1; y <= ant.y + 1; ++y) {
        for(let x = ant.x - 1; x <= ant.x + 1; ++x) {
            // Пропускаем не доступные клетки
            if((y < 0 || y > world.length - 1) || (x < 0 || x > world[y].length - 1) || 
            (getColorPixel(world[y][x]) == "grey") ||(y == ant.y && x == ant.x) || 
            ((y == reverse_block.y) && (x == reverse_block.x))) {
                continue;
            }

            result.push({y:y, x:x});
        }
    }

    return result;
}

function kill(canvas, world, anthillPixels, ant, size_ant) {
    let new_position = anthillPixels[getRandomInt(0, anthillPixels.length - 1)];
    let new_direction = getRandomInt(0, 360);

    eraseAnt(canvas, world, ant, size_ant);

    ant.newPosition(new_position.x, new_position.y);
    ant.newDirection(new_direction);
    ant.forgetPath();
    
    return;
}

// // Fitness proportionate selection
// function FPS(ar_pheromone, probability_max) {
//     let ar_ph = structuredClone(ar_pheromone);

//     let sum = 0;
//     let index_max = -1;
    
//     // Находим суммарный вес фитнесов
//     for(let i = 0, max = -Infinity; i < ar_ph.length; ++i) {
//         if(ar_ph[i].lvl > max) {
//             index_max = i;
//             max = ar_ph[i].lvl;
//         }
//         sum += ar_ph[i].lvl;
//     }

//     sum -= ar_ph[index_max].lvl * (1 - probability_max);

//     // Нормализуем фитнесы, с учётом искуственной подкрутки вероятности
//     for(let i = 0; i  < ar_ph.length; ++i) {
//         if(i == index_max) ar_ph[i].lvl = ar_ph[i].lvl / sum * probability_max;
//         else ar_ph[i].lvl = ar_ph[i].lvl / sum * (1 - probability_max);
//     }

//     let ptr = Math.random();
//     let i = -1;
//     sum = 0;
//     while((i < ar_ph.length - 1) && (sum < ptr)) {
//         ++i;
//         sum += ar_ph[i].lvl;
//     }

//     return {y:ar_ph[i].y, x:ar_ph[i].x};
// }

// Fitness proportionate selection
function FPS(ar_pheromone) {
    let ar_ph = structuredClone(ar_pheromone);

    let sum = 0;
    
    // Находим суммарный вес фитнесов
    for(let i = 0; i < ar_ph.length; ++i) {
        ar_ph[i].lvl = Math.pow((ar_ph[i].lvl), ALF);
        sum += ar_ph[i].lvl;
    }

    // Нормализуем фитнесы
    for(let i = 0; i  < ar_ph.length; ++i) {
        ar_ph[i].lvl /= sum;
    }

    let ptr = Math.random();
    let i = -1;
    sum = 0;
    while((i < ar_ph.length - 1) && (sum < ptr)) {
        ++i;
        sum += ar_ph[i].lvl;
    }

    return {y:ar_ph[i].y, x:ar_ph[i].x};
}

function getDirection(pointA, pointB) {
    return radToDeg(Math.atan2(pointB.y - pointA.y, pointB.x - pointA.x));
}

function convertDeg(degree) {
    return ((degree % 360) + 360) % 360;
}

function rotate(alf, bet) {
    let result = alf + bet;
    
    return convertDeg(result);
}

function mutationDirection(ant, probability, degree) {
    let p = Math.random();
    if(p <= probability) {
        ant.direction = (p <= probability/2 ? rotate(ant.direction, -degree) : rotate(ant.direction, degree));
    }
    return;
}

function getNextPosition(ant, length_jump) {
    // Получаем новые координаты в полярной системе координат
    let x = ant.x + length_jump * Math.cos(degToRad(ant.direction));
    let y = ant.y + length_jump * Math.sin(degToRad(ant.direction));
    
    // Округляем до целого исла
    x = Math.round(x);
    y = Math.round(y);
    
    return {y:y, x:x};
}

function available(world, height, width, position) {
    if((position.y < 0 || position.y > height - 1) || 
    (position.x < 0 || position.x > width - 1) || 
    (getColorPixel(world[position.y][position.x]) == "grey")) {
        return false;
    }

    return true;
}

function markPhHome(phHome, ant) {
    let position = JSON.stringify({y:ant.y, x:ant.x});
    if(phHome.has(position)) {
        let lvl = phHome.get(position) + (1 - P) * (1/ant.path);
        phHome.set(position, (lvl < MAX_PH_LVL ? lvl : MAX_PH_LVL));
    }
    else {
        let lvl = (1 - P) * (1/ant.path);
        phHome.set(position, lvl);
    }
    
    return;
    // if(phHome.has(ant.y)) {
    //     if(phHome.get(ant.y).has(ant.x)) {
    //         let ph_lvl = phHome.get(ant.y).get(ant.x) + 1/ant.path;
    //         phHome.get(ant.y).set(ant.x, (ph_lvl < MAX_PH_LVL) ? ph_lvl : MAX_PH_LVL);
    //     }
    //     else {
    //         phHome.get(ant.y).set(ant.x, 1/ant.path);
    //     }
    // }
    // else {
    //     phHome.set(ant.y, new Map());
    //     phHome.get(ant.y).set(ant.x, 1/ant.path);
    // }
    // return;
}

function markPhFood(phFood, ant) {
    let position = JSON.stringify({y:ant.y, x:ant.x});
    if(phFood.has(position)) {
        let lvl = phFood.get(position) + (1 - P) * (1/ant.path);
        phFood.set(position, (lvl < MAX_PH_LVL ? lvl : MAX_PH_LVL));
    }
    else {
        let lvl = (1 - P) * (1/ant.path);
        phFood.set(position, lvl);
    }
    
    return;
    // if(phFood.has(ant.y)) {
    //     if(phFood.get(ant.y).has(ant.x)) {
    //         let ph_lvl = phFood.get(ant.y).get(ant.x) + 1/ant.path;
    //         phFood.get(ant.y).set(ant.x, (ph_lvl < MAX_PH_LVL) ? ph_lvl : MAX_PH_LVL);
    //     }
    //     else {
    //         phFood.get(ant.y).set(ant.x, 1/ant.path);
    //     }
    // }
    // else {
    //     phFood.set(ant.y, new Map());
    //     phFood.get(ant.y).set(ant.x, 1/ant.path);
    // }
    // return;
}

function processAnt(canvas, world, anthillPixels, phHome, phFood, ant, max_path, size_ant) {

    let availableCells = getAvailableCells(world, ant); // {y, x}

    // if(availableCells.length == 0 || ant.path > max_path) {
    //     kill(canvas, world, anthillPixels, ant, size_ant);
    //     return;
    // }

    // Исследуем местность на ниличие феромонов нужного типа
    let pheromones = []; // {y, x, lvl}

    if(ant.hungry) pheromones = searchPhFood(phFood, availableCells); 
    else pheromones = searchPhHome(phHome, availableCells);

    if(pheromones.length > 0) {
        let next_position = FPS(pheromones); // {y, x}
        let current_position = {y:ant.y, x:ant.x};
        ant.newDirection(getDirection(current_position, next_position));
    }
    
    // Пробуем мутировать вектор на 30 градусов с вероятностью 0.1
    mutationDirection(ant, 0.05, 30);

    let next_position = getNextPosition(ant, 1); // {y, x}
    
    while(!available(world, canvas.height, canvas.width, next_position)) {
        let left = ant.direction - ant.direction % 180;
        let right = left + 180;
        
        ant.newDirection(convertDeg(getRandomInt(left + 180, right + 180)));
        next_position = getNextPosition(ant, 1);
    }

    // Муравей прыгает на новую клетку
    eraseAnt(canvas, world, ant, size_ant);
    ant.newPosition(next_position.x, next_position.y);
    ++ant.path;
    (ant.hungry ? markPhHome(phHome, ant) : markPhFood(phFood, ant));
    
    let color_pixel = getColorPixel(world[ant.y][ant.x]);
    if((color_pixel == "brown") || (color_pixel == "green")) {
        if((color_pixel == "green") && (ant.hungry)) {
            ant.newDirection(convertDeg(ant.direction + 180));
        }
        else if((color_pixel == "brown") && (!ant.hungry)) {    
            ant.newDirection(convertDeg(ant.direction + 180));
        }

        ant.forgetPath();
        ant.hungry = (color_pixel == "green" ? false : true);
    }

    drawAnt(canvas, ant, size_ant, (ant.hungry ? "black" : "green"));

    return;
}

// function vaporizePheromones(map2d, p) {
//     const keys = Array.from(map2d.keys()); //map1d
//     for(let i = 0; i < keys.length; ++i) {
//         let map = map2d.get(keys[i]);
//         const keys_map = Array.from(map.keys());

//         for(let j = 0; j < keys_map.length; ++j) {
//             let ph_lvl = map.get(keys_map[j]) * (1 - p);
//             if(ph_lvl < MIN_PH_LVL) {
//                 map.delete(keys_map[j]);
//             }
//             else {
//                 map.set(keys_map[j], ph_lvl);
//             }
//         }
//     }
//     return;
// }

function vaporizePheromones(map, p) {
    const keys = Array.from(map.keys());
    for (let i = 0; i < keys.length; ++i) {
        const key = keys[i];
        let lvl = map.get(key) * (1 - p); // Испарение
        
        // Ограничение снизу и сверху
        lvl = Math.max(lvl, MIN_PH_LVL);  // Не опускается ниже MIN_PH_LVL
        lvl = Math.min(lvl, MAX_PH_LVL);  // Не превышает MAX_PH_LVL
        // if(lvl > MIN_PH_LVL) {
        //     map.set(key, (lvl > MAX_PH_LVL ? MAX_PH_LVL : lvl));
        // }
        // else {
        //     map.delete(key);
        // }
        map.set(key, lvl);
    }
    return;
}


function antColonySimulator(canvas) {
    if(!anthillPixels.length) {
        alert("The spawn point is not set");
        return;
    }

    initColony(colony, anthillPixels, 1);
    
    let speedBoost = 1; // 1 = нормально, 10 = очень быстро

    function simulate() {
        // Обновляем логику несколько раз за кадр
        for (let i = 0; i < speedBoost; i++) {
            for (let ant of colony) {
                processAnt(canvas, world, anthillPixels, phHome, phFood, ant, MAX_PATH, 2);
            }
            vaporizePheromones(phHome, P);
            vaporizePheromones(phFood, P);
        }
        
        requestAnimationFrame(simulate);
    }

    simulate();
    return;
}








// let world = []; initWorld(world, canvas.height, canvas.width); // {r, g, b, a}
// let anthillPixels = []; // {y, x}
// let colony = []; // {y, x}
// let phHome = new Map(); // {y, x} - {lvl}
// let phFood = new Map(); // {y, x} - {lvl}


// let MAX_PH_LVL = 1;
// let MAX_PATH = 1000;
// let MIN_PH_LVL = MAX_PH_LVL / MAX_PATH;
// let P = 0.01;


// // Муравей
// class Ant {
//     x;
//     y;
//     direction;
//     hungry;
//     path;

//     constructor(x = 0, y = 0, direction = 0, hungry = true) {
//         this.x = x;
//         this.y = y;
//         this.direction = direction;
//         this.hungry = hungry;
//         // this.path = 1;
//         this.path = new Set();
//     }

//     newDirection(newDirection) {
//         this.direction = newDirection;
//     }

//     newPosition(new_x, new_y) {
//         this.x = new_x;
//         this.y = new_y;
//     }

//     forgetPath() {
//         // this.path = 1;
//         this.path.clear();
//     }
// };




// function initWorld(worldMatrix, height, width) {
//     for(let i = 0; i < height; ++i) {
//         let row = [];
//         for(let j = 0; j < width; ++j) {
//             let pixel = createPixelRGBA(255, 255, 255, 255); // Белый пиксель
//             row.push(pixel);
//         }
//         worldMatrix.push(row);
//     }

//     return;
// }

// function degToRad(deg) {
//     return deg * Math.PI / 180;
// }
  
// function radToDeg(rad) {
//     return rad * 180 / Math.PI;
// }

// function getRandomInt(min, max) {
//     if (min > max) [min, max] = [max, min]; // Меняем местами, если нужно
//     return Math.floor(Math.random() * (max - min + 1)) + min;
// }

// function initColony(colony, anthill, count_ants) {
//     for(let i = 0; i < count_ants; ++i) {
//         let ant_position = anthill[getRandomInt(0, anthill.length - 1)];
//         let ant_direction = getRandomInt(0, 360);
//         let ant = new Ant(ant_position.x, ant_position.y, ant_direction, true);
//         colony.push(ant);
//     }
//     return;
// }

// function drawAnt(canvas, ant, size_ant, color_ant) {
//     let ctx = canvas.getContext("2d");
//     ctx.fillStyle = color_ant;
//     ctx.fillRect(ant.x, ant.y, size_ant, size_ant);
//     return;
// }

// function eraseAnt(canvas, worldMatrix, ant, size_ant) {
//     let ctx = canvas.getContext("2d");
//     ctx.fillStyle = getColorPixel(worldMatrix[ant.y][ant.x]);
//     ctx.fillRect(ant.x, ant.y, size_ant, size_ant);
// }

// function searchPhFood(phFood, ar_cells) {
//     let pheromone_food = [];
//     for(let i = 0; i < ar_cells.length; ++i) {
//         let position = JSON.stringify(ar_cells[i]);
//         if(phFood.has(position)) {
//             let lvl = phFood.get(position);
//             pheromone_food.push({y:position.y, x:position.x, lvl:lvl});
//         }
//     }

//     return pheromone_food;
// }

// function searchPhHome(phHome, ar_cells) {
//     let pheromone_home = [];
//     for(let i = 0; i < ar_cells.length; ++i) {
//         let position = JSON.stringify(ar_cells[i]);
//         if(phHome.has(position)) {
//             let lvl = phHome.get(position);
//             pheromone_home.push({y:position.y, x:position.x, lvl:lvl});
//         }
//     }

//     return pheromone_home;
// }

// function getAvailableCells(world, ant) {
//     let result = [];
//     for(let y = ant.y - 1; y <= ant.y + 1; ++y) {
//         for(let x = ant.x - 1; x <= ant.x + 1; ++x) {
//             // Пропускаем не доступные клетки
//             if((y < 0 || y > world.length - 1) || (x < 0 || x > world[y].length - 1) || 
//             (getColorPixel(world[y][x]) == "grey") ||(y == ant.y && x == ant.x) || 
//             (ant.path.has(JSON.stringify({y:y, x:x})))) {
//                 continue;
//             }

//             result.push({y:y, x:x});
//         }
//     }

//     return result;
// }

// function kill(canvas, world, anthillPixels, ant, size_ant) {
//     let new_position = anthillPixels[getRandomInt(0, anthillPixels.length - 1)];
//     let new_direction = getRandomInt(0, 360);

//     eraseAnt(canvas, world, ant, size_ant);

//     ant.newPosition(new_position.x, new_position.y);
//     ant.newDirection(new_direction);
//     ant.forgetPath();
    
//     return;
// }

// // Fitness proportionate selection
// function FPS(ar_pheromone, probability_max) {
//     let ar_ph = structuredClone(ar_pheromone);

//     let sum = 0;
//     let index_max = -1;
    
//     // Находим суммарный вес фитнесов
//     for(let i = 0, max = -Infinity; i < ar_ph.length; ++i) {
//         if(ar_ph[i].lvl > max) {
//             index_max = i;
//             max = ar_ph[i].lvl;
//         }
//         sum += ar_ph[i].lvl;
//     }

//     sum -= ar_ph[index_max].lvl * (1 - probability_max);

//     // Нормализуем фитнесы, с учётом искуственной подкрутки вероятности
//     for(let i = 0; i  < ar_ph.length; ++i) {
//         if(i == index_max) ar_ph[i].lvl = ar_ph[i].lvl / sum * probability_max;
//         else ar_ph[i].lvl = ar_ph[i].lvl / sum * (1 - probability_max);
//     }

//     let ptr = Math.random();
//     let i = -1;
//     sum = 0;
//     while((i < ar_ph.length - 1) && (sum < ptr)) {
//         ++i;
//         sum += ar_ph[i].lvl;
//     }

//     return {y:ar_ph[i].y, x:ar_ph[i].x};
// }

// function getDirection(pointA, pointB) {
//     return radToDeg(Math.atan2(pointB.y - pointA.y, pointB.x - pointA.x));
// }

// function convertDeg(degree) {
//     return ((degree % 360) + 360) % 360;
// }

// function rotate(alf, bet) {
//     let result = alf + bet;

//     return convertDeg(result);
// }

// function mutationDirection(ant, probability, degree) {
//     let p = Math.random();
//     if(p <= probability) {
//         ant.direction = (p <= probability/2 ? rotate(ant.direction, -degree) : rotate(ant.direction, degree));
//     }
//     return;
// }

// function getNextPosition(ant, length_jump) {
//     // Получаем новые координаты в полярной системе координат
//     let x = ant.x + length_jump * Math.cos(degToRad(ant.direction));
//     let y = ant.y + length_jump * Math.sin(degToRad(ant.direction));
    
//     // Округляем до целого исла
//     x = Math.round(x);
//     y = Math.round(y);
    
//     return {y:y, x:x};
// }

// function available(world, height, width, position) {
//     if((position.y < 0 || position.y > height - 1) || 
//     (position.x < 0 || position.x > width - 1) || 
//     (getColorPixel(world[position.y][position.x]) == "grey")) {
//         return false;
//     }

//     return true;
// }


// function markPhHome(phHome, ant, position) {
//     // position = JSON.stringify(position);
//     if(phHome.has(position)) {
//         let lvl = phHome.get(position);
//         lvl += 1/ant.path.size;
//         phHome.set(position, lvl);
//     }
//     else {
//         phHome.set(position, 1/ant.path.size);
//     }

//     return;
// }

// function updatePhHome(phHome, ant) {
//     const items = Array.from(ant.path);
//     for(let i = 0; i < items.length; ++i) {
//         markPhHome(phHome, ant, items[i]);
//     }
    
//     return;
// }

// function markPhFood(phFood, ant, position) {
//     // position = JSON.stringify(position);
//     if(phFood.has(position)) {
//         let lvl = phFood.get(position);
//         lvl += 1/ant.path.size;
//         phFood.set(position, lvl);
//     }
//     else {
//         phFood.set(position, 1/ant.path.size);
//     }

//     return;
// }

// function updatePhFood(phFood, ant) {
//     const items = Array.from(ant.path);
//     for(let i = 0; i < items.length; ++i) {
//         markPhFood(phFood, ant, items[i]);
//     }
    
//     return;
// }

// function processAnt(canvas, world, anthillPixels, phHome, phFood, ant, max_path, size_ant) {
//     let availableCells = getAvailableCells(world, ant); // {y, x}

//     if(availableCells.length == 0 || ant.path.size > max_path) {
//         kill(canvas, world, anthillPixels, ant, size_ant);
//         return;
//     }

//     // Исследуем местность на ниличие феромонов нужного типа
//     let pheromones = []; // {y, x, lvl}

//     if(ant.hungry) pheromones = searchPhFood(phFood, availableCells); 
//     else pheromones = searchPhHome(phHome, availableCells);

//     if(pheromones.length > 0) {
//         let next_position = FPS(pheromones, 0.95); // {y, x}
//         let current_position = {y:ant.y, x:ant.x};
//         ant.newDirection(getDirection(current_position, next_position));
//     }
    
//     // Пробуем мутировать вектор на 30 градусов с вероятностью 0.1
//     mutationDirection(ant, 0.05, 30);

//     let next_position = getNextPosition(ant, 1); // {y, x}
    
//     while(!available(world, canvas.height, canvas.width, next_position)) {
//         let left = ant.direction - ant.direction % 180;
//         let right = left + 180;
        
//         ant.newDirection(convertDeg(getRandomInt(left + 180, right + 180)));
//         next_position = getNextPosition(ant, 1);
//     }

//     // Муравей прыгает на новую клетку
//     eraseAnt(canvas, world, ant, (ant.hungry ? size_ant : size_ant - size_ant/2));
//     ant.newPosition(next_position.x, next_position.y);
    
//     ant.path.add(JSON.stringify(next_position));
    
    
//     let color_pixel = getColorPixel(world[ant.y][ant.x]);
//     if((color_pixel == "brown") || (color_pixel == "green")) {
//         if((color_pixel == "green") && (ant.hungry)) {
//             updatePhHome(phHome, ant);
//             // ant.newDirection(convertDeg(ant.direction + 180));
//         }
//         else if((color_pixel == "brown") && (!ant.hungry)) {
//             updatePhFood(phFood, ant);
//             // ant.newDirection(convertDeg(ant.direction + 180));
//         }

//         ant.forgetPath();
//         ant.hungry = (color_pixel == "green" ? false : true);
//     }

//     drawAnt(canvas, ant, size_ant, (ant.hungry ? "black" : "green"));

//     return;
// }

// function vaporizePheromones(map, p) {
//     const keys = Array.from(map.keys()); // {y, x}
//     for(let i = 0; i < keys.length; ++i) {
//         let lvl = map.get(keys[i]) * (1 - p);
//         map.set(keys[i], lvl);
//     }
//     return;
// }


// function antColonySimulator(canvas) {
//     if(!anthillPixels.length) {
//         alert("The spawn point is not set");
//         return;
//     }

//     initColony(colony, anthillPixels, 100);
    
//     let speedBoost = 1; // 1 = нормально, 10 = очень быстро

//     function simulate() {
//         // Обновляем логику несколько раз за кадр
//         for (let i = 0; i < speedBoost; i++) {
//             for (let ant of colony) {
//                 processAnt(canvas, world, anthillPixels, phHome, phFood, ant, MAX_PATH, 3);
//             }
//             vaporizePheromones(phHome, P);
//             vaporizePheromones(phFood, P);
//         }
        
//         requestAnimationFrame(simulate);
//     }

//     simulate();
//     return;
// }

