let world = []; initWorld(world, canvas.height, canvas.width); // Матрица пикселей(rgba) мира
let anthillPixels = new Set(); // JSON {y, x}
let food = new Map(); // JSON {y, x} - satiety
let colony = []; // Массив с муравьями
let phHome = new Map(); // JSON {y, x} - {lvl, direction}
let phFood = new Map(); // JSON {y, x} - {lvl, direction}

// Феромоны
let MAX_PH_LVL = 1; // Максимальный порог феромона
let SUSTAINABILITY = 100; // Устойчивость феромонов
let MIN_PH_LVL = MAX_PH_LVL / SUSTAINABILITY; // Минимальный порог феромонов

// Испарение
let EVAPARATION_RATE = 100; // Скорость испарения феромонов
let P = 0.1; // Сила испарения феромонов

// Решение муравья
let ALF = 3; // Приоритет нового пути
let PROBABILITY_OF_REJECTION = 0.1; // Вероятность отклонения
let DEFLECTION_FORCE = 30; // Сила отклонения
let PROBABILITY_OF_ERROR = 0.1; // Вероятность ошибки

// Колония
let MODEL_SIZE = 1; // Размер модельки
let COUNT_ANTS = 2000; // Кол-во муравьёв
let MAX_PATH = 2000; // Максимально разрешённый пройденный путь муравья

// Еда
let SATIETY = 0; // Сытноссть еды, 0 - бесконечная еда

// Анимация
let SPEED_BOOST = 10; // Частота отрисовки



// Обработчики событий
document.getElementById('MAX_PH_LVL').addEventListener('change', function() {
    MAX_PH_LVL = parseInt(this.value);
    MIN_PH_LVL = MAX_PH_LVL / SUSTAINABILITY;
});

document.getElementById('SUSTAINABILITY').addEventListener('change', function() {
    SUSTAINABILITY = parseInt(this.value);
    MIN_PH_LVL = MAX_PH_LVL / SUSTAINABILITY;
});
document.getElementById('EVAPARATION_RATE').addEventListener('change', function() {EVAPARATION_RATE = parseInt(this.value);})
document.getElementById('P').addEventListener('change', function() {P = parseFloat(this.value);})
document.getElementById('ALF').addEventListener('change', function() {ALF = parseInt(this.value);})
document.getElementById('PROBABILITY_OF_REJECTION').addEventListener('change', function() {PROBABILITY_OF_REJECTION = parseFloat(this.value);})
document.getElementById('DEFLECTION_FORCE').addEventListener('change', function() {DEFLECTION_FORCE = parseInt(this.value);})
document.getElementById('PROBABILITY_OF_ERROR').addEventListener('change', function() {PROBABILITY_OF_ERROR = parseFloat(this.value);})
document.getElementById('MODEL_SIZE').addEventListener('change', function() {MODEL_SIZE = parseFloat(this.value);})
document.getElementById('COUNT_ANTS').addEventListener('change', function() {COUNT_ANTS = parseInt(this.value);})
document.getElementById('MAX_PATH').addEventListener('change', function() {MAX_PATH = parseInt(this.value);})
document.getElementById('SATIETY').addEventListener('change', function() {SATIETY = parseInt(this.value);})
document.getElementById('SPEED_BOOST').addEventListener('change', function() {SPEED_BOOST = parseInt(this.value);})



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

function initColony(colony, anthillPixels, count_ants) {
    const keys = Array.from(anthillPixels);
    for(let i = 0; i < count_ants; ++i) {
        let ant_position = JSON.parse(keys[getRandomInt(0, keys.length - 1)]);
        let ant_direction = getRandomInt(1, 360);
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
            (getColorPixel(world[y][x]) == "grey") || (y == ant.y && x == ant.x)) {
                continue;
            }

            return true;
        }
    }

    return false;
}

function kill(canvas, world, anthillPixels, ant, size_ant) {
    eraseAnt(canvas, world, ant, size_ant);

    const keys = Array.from(anthillPixels);
    if(anthillPixels.size > 0) {
        let new_position = JSON.parse(keys[getRandomInt(0, keys.length - 1)]);
        let new_direction = getRandomInt(0, 360);

        ant.newPosition(new_position.x, new_position.y);
        ant.newDirection(new_direction);
        ant.forgetPath();
        
        drawAnt(canvas, ant, size_ant, "black");
    }

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
        ant.direction = (p < probability/2 ? rotate(ant.direction, -degree) : rotate(ant.direction, degree));
    }
    return;
}

function getNextPosition(position, direction, length_jump) {
    // Получаем новые координаты в полярной системе координат
    let x = position.x + length_jump * Math.cos(degToRad(direction));
    let y = position.y + length_jump * Math.sin(degToRad(direction));
    
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
    lvl = Math.min(MAX_PH_LVL, lvl);
    let direction = convertDeg(ant.direction + 180);

    if((phMap.has(position)) && (lvl <= phMap.get(position).lvl)) return;
    else phMap.set(position, {lvl, direction});

    return;
}

function bounceAnt(ant, spread = 60) {
    
    let opposite = convertDeg(ant.direction + 180);
    
    let lowerBound = Math.round(opposite - spread / 2);
    let upperBound = Math.round(opposite + spread / 2);
    
    let newDir = getRandomInt(lowerBound, upperBound);
    ant.newDirection(convertDeg(newDir));
}

function processAnt(canvas, world, anthillPixels, food, phHome, phFood, ant, size_ant) {
    if(ant.path > MAX_PATH) {kill(canvas, world, anthillPixels, ant, size_ant); return;}

    let position = JSON.stringify(ant.getPos());
    let error = Math.random();
    if(ant.hungry && phFood.has(position) && error > PROBABILITY_OF_ERROR) {
        let new_direction = phFood.get(position).direction;
        let new_position = getNextPosition(ant.getPos(), new_direction, 1);
        if(available(world, canvas.height, canvas.width, new_position)) ant.newDirection(new_direction);
    }
    else if(!ant.hungry && phHome.has(position) && error > PROBABILITY_OF_ERROR) {
        let new_direction = phHome.get(position).direction;
        let new_position = getNextPosition(ant.getPos(), new_direction, 1);
        if(available(world, canvas.height, canvas.width, new_position)) ant.newDirection(new_direction);
    }

    mutationDirection(ant, PROBABILITY_OF_REJECTION, DEFLECTION_FORCE);

    let next_position = getNextPosition(ant.getPos(), ant.direction, 1); // {y, x}

    while(!available(world, canvas.height, canvas.width, next_position)) {
        if(!checkAvailableBlocks(world, ant)) {kill(canvas, world, anthillPixels, ant, size_ant); return;}
        bounceAnt(ant, 90);
        next_position = getNextPosition(ant.getPos(), ant.direction, 1);
    }

    eraseAnt(canvas, world, ant, size_ant);

    ant.newPosition(next_position.x, next_position.y);
    ++ant.path;

    (ant.hungry ? markPH(phHome, ant) : markPH(phFood, ant));

    position = JSON.stringify(ant.getPos());
    if((anthillPixels.has(position)) || (food.has(position))) {
        ant.hungry = (food.has(position) ? false : true);
        ant.forgetPath();
        if(SATIETY > 0 && food.has(position)) {
            let new_satiety = food.get(position) - 1;
            if(new_satiety > 0) {
                food.set(position, new_satiety);
            }
            else {
                food.delete(position);
                let ctx = canvas.getContext("2d");
                ctx.fillStyle = "white";
                ctx.fillRect(ant.x * 1, ant.y * 1, 1, 1);
                world[ant.y][ant.x] = createPixelColor("white");
            }
        }
    }

    drawAnt(canvas, ant, size_ant, (ant.hungry ? "brown" : "green"));

    return;
}

function vaporizePheromones(phMap) {
    const keys = Array.from(phMap.keys());
    for(let i = 0; i < keys.length; ++i) {
        let lvl = phMap.get(keys[i]).lvl * (1 - P);
        lvl = (lvl > MAX_PH_LVL ? MAX_PH_LVL : lvl);

        let direction = phMap.get(keys[i]).direction;
        
        if(lvl > MIN_PH_LVL) phMap.set(keys[i], {lvl, direction});
        else phMap.delete(keys[i]);
    }

    return;
}


function antColonySimulator(canvas) {
    if(anthillPixels.size <= 0) {
        alert("The spawn point is not set");
        return;
    }
    else if(START) {
        alert("The colony has already been established");
        return;
    }

    START = true;
    initColony(colony, anthillPixels, COUNT_ANTS);
    
    let count = 0;

    function simulate() {
        // Обновляем логику несколько раз за кадр
        for (let i = 0; i < SPEED_BOOST; i++) {
            for (let ant of colony) {
                processAnt(canvas, world, anthillPixels, food, phHome, phFood, ant, MODEL_SIZE);
            }
            ++count;
        }

        if(count == EVAPARATION_RATE) {
            vaporizePheromones(phHome);
            vaporizePheromones(phFood);
            count = 0;
        }
        
        requestAnimationFrame(simulate);
    }

    simulate();
    return;
}