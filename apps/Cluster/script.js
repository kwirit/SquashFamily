import {
     EuclideanDistance,
    random, drawPoints, getRandomElementSet
} from "./utilites.js";
import {loadTemplate} from '../../js/utilites.js';

loadTemplate('../../templates/footer.html', 'footer-templates');
loadTemplate('../../templates/headerAlgs.html', 'header-templates');

class Point {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    setNewColor(color) {
        drawPoints(this.x, this.y, this.radius, color, ctx);
        this.color = color;
    }
}


let canv = document.querySelector('canvas');
let ctx = canv.getContext('2d');

canv.width = 500;
canv.height = 500;

let allPoints = [];
let allCentroids = [];
const colors = [
    '#FF5733',
    '#33FF57',
    '#3357FF',
    '#F3FF33',
    '#FF33F6',
    '#33FFF6',
    '#F333FF',
    '#33F6FF',
    '#F6FF33',
    '#FF3386'
];
const neutralColor = "rgba(65, 137, 255, 0.87)";
let radius = 3;
let m = 4;
let epsilon = 10;

const buttonClear = document.getElementById('ButtonClear');
const buttonStartClustering = document.getElementById('button-start-clustering');

buttonStartClustering.addEventListener('click', clustering);
buttonClear.addEventListener('click', clearGrid);


document.addEventListener('DOMContentLoaded', function () {
    const radiusRangeInput = document.getElementById('radius-rangeButton');
    const radiusRangeValue = document.getElementById('radius-rangeValue');
    const mRangeInput = document.getElementById('m-rangeButton');
    const mRangeValue = document.getElementById('m-rangeValue');
    const epsilonRangeInput = document.getElementById('epsilon-rangeButton');
    const epsilonRangeValue = document.getElementById('epsilon-rangeValue');

    if (!radiusRangeValue || !radiusRangeInput) {
        console.error('Elements with IDs radius-rangeButton or radius-rangeValue not found.');
    } else {
        function updateRadiusValue() {
            const value = parseInt(radiusRangeInput.value, 10);
            radius = value;
            radiusRangeValue.textContent = value;
        }
        radiusRangeInput.addEventListener('input', updateRadiusValue);
        updateRadiusValue();
    }
    if (!mRangeInput || !mRangeValue) {
        console.error('Elements with IDs m-rangeButton or m-rangeValue not found.');
    } else {
        function updateMValue() {
            const value = parseInt(mRangeInput.value, 10);
            m = value;
            mRangeValue.textContent = value;
        }
        mRangeInput.addEventListener('input', updateMValue);
        updateMValue();
    }

    if (!epsilonRangeInput || !epsilonRangeValue) {
        console.error('Elements with IDs epsilon-rangeButton or epsilon-rangeValue not found.');
    } else {
        function updateEpsilonValue() {
            const value = parseInt(epsilonRangeInput.value, 10);
            epsilon = value;
            epsilonRangeValue.textContent = value;
        }
        epsilonRangeInput.addEventListener('input', updateEpsilonValue);
        updateEpsilonValue();
    }
});

canv.addEventListener('click', (e) => {
    const rect = canv.getBoundingClientRect();
    const x = e.clientX - rect.left - radius;
    const y = e.clientY - rect.top - radius;
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
        drawPoints(point.x, point.y, point.radius, neutralColor, ctx);
        point.setNewColor(neutralColor);
    }
}

function createPoint(x, y, radius, color) {
    drawPoints(x, y, radius, color, ctx);
    let newPoint = new Point(x, y, radius, color);
    allPoints.push(newPoint);
    return newPoint;
}

function createCentroids(x, y, radius, color) {
    drawPoints(x, y, radius * 2, color, ctx);
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
            drawPoints(oldCentroid.x, oldCentroid.y, oldCentroid.radius + 1, "white", ctx);
            allCentroids[allCentroids.indexOf(oldCentroid)] = newCentroid;
            drawPoints(newCentroid.x, newCentroid.y, newCentroid.radius, newCentroid.color, ctx);
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
            if (minDistance > maxDistance) {
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

function DBSCAN(m, epsilon) {
    function calcEpsilonLocality(currPoint) {
        let arrayPointsEpsilon = [];
        for (let point of allPoints) {
            let distance = EuclideanDistance(point, currPoint);
            if (distance < epsilon && point !== currPoint && notMarkedPoints.has(point))
                arrayPointsEpsilon.push(point);
        }
        return arrayPointsEpsilon;
    }

    function recursionFindClusters(currPoint) {
        let arrayPointsEpsilon = calcEpsilonLocality(currPoint);
        if (notMarkedPoints.has(currPoint))
            notMarkedPoints.delete(currPoint);
        currPoint.setNewColor(colors[currColor]);

        if (arrayPointsEpsilon.length >= m) {
            for (let neighbour of arrayPointsEpsilon) {
                if (!clusters[currColor].includes(neighbour)) {
                    clusters[currColor].push(neighbour);
                    recursionFindClusters(neighbour);
                }
            }
        }
    }

    clearClusters();
    if (allPoints.length === 0) return;

    let currColor = 0;
    let notMarkedPoints = new Set(allPoints);
    let clusters = {};

    while (notMarkedPoints.size > 0) {
        let currPoint = getRandomElementSet(notMarkedPoints);
        let arrayPointsEpsilon = calcEpsilonLocality(currPoint);
        notMarkedPoints.delete(currPoint);

        if (arrayPointsEpsilon.length >= m) {
            clusters[currColor] = [currPoint];
            currPoint.setNewColor(colors[currColor]);
            for (let neighbour of arrayPointsEpsilon)
                recursionFindClusters(neighbour);
            currColor++;
        }
    }
}

function clustering() {
    const radioButtons = document.querySelectorAll('input[name="vbtn-radio"]');

    let selectedAlgorithm = null;
    radioButtons.forEach(radio => {
        if (radio.checked) {
            selectedAlgorithm = radio.id;
        }
    });

    switch (selectedAlgorithm) {
        case 'radio-DBSCAN':
            DBSCAN(m, epsilon);
            break;
        case 'radio-KMeansPP':
            KMeansPP();
            break;
        case 'radio-KMeans':
            KMeans();
            break;
        default:
            alert('Не выбран алгоритм кластеризации');
    }
}