const canvas = document.getElementById("mainCanvas")
const button1 = document.getElementById("buttonCheck")
const button2 = document.getElementById("buttonClear")
const predicted = document.getElementById("predicted-result")
const ctx = canvas.getContext("2d")
const canvasForResize = document.getElementById("c2")
const ctx2 = canvasForResize.getContext("2d")
const width = canvas.width;
const height = canvas.height;

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
    ctx2.clearRect(0, 0, canvasForResize.width, canvasForResize.height);
}

async function guess() {
    ctx2.drawImage(canvas, 0, 0, width, height, 0, 0, 28, 28)
    const scannedImage = ctx2.getImageData(0, 0, 28, 28)
    const imageData = scannedImage.data
    let data = []
    data[0] = (imageData[3] / 255)
    for (let i = 1; i < 28 * 28; i++) {
        data[i] = (imageData[i * 4 - 1] / 255)
    }
    let isEmpty = true
    for(let i = 0;i<data.length;i++){
        if(data[i] !== 0){
            isEmpty = false
            break
        }
    }
    if(isEmpty){
        alert("Пустой холст")
        return
    }
    const predict = await Neural(data)
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