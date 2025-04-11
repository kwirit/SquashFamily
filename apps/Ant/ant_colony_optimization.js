let world = []; initWorld(world, canvas.height, canvas.width); // Матрица пикселей(rgba) мира
let anthillPixels = []; // Массив с координатами муравейников
let colony = []; // Массив с муравьями
let phHome = new Map(); // JSON {y, x} - {lvl, direction}
let phFood = new Map(); // JSON {y, x} - {lvl, direction}


let MAX_PH_LVL = 1;
let MAX_PATH = 5000;
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

    getPos() {
        return {y:this.y, x:this.x};
    }
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

function checkAvailableBlocks(world, ant) {
    for(let y = ant.y - 1; y <= ant.y + 1; ++y) {
        for(let x = ant.x - 1; x <= ant.x + 1; ++x) {
            // Пропускаем не доступные клетки
            if((y < 0 || y > world.length - 1) || (x < 0 || x > world[y].length - 1) || 
            (getColorPixel(world[y][x]) == "grey") ||(y == ant.y && x == ant.x)) {
                continue;
            }

            return true;
        }
    }

    return false;
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

function markPH(phMap, ant) {
    let position = JSON.stringify(ant.getPos());
    let lvl = (1 - P) * (1 / ant.path);
    lvl = Math.max(MIN_PH_LVL, Math.min(MAX_PH_LVL, lvl));
    let direction = convertDeg(ant.direction + 180);

    if((phMap.has(position)) && (lvl <= phMap.get(position).lvl)) return;
    else phMap.set(position, {lvl, direction});

    return;
}

function processAnt(canvas, world, anthillPixels, phHome, phFood, ant, size_ant) {
    if(ant.path > MAX_PATH || !checkAvailableBlocks(world, ant)) {kill(canvas, world, anthillPixels, ant, size_ant); return;}

    let position = JSON.stringify(ant.getPos());
    if(ant.hungry && phFood.has(position)) {
        let new_direction = phFood.get(position).direction;
        ant.newDirection(new_direction);
    }
    else if(!ant.hungry && phHome.has(position)) {
        let new_direction = phHome.get(position).direction;
        ant.newDirection(new_direction);
    }

    // if (ant.hungry && phFood.has(position)) {
    //     let d = phFood.get(position).direction;
    //     let testPos = getNextPosition({ ...ant, direction: d }, 1);
    //     if (available(world, canvas.height, canvas.width, testPos)) {
    //         ant.newDirection(d);
    //     } else {
    //         phFood.delete(position); // тупик — удаляем феромон
    //     }
    // }
    // else if (!ant.hungry && phHome.has(position)) {
    //     let d = phHome.get(position).direction;
    //     let testPos = getNextPosition({ ...ant, direction: d }, 1);
    //     if (available(world, canvas.height, canvas.width, testPos)) {
    //         ant.newDirection(d);
    //     } else {
    //         phHome.delete(position); // тупик — удаляем феромон
    //     }
    // }

    mutationDirection(ant, 0.1, 30);

    let next_position = getNextPosition(ant, 1); // {y, x}

    // for(let i = 0;!available(world, canvas.height, canvas.width, next_position); ++i) {
    //     if(i > 3) {
    //         kill(canvas, world, anthillPixels, ant, size_ant);
    //         return;
    //     }

    //     let left = ant.direction - ant.direction % 180;
    //     let right = left + 180;
        
    //     ant.newDirection(convertDeg(getRandomInt(left + 180, right + 180)));
    //     next_position = getNextPosition(ant, 1);
    // }

    while(!available(world, canvas.height, canvas.width, next_position)) {
        // let left = ant.direction - ant.direction % 180;
        // let right = left + 180;
        
        ant.newDirection(convertDeg(getRandomInt(0, 360)));
        next_position = getNextPosition(ant, 1);
    }

    eraseAnt(canvas, world, ant, size_ant);
    
    ant.newPosition(next_position.x, next_position.y);
    ++ant.path;

    (ant.hungry ? markPH(phHome, ant) : markPH(phFood, ant));

    let color_pixel = getColorPixel(world[ant.y][ant.x]);
    if((color_pixel == "brown" && !ant.hungry) || (color_pixel == "green" && ant.hungry)) {
        ant.forgetPath();
        ant.hungry = (color_pixel == "green" ? false : true);
    }

    drawAnt(canvas, ant, size_ant, (ant.hungry ? "black" : "green"));

    return;
}

function vaporizePheromones(phMap) {
    const keys = Array.from(phMap.keys());
    for(let i = 0; i < keys.length; ++i) {
        let lvl = phMap.get(keys[i]).lvl * (1 - P);
        let direction = phMap.get(keys[i]).direction;
        phMap.set(keys[i], {lvl:(lvl > MAX_PH_LVL ? MAX_PH_LVL : lvl), direction:direction});
        if (lvl < MIN_PH_LVL) phMap.delete(keys[i]);
        else phMap.set(keys[i], {lvl: Math.min(lvl, MAX_PH_LVL), direction});

    }

    return;
}


function antColonySimulator(canvas) {
    if(!anthillPixels.length) {
        alert("The spawn point is not set");
        return;
    }

    initColony(colony, anthillPixels, 1000);
    
    let speedBoost = 5; // 1 = нормально, 10 = очень быстро

    let count = 0;

    function simulate() {
        // Обновляем логику несколько раз за кадр
        for (let i = 0; i < speedBoost; i++) {
            for (let ant of colony) {
                processAnt(canvas, world, anthillPixels, phHome, phFood, ant, 3);
            }
        }
        
        ++count;
        if(count == 100) {
            vaporizePheromones(phHome, P * count);
            vaporizePheromones(phFood, P * count);
            count = 0;
        }
        
        requestAnimationFrame(simulate);
    }

    simulate();
    return;
}