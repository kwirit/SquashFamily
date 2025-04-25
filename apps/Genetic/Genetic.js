const POPULATION_SIZE = 10; // Размем популяции
const MUTATION_PROB_BASE = 0.05; // Начальная вероятность мутации
const ELITE_RATE = 0.05; // Доля элиты
const TOURNAMENT_SIZE = 5; // Размер турнира

class Chromosome
{
    genes;
    fitness;

    constructor(genes, fitness)
    {
        this.genes = genes;
        this.fitness = fitness;
    }
};


function getRandomInt(min, max)
{
    if (min > max) [min, max] = [max, min];
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(ar)
{
    for(let i = ar.length - 1; i > -1; --i) {
        let j = getRandomInt(0, i);
        [ar[i], ar[j]] = [ar[j], ar[i]];
    }

    return;
}

function getNewGenes(points)
{
    let genes = structuredClone(points);
    shuffle(genes);

    return genes;
}

function getNewPopulation(points)
{
    let new_population = [];
    for(let i = 0; i < POPULATION_SIZE; ++i) {
        let genes = getNewGenes(points);
        let fitness = getFitness(genes);
        
        let new_chromosome = new Chromosome(genes, fitness);
        
        new_population.push(new_chromosome);
    }

    return new_population;
}

function getLineLength(point_a, point_b)
{
    let dx = point_b.x - point_a.x;
    let dy = point_b.y - point_a.y;

    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
}

function getFitness(genes)
{
    let fitness = 0;
    for(let i = 0; i + 1 < genes.length; ++i) {
        let current = genes[i];
        let next = genes[i + 1];
        fitness += getLineLength(current, next);
    }
    fitness += getLineLength(genes[genes.length - 1], genes[0]);

    return fitness;
}

function tournamentSelection(population)
{
    let best = population[getRandomInt(0, population.length - 1)];
    for(let i = 0; i < TOURNAMENT_SIZE; ++i) {
        let other = population[getRandomInt(0, population.length - 1)];
        if(other.fitness < best.fitness) {
            best = other;
        }
    }

    return best;
}

function crossover(parent1, parent2)
{
    const len = parent1.length;
    const child = new Array(len);
    const left = getRandomInt(0, len - 2);
    const right = getRandomInt(left + 1, len - 1);
  
    const used = new Set();
    for (let i = left; i <= right; i++) {
      child[i] = parent1[i];
      used.add(JSON.stringify(parent1[i]));
    }
  
    let ptr = 0;
    for (let i = 0; i < len; i++) {
        if (i >= left && i <= right) continue;
        
        while (ptr < len && used.has(JSON.stringify(parent2[ptr]))) {
            ptr++;
        }

        if(ptr < len) {
            child[i] = parent2[ptr++];
        }
        else {
            child[i] = parent1[i];
        }
    }
  
    return child;
}


STAGNATION = 0;
LAST_BEST_FITNESS = Infinity;
function adjustMutationProbability(current_best_fitness)
{
    if(current_best_fitness < LAST_BEST_FITNESS) {
        STAGNATION = 0;
    }
    else {
        ++STAGNATION;
    }

    LAST_BEST_FITNESS = current_best_fitness;

    return Math.min(0.7, MUTATION_PROB_BASE + STAGNATION * 0.005);
}

function mutation(genes, probability)
{
    if(Math.random() > probability) {
        return;
    }

    let i = getRandomInt(0, genes.length - 1);
    let j = getRandomInt(0, genes.length - 1);

    [genes[i], genes[j]] = [genes[j], genes[i]];

    return;
}

function reverseSwap(ar, left, right)
{
    while(left < right) {
        const temp = ar[left];
        ar[left] = ar[right];
        ar[right] = temp;

        ++left;
        --right;
    }

    return;
}

function twoOpt(genes)
{
    let improvement_found = true;
    while(improvement_found) {
        improvement_found = false;
        for(let i = 1; i < genes.length - 2; ++i) {
            for(let j = i + 1; j < genes.length - 1; ++j) {
                let A = genes[i - 1];
                let B = genes[i];
                let C = genes[j];
                let D = genes[j + 1];

                if(getLineLength(A, C) + getLineLength(B, D) < getLineLength(A, B) + getLineLength(C, D)) {
                    reverseSwap(genes, i, j);
                    improvement_found = true;
                    break;
                }
            }

            if(improvement_found) break;
        }
    }
}

function updatePopulation(population)
{
    population.sort((a, b) => a.fitness - b.fitness);

    let size_elite = Math.max(1, Math.floor(POPULATION_SIZE * ELITE_RATE));
    
    let new_population = []; // {Chromosome}
    for(let i = 0; i < size_elite; ++i) {
        new_population.push(population[i]);
    }

    while(new_population.length < population.length) {
        let parent1 = tournamentSelection(population);
        let parent2 = tournamentSelection(population);
        
        let child_genes = crossover(parent1.genes, parent2.genes);

        let mutation_probability = adjustMutationProbability(new_population[0].fitness);
        mutation(child_genes, mutation_probability);
        twoOpt(child_genes);

        let child_fitness = getFitness(child_genes);

        let child_chromosome = new Chromosome(child_genes, child_fitness);

        new_population.push(child_chromosome);
    }

    return new_population;
}

function draw(canvas, genes, color, size)
{
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    
    ctx.beginPath();
    ctx.moveTo(genes[0].x, genes[0].y);
    for (let i = 1; i < genes.length; i++) {
      ctx.lineTo(genes[i].x, genes[i].y);
    }
    ctx.lineTo(genes[0].x, genes[0].y);
    ctx.closePath();
    ctx.stroke();

    return;
}

function start(dynamic_canvas, points)
{
    if(points.length < 2) {
        alert("Minimum of 2 vertexes");
        return;
    }

    CAN_DRAW = false;

    let population = getNewPopulation(points); // {Chromosome}
    let best_chromosome = population[0];
    draw(dynamic_canvas, best_chromosome.genes, "red", 3);

    function animation()
    {
        population =  updatePopulation(population);

        for(let i = 0; i < population.length; ++i) {
            if(population[i].fitness < best_chromosome.fitness) {
                best_chromosome = population[i];
            }
        }

        draw(dynamic_canvas, best_chromosome.genes, (STAGNATION >= 3000 ? "green" : "red"), 3);

        if(STAGNATION >= 3000) {
            STAGNATION = 0;
            CAN_DRAW = true;
            return;
        }

        requestAnimationFrame(animation);
    }

    animation();
}