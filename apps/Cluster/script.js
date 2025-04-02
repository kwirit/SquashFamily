class Point {
    constructor(x, y, radius, color, index) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.index = index;
    }

    deletePoint() {
        drawPoints(this.x, this.y, this.radius * 2, "white");
        if (this.index !== -1)
            delete allPoints[this.index];
    }

    setNewColor(color) {
        drawPoints(this.x, this.y, this.radius, color);
        this.color = color;
    }
}

function EuclideanDistance(pointFirst, pointSecond) {
    return Math.sqrt(
        Math.pow(pointFirst.x - pointSecond.x, 2) +
        Math.pow(pointFirst.y - pointSecond.y, 2)
    );
}

function drawPoints(x, y, radius, color) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function random(min, max) {
    return Math.random() * (max - min + 1) + min;
}

function min(numberFirst, numberSecond) {
    if (numberFirst > numberSecond)
        return numberSecond;
    return numberFirst;
}

function max(numberFirst, numberSecond) {
    if (numberFirst < numberSecond)
        return numberSecond;
    return numberFirst;
}

let canv = document.querySelector('canvas');
let ctx = canv.getContext('2d');

canv.width = 500;
canv.height = 500;

let allPoints = [];
let allCentroids = new Map();
const colors = ['red', 'green', 'yellow', 'blue', 'purple', 'pink', 'orange'];
const neutralColor = "rgba(65, 137, 255, 0.87)";
const radius = 3;

const buttonKMeans = document.getElementById('ButtonKMeans');
const buttonClear = document.getElementById('ButtonClear');
buttonKMeans.addEventListener('click', KMeans);
buttonClear.addEventListener('click', clearGrid);
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
    allCentroids.clear();
}

function createPoint(x, y, radius, color) {
    drawPoints(x, y, radius, color);
    let newPoint = new Point(x, y, radius, color, allPoints.length);
    allPoints.push(newPoint);
    return newPoint;
}

function createCentroids(x, y, radius, color) {
    drawPoints(x, y, radius, color);
    let newCentroid = new Point(x, y, radius, color, -1);
    allCentroids.set(color, newCentroid);
    return newCentroid;
}

function KMeans() {
    let countCluster = 3;

    for (let idx = 0; idx < countCluster; idx++) {
        let randomX = random(radius * 2, canv.width - radius * 2);
        let randomY = random(radius * 2, canv.height - radius * 2);
        createCentroids(randomX, randomY, radius * 2, colors[idx]);
    }

    createClusters();

    while (recalculateCentroids(countCluster, 0.1)) {
        createClusters();
    }
}

function recalculateCentroids(countCluster, controlValue) {
    let parameterCentroids = new Map();
    for (let idx = 0; idx < countCluster; idx++)
        parameterCentroids.set(colors[idx], [0, 0, 0]);

    for (let point of allPoints) {
        let clr = point.color;
        parameterCentroids.set(clr, [
            parameterCentroids.get(clr)[0] + point.x,
            parameterCentroids.get(clr)[1] + point.y,
            parameterCentroids.get(clr)[2] + 1
        ]);
    }

    let flag = false;
    for (let [color, [x, y, counter]] of parameterCentroids) {
        let oldCentroid = allCentroids.get(color);
        let newCentroid = new Point(x / counter, y / counter, radius * 2, color, -1);
        let diff = EuclideanDistance(newCentroid, oldCentroid);
        if (diff > controlValue) {
            flag = true;
            oldCentroid.deletePoint();
            allCentroids.set(color, newCentroid);
            drawPoints(newCentroid.x, newCentroid.y, newCentroid.radius, newCentroid.color);
        }
    }
    return flag;
}

function createClusters() {
    for (let point of allPoints) {
        let minDistance = Math.pow(canv.width, 2) * Math.pow(canv.height, 2);
        let newColor = null;
        for (let [color, centroid] of allCentroids) {
            let distance = EuclideanDistance(point, centroid);
            if (distance < minDistance) {
                minDistance = distance;
                newColor = centroid.color;
            }
        }
        point.setNewColor(newColor);
    }
}