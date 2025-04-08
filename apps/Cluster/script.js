class Point {
    constructor(x, y, radius, color, index) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    setNewColor(color) {
        drawPoints(this.x, this.y, this.radius, color);
        this.color = color;
    }
}

function getRandomElementSet(set){
    let array = [...set];
    return array[random(1, array.length - 1)];
}

function EuclideanDistance(pointFirst, pointSecond) {
    return Math.sqrt(
        Math.pow(pointFirst.x - pointSecond.x, 2) +
        Math.pow(pointFirst.y - pointSecond.y, 2)
    );
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function drawPoints(x, y, radius, color) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function min(numberFirst, numberSecond) {
    return numberFirst > numberSecond ? numberSecond : numberFirst;
}

function max(numberFirst, numberSecond) {
    return numberFirst < numberSecond ? numberSecond : numberFirst;
}

let canv = document.querySelector('canvas');
let ctx = canv.getContext('2d');

canv.width = 500;
canv.height = 500;

let allPoints = [];
let allCentroids = [];
const colors = ['red', 'green', 'yellow', 'blue', 'purple', 'pink', 'orange'];
const neutralColor = "rgba(65, 137, 255, 0.87)";
const radius = 3;

const buttonKMeans = document.getElementById('ButtonKMeans');
const buttonKMeansPP = document.getElementById('ButtonKMeansPP');
const buttonDBSCAN = document.getElementById('ButtonDBSCAN');
const buttonClear = document.getElementById('ButtonClear');
buttonKMeans.addEventListener('click', KMeans);
buttonClear.addEventListener('click', clearGrid);
buttonKMeansPP.addEventListener('click', KMeansPP);
buttonDBSCAN.addEventListener('click', DBSCAN);
canv.addEventListener('click', (e) => {
    const rect = canv.getBoundingClientRect();
    const x = e.clientX - rect.left - 3;
    const y = e.clientY - rect.top - 3;
    createPoint(x, y, radius, neutralColor);
});

function clearGrid() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canv.width, canv.height);
    ctx.beginPath();
    ctx.fillStyle = 'black';

    allPoints.length = 0;
    allCentroids.length = 0;
}

function clearClusters() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canv.width, canv.height);
    ctx.beginPath();
    ctx.fillStyle = 'black';
    allCentroids = [];
    for (let point of allPoints) {
        drawPoints(point.x, point.y, point.radius, neutralColor);
        point.setNewColor(neutralColor);
    }
}

function createPoint(x, y, radius, color) {
    drawPoints(x, y, radius, color);
    let newPoint = new Point(x, y, radius, color, allPoints.length);
    allPoints.push(newPoint);
    return newPoint;
}

function createCentroids(x, y, radius, color) {
    drawPoints(x, y, radius * 2, color);
    let newCentroid = new Point(x, y, radius * 2, color, -1);
    allCentroids.push(newCentroid);
    return newCentroid;
}

function KMeans() {
    let cntCluster = document.getElementById('CountCluster');
    let countCluster = parseInt(cntCluster.value, 10);

    clearClusters();

    let clusters = {};
    for (let idx = 0; idx < countCluster; idx++)
        clusters[idx] = [];

    let centroidColors = colors.slice(0, countCluster);

    for (let idx = 0; idx < countCluster; idx++) {
        let randomX = random(radius * 2, canv.width - radius * 2);
        let randomY = random(radius * 2, canv.height - radius * 2);
        createCentroids(randomX, randomY, radius, centroidColors[idx]);
    }

    do {
        createClusters(clusters);
    } while (reCalcCentroids(clusters, countCluster, 0.1));
}

function reCalcCentroids(clusters, countCluster, controlValue) {
    let parameterCentroids = {};
    for (let idx = 0; idx < countCluster; idx++) {
        let points = clusters[idx];
        if (points.length === 0) continue;

        let sumX = points.reduce((a, b) => a + b.x, 0);
        let sumY = points.reduce((a, b) => a + b.y, 0);
        let counter = points.length;

        parameterCentroids[allCentroids[idx].color] = [sumX, sumY, counter];
    }

    let flag = false;
    for (let color in parameterCentroids) {
        if (!parameterCentroids.hasOwnProperty(color)) continue;
        let [x, y, counter] = parameterCentroids[color];
        let oldCentroid = allCentroids.find(c => c.color === color);
        let newCentroid = new Point(x / counter, y / counter, radius * 2, color, -1);
        let diff = EuclideanDistance(newCentroid, oldCentroid);
        if (diff > controlValue) {
            flag = true;
            drawPoints(oldCentroid.x, oldCentroid.y, oldCentroid.radius + 1, "white");
            allCentroids[allCentroids.indexOf(oldCentroid)] = newCentroid;
            drawPoints(newCentroid.x, newCentroid.y, newCentroid.radius, newCentroid.color);
        }
    }
    return flag;
}

function createClusters(clusters) {
    for (let idx in clusters) {
        if (!clusters.hasOwnProperty(idx)) continue;
        clusters[idx].length = 0;
    }

    for (let point of allPoints) {
        let minDistance = Infinity;
        let newColor = null;
        for (let centroid of allCentroids) {
            let distance = EuclideanDistance(point, centroid);
            if (distance < minDistance) {
                minDistance = distance;
                newColor = centroid.color;
            }
        }
        point.setNewColor(newColor);

        for (let idx = 0; idx < colors.length; idx++)
            if (colors[idx] === newColor) {
                clusters[idx].push(point);
                break;
            }
    }
}

function KMeansPP() {
    let cntCluster = document.getElementById('CountCluster');
    let countCluster = parseInt(cntCluster.value, 10);

    clearClusters();
    if (allPoints.length === 0) return;

    let randomPoint = allPoints[random(0, allPoints.length - 1)];
    let centroidColors = colors.slice(0, countCluster);

    createCentroids(randomPoint.x, randomPoint.y, radius, centroidColors[0]);

    for (let idx = 1; idx < countCluster; idx++) {
        let maxDistance = -Math.pow(10, 10);
        let aspCentroid = null;
        for (let point of allPoints) {
            let minDistance = Infinity;
            for (let centroid of allCentroids) {
                let distance = EuclideanDistance(point, centroid);
                if (distance < minDistance)
                    minDistance = distance;
            }
            if (minDistance > maxDistance){
                aspCentroid = point;
                maxDistance = minDistance;
            }
        }
        createCentroids(aspCentroid.x, aspCentroid.y, radius, centroidColors[idx]);
    }

    let clusters = {};
    for (let idx = 0; idx < countCluster; idx++)
        clusters[idx] = [];

    do {
        createClusters(clusters);
    } while (reCalcCentroids(clusters, countCluster, 0.01));
}



function DBSCAN(m, epsilon){
    function calcEpsilonLocality(currPoint) {
        let arrayPointsEpsilon = new Array(0);
        for (let point of allPoints) {
            let distance = EuclideanDistance(point, currPoint);
            if (distance < epsilon && point !== currPoint && notMarkedPoints.has(point))
                arrayPointsEpsilon.push(point);
        }
        return arrayPointsEpsilon;
    }

    function recursionFindClusters(currPoint) {
        let arrayPointsEpsilon = calcEpsilonLocality(currPoint);
        console.log(notMarkedPoints);
        if (notMarkedPoints.has(currPoint))
            notMarkedPoints.delete(currPoint);
        currPoint.setNewColor(colors[currColor]);

        if (arrayPointsEpsilon.length >= m){
            clusters[currColor].push(currPoint)
            for (let neighbour of arrayPointsEpsilon) {
                recursionFindClusters(neighbour);
            }
        }
    }

    m = 5;
    epsilon = 100;
    clearClusters();
    if (allPoints.length === 0) return;
    let currColor = 0;
    let notMarkedPoints = new Set(allPoints);
    let pointsForFind = new Set(allPoints);
    let clusters = {};

    while (notMarkedPoints.size > 0) {
        let currPoint = getRandomElementSet(pointsForFind);
        let arrayPointsEpsilon = calcEpsilonLocality(currPoint);
        notMarkedPoints.delete(currPoint);

        if (arrayPointsEpsilon.length >= m) {
            pointsForFind.delete(currPoint);
            clusters[currColor] = [];
            clusters[currColor].push(currPoint)
            currPoint.setNewColor(colors[currColor]);
            for (let neighbour of arrayPointsEpsilon) {
                recursionFindClusters(neighbour)
            }
            currColor++;
        }
    }
}

