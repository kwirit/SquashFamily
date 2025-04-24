
let POPULATION_SIZE = 300;


function getLineLength(point_a, point_b)
{
    let a = point_a.x - point_b.x;
    let b = point_a.y - point_b.y;
    
    return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
}

function createNewMatrix(points)
{
    let new_matrix = [];
    for(let i = 0; i < points.length; ++i) {
        let row = [];
        for(let j = 0; j < points.length; ++j) {
            let line_length = getLineLength(points[i], points[j]);
            row.push(line_length);
        }
        new_matrix.push(row);
    }

    return new_matrix;
}

function getRandomInt(min, max) {
    if (min > max) [min, max] = [max, min]; // Меняем местами, если нужно
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createNewChromosome(points)
{
    let result = []; //{x, y}
    for(let i = 0; i < points.length; ++i) {
        result.push(points[i]);
    }

    return result;
}

// Алгоритм Фишера-Йетса
function shuffling(ar)
{
    for(let i = ar.length - 1; i > 0; --i) {
        let j = getRandomInt(0, i - 1);
        [ar[i], ar[j]] = [ar[j], ar[i]];
    }

    return;
}

function createNewPopulation(points, population_size)
{
    let population = [];
    for(let i = 0; i < population_size; ++i) {
        let chromosome = createNewChromosome(points)
        shuffling(chromosome);
        population.push(chromosome);
    }

    return population;
}

function fitness(chromosome_ar)
{
    let result = 0;

    for(let i = 0; i < chromosome_ar.length - 1; ++i) {
        let current = chromosome_ar[i];
        let next = chromosome_ar[i+1];
        result += getLineLength(current, next);
    }
    result += getLineLength(chromosome_ar[chromosome_ar.length - 1], chromosome_ar[0]);

    return result;
}

function FPS(population, size_claster, start)
{
    let ar_fit = [];
    let sum = 0;
    for(let i = start; i < start + size_claster; ++i) {
        let fit = 1 / fitness(population[i]);
        ar_fit.push(fit);
        sum += fit;
    }

    let p = Math.random();
    let parent_index = start;
    for(let i = 0, roulette_sum = 0; i < size_claster; ++i) {
        roulette_sum += ar_fit[i] / sum;
        if(p <= roulette_sum) {
            parent_index += i;
            break;
        }
    }
    
    return parent_index;
}

function getParentIndexes(population, count_parents, size_claster)
{
    let parent_indexes = [];

    // Если популяция меньше, чем размер нашей выборки
    for(let i = 0; (population.length < count_parents * size_claster) && (i < count_parents); ++i) {
        if(i >= population.length) {
            return parent_indexes;
        }
        parent_indexes.push(i);
    }
    
    // Если у нас есть место для нашей выборки
    for(let i = 0; parent_indexes.length < count_parents; i += size_claster) {
        let parent_index = FPS(population, size_claster, i);
        parent_indexes.push(parent_index);
    }

    return parent_indexes;
}

// OMP
function getChild(parent1, parent2) {
    const length = parent1.length;
    const child = structuredClone(parent1);

    // Выбираем отрезок [left, right], оба включительно
    const left = getRandomInt(0, length - 2);
    const right = getRandomInt(left + 1, length - 1);

    const set = new Set();

    // Копируем отрезок из parent1
    for (let i = left; i <= right; ++i) {
        child[i] = parent1[i];
        set.add(JSON.stringify(parent1[i]));
    }

    // Заполняем остальные позиции из parent2 по порядку
    let ptr = 0;
    for (let i = 0; i < length; ++i) {
        if (i >= left && i <= right) continue;

        // Пропускаем элементы, которые уже скопированы
        while (set.has(JSON.stringify(parent2[ptr]))) {
            ++ptr;
        }

        child[i] = parent2[ptr];
        ++ptr;
    }

    return child;
}

function mutation(child, probability)
{
    if (Math.random() > probability) {
        return;
    }

    let first_index = getRandomInt(0, child.length - 1);
    let second_index = getRandomInt(0, child.length - 1);

    [child[first_index], child[second_index]] = [child[second_index], child[first_index]];

    return;
}

function breeding(population, parent_indexes, probability_mutation)
{
    for(let i = 0; i + 1 < parent_indexes.length; ++i) {
        let child = getChild(population[parent_indexes[i]], population[parent_indexes[i+1]]);
        mutation(child, probability_mutation);
        population[parent_indexes[i]] = child;
    }

    return;
}

function draw(dynamic_canvas, chromosome, color, size)
{
    const ctx = dynamic_canvas.getContext("2d");

    ctx.strokeStyle = color;
    ctx.lineWidth = size;

    ctx.beginPath();
    ctx.moveTo(chromosome[0].x, chromosome[0].y);
    for(let i = 1; i < chromosome.length; ++i) {
        ctx.lineTo(chromosome[i].x, chromosome[i].y);
    }
    ctx.lineTo(chromosome[0].x, chromosome[0].y);
    ctx.stroke();

    return;
}

function processChromosomes(dynamic_canvas, population, best)
{
    const ctx = dynamic_canvas.getContext("2d");
    ctx.clearRect(0, 0, dynamic_canvas.width, dynamic_canvas.height);

    for(let i = 0; i < population.length; ++i) {
        let chromosome = population[i];
        let chromosome_fit = fitness(chromosome);
        // draw(dynamic_canvas, chromosome, "black", 1);

        if(chromosome_fit < best.best_fitness) {
            best.best_fitness = chromosome_fit;
            best.best_chromosome = chromosome;
            console.log(chromosome_fit);
        }
    }

    return;
}

function start(dynamic_canvas, points) {
    if (points.length < 2) {
        alert("Добавьте хотя бы 2 точки");
        return;
    }

    let population = createNewPopulation(points, POPULATION_SIZE);
    let best = {
        best_chromosome: population[0],
        best_fitness: fitness(population[0])
    }
    // let best_chromosome_index = 0;
    // let best_fitness = fitness(population[best_chromosome_index]);

    function generation() {
        let parent_indexes = getParentIndexes(population, 20, 10); // {parent, i}
        breeding(population, parent_indexes, 0.1);
        processChromosomes(dynamic_canvas, population, best);
        draw(dynamic_canvas, best.best_chromosome, "red", 2);
        shuffling(population);
        
        requestAnimationFrame(generation);
    }

    generation();
}