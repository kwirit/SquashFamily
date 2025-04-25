let canvas = document.getElementById("mainCanvas")
let button1 = document.getElementById("buttonCheck")
let button2 = document.getElementById("buttonClear")
let predicted = document.getElementById("predicted-result")
let ctx = canvas.getContext("2d")
let canvas2 = document.getElementById("c2")
let ctx2 = canvas2.getContext("2d")
let width = canvas.width;
let height = canvas.height;

let isDrawing = false;

canvas.addEventListener("mousemove", draw)
window.addEventListener("mousedown", drawStart)
window.addEventListener("mouseup", drawEnd)
button1.addEventListener("click", guess)
button2.addEventListener("click", clear)

function draw(event) {
    if (!isDrawing) {
        return
    }
    ctx.lineWidth = 5
    ctx.lineTo(event.offsetX * width / canvas.clientWidth, event.offsetY * width / canvas.clientHeight)
    ctx.stroke()
}

function drawStart() {
    isDrawing = true
    ctx.beginPath()
}

function drawEnd() {
    isDrawing = false
    ctx.closePath()
}

function clear() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
}

async function guess() {
    ctx2.drawImage(canvas, 0, 0, 50, 50, 0, 0, 28, 28)
    let scannedImage = ctx2.getImageData(0, 0, 28, 28)
    let imageData = scannedImage.data
    let data = []
    data[0] = (imageData[3] / 255)
    for (let i = 1; i < 28 * 28; i++) {
        data[i] = (imageData[i * 4 - 1] / 255)
    }
    let predict = await Neural(data)
    predicted.textContent = "predicted: " + predict
}

async function loadTemplate(url, elementId) {
    const response = await fetch(url);
    if (!response.ok)
        return;
    document.getElementById(elementId).innerHTML = await response.text();
}
loadTemplate('../../templates/footer.html', 'footer-templates');
loadTemplate('../../templates/headerAlgorithms.html', 'header-templates');