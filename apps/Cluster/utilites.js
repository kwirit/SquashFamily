export async function loadTemplate(url, elementId) {
    const response = await fetch(url);
    if (response.ok) {
        const text = await response.text();
        document.getElementById(elementId).innerHTML = text;
    }
}

export function getRandomElementSet(set) {
    let array = [...set];
    return array[random(1, array.length - 1)];
}

export function EuclideanDistance(pointFirst, pointSecond) {
    return Math.sqrt(
        Math.pow(pointFirst.x - pointSecond.x, 2) +
        Math.pow(pointFirst.y - pointSecond.y, 2)
    );
}

export function drawPoints(x, y, radius, color, ctx) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

export function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

