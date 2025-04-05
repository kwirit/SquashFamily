
let world = []; initWorld(world, canvas.height, canvas.width); // Матрица пикселей(rgba) мира
let anthillPixels = []; // Массив с координатами муравейников
let colony = []; // Массив с муравьями
let phHome = new Map(); // Двумерная Map-а с уровнем феромонов дома
let phFood = new Map(); // Двумерная Map-а с уровнем феромонов еды


let MAX_PH_LVL = 1;
let MAX_PATH = 10000;
let MIN_PH_LVL = MAX_PH_LVL / MAX_PATH;
let P = 0.3;


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
        let ant_direction = getRandomInt(-180, 180);
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

function searchPhFood(world, phFood, ant, ar) {
    let free_cells = false;
    for(let y = ant.y - 1; y < ant.y + 1; ++y) {
        for(let x = ant.x - 1; x < ant.x + 1; ++x) {
            // Пропускаем не доступные клетки
            if((y < 0 || y > world.length - 1) || (x < 0 || x > world[y].length - 1) || 
            (getColorPixel(world[y][x]) == "grey") ||(y == ant.y && x == ant.x)) {
                continue;
            }
        
            free_cells = true;
            if(phFood.has(ant.y) && phFood.get(ant.y).has(ant.x)) {
                let lvl = phFood.get(ant.y).get(ant.x);
                ar.push({y:y, x:x, lvl:lvl});
            }
        }
    }
    return free_cells;
}

function searchPhHome(world, phHome, ant, ar) {
    let free_cells = false;
    for(let y = ant.y - 1; y < ant.y + 1; ++y) {
        for(let x = ant.x - 1; x < ant.x + 1; ++x) {
            // Пропускаем не доступные клетки
            if((y < 0 || y > world.length - 1) || (x < 0 || x > world[y].length - 1) || 
            (getColorPixel(world[y][x]) == "grey") ||(y == ant.y && x == ant.x)) {
                continue;
            }
            
            free_cells = true;
            if(phHome.has(ant.y) && phHome.get(ant.y).has(ant.x)) {
                let lvl = phHome.get(ant.y).get(ant.x);
                ar.push({y:y, x:x, lvl:lvl});
            }
        }
    }
    return free_cells;
}

function kill(anthillPixels, ant) {
    let new_position = anthillPixels[getRandomInt(0, anthillPixels.length - 1)];
    let new_direction = getRandomInt(-180, 180);

    ant.newPosition(new_position.x, new_position.y);
    ant.newDirection(new_direction);
    ant.forgetPath();

    return;
}

// Fitness proportionate selection
function FPS(ar_ph, probability_max) {
    let sum = 0;
    let index_max = 0;
    let max_lvl = -1;
    for(let i = 0; i < ar_ph.length; ++i) {
        if(ar_ph[i].lvl > max_lvl) {
            index_max = i;
            max_lvl = ar_ph[i].lvl;
        }
        sum += ar_ph[i].lvl;
    }

    if(Math.random() <= probability_max) return ar_ph[index_max];

    sum -= ar_ph[index_max].lvl;
    ar_ph[index_max].lvl = 0;

    let roulett = [];
    for(let i = 0; i < ar_ph.length; ++i) {
        roulett.push(ar_ph[i].lvl / sum);
        // if(i == index_max) {
        //     roulett.push(probability_max);    
        // }
        // else {
        //     roulett.push(ar_ph[i].lvl /sum * (1 - probability_max));
        // }
    }

    let ptr = Math.random();
    sum = 0;
    for(let i = 0; i < roulett.length; ++i) {
        sum += roulett[i];
        if(sum >= ptr) return ar_ph[i];
    }
}

function getDirection(pointA, pointB) {
    return radToDeg(Math.atan2(pointB.y - pointA.y, pointB.x - pointA.x));
}

function rotate(alf, bet) {
    let result = alf + bet;
    
    // Приводим к диапазону [0, 360)
    result = ((result % 360) + 360) % 360;
    
    // Переводим в [-180, 180]
    if (result > 180) result -= 360;
    
    return result;
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
    
    // Округляем до целого исла в меньшую сторону
    x = Math.floor(x);
    y = Math.floor(y);
    
    return {y:y, x:x};
}

function available(world, height, width, cell) {
    if(cell.y < 0 || cell.y > height - 1) {
        return false;
    }
    else if(cell.x < 0 || cell.x > width - 1) {
        return false;
    }
    else if(getColorPixel(world[cell.y][cell.x]) == "grey") {
        return false;
    }
    return true;
}

function markPhHome(phHome, ant) {
    if(phHome.has(ant.y)) {
        if(phHome.get(ant.y).has(ant.x)) {
            let ph_lvl = phHome.get(ant.y).get(ant.x) + 1/ant.path;
            phHome.get(ant.y).set(ant.x, (ph_lvl < MAX_PH_LVL) ? ph_lvl : MAX_PH_LVL);
        }
        else {
            phHome.get(ant.y).set(ant.x, 1/ant.path);
        }
    }
    else {
        phHome.set(ant.y, new Map());
        phHome.get(ant.y).set(ant.x, 1/ant.path);
    }
    return;
}

function markPhFood(phFood, ant) {
    if(phFood.has(ant.y)) {
        if(phFood.get(ant.y).has(ant.x)) {
            let ph_lvl = phFood.get(ant.y).get(ant.x) + 1/ant.path;
            phFood.get(ant.y).set(ant.x, (ph_lvl < MAX_PH_LVL) ? ph_lvl : MAX_PH_LVL);
        }
        else {
            phFood.get(ant.y).set(ant.x, 1/ant.path);
        }
    }
    else {
        phFood.set(ant.y, new Map());
        phFood.get(ant.y).set(ant.x, 1/ant.path);
    }
    return;
}

function processAnt(canvas, world, anthillPixels, phHome, phFood, ant, max_path, size_ant) {
    if(ant.path > max_path) {
        kill(anthillPixels, ant);
        return;
    }

    // Исследуем местность на ниличие феромонов нужного типа
    let free_cells = false;
    let pheromones = []; // {y, x, lvl}
    
    if(ant.hungry) {
        free_cells = searchPhFood(world, phFood, ant, pheromones);
    }
    else{
        free_cells =  searchPhHome(world, phHome, ant, pheromones);
    }


    if(!free_cells) {
        kill(anthillPixels, ant);
        return;
    }
    else if(pheromones.length > 0) {
        let next_position = FPS(pheromones, 0.8);
        ant.newDirection(getDirection({y:ant.y, x:ant.x}, {y:next_position.y, x:next_position.x}));
    }

    // Пробуем мутировать вектор на 30 градусов с вероятностью 0.1
    mutationDirection(ant, 0.1, 30);

    let next_position = getNextPosition(ant, 1);
    while(!available(world, canvas.height, canvas.width, next_position)) {
        rotate(ant.direction, getRandomInt(-180, 180));
        next_position = getNextPosition(ant, 2);
    }

    // Муравей прыгает на новую клетку
    eraseAnt(canvas, world, ant, 2)
    ant.newPosition(next_position.x, next_position.y);
    ++ant.path;
    (ant.hungry ? markPhHome(phHome, ant) : markPhFood(phFood, ant));
    
    let color_pixel = getColorPixel(world[ant.y][ant.x]);
    if((color_pixel == "brown") || (color_pixel == "green")) {
        ant.path = 1;
        ant.hungry = (color_pixel == "green" ? false : true);
    }
    drawAnt(canvas, ant, size_ant, (ant.hungry ? "black" : "green"));

    return;
}

function vaporizePheromones(map2d, p) {
    const keys = Array.from(map2d.keys()); //map1d
    for(let i = 0; i < keys.length; ++i) {
        let map = map2d.get(keys[i]);
        const keys_map = Array.from(map.keys());

        for(let j = 0; j < keys_map.length; ++j) {
            let ph_lvl = map.get(keys_map[j]) * (1 - p);
            if(ph_lvl < MIN_PH_LVL) {
                map.delete(keys_map[j]);
            }
            else {
                map.set(keys_map[j], ph_lvl);
            }
        }
    }
    return;
}


function antColonySimulator(canvas) {
    if(!anthillPixels.length) {
        alert("The spawn point is not set");
        return;
    }

    initColony(colony, anthillPixels, 100);
    
    function simulate() {
        for(let i = 0; i < colony.length; ++i) {
            processAnt(canvas, world, anthillPixels, phHome, phFood, colony[i], MAX_PATH, 2);
        }
        // vaporizePheromones(phHome, P);
        // vaporizePheromones(phFood, P);
        requestAnimationFrame(simulate);
    }
    
    simulate();


    return;
}

