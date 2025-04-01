let canvas = document.getElementById("c1")
let button1 = document.getElementById("b1")
let button2 = document.getElementById("b2")
let predicted = document.getElementById("p1")
let ctx = canvas.getContext("2d")
let canvas2 = document.getElementById("c2")
let ctx2 = canvas2.getContext("2d")
let width = canvas.width;
let height = canvas.height;
let isDrawing = false;

function draw(event){
    if (!isDrawing){
        return
    }
    ctx.lineWidth = 2
    ctx.lineTo(event.offsetX, event.offsetY)
    ctx.stroke()
}
function drawStart(){
    isDrawing = true
    ctx.beginPath()
}

function drawEnd(){
    isDrawing = false
    ctx.closePath()
}
function clear(){
    ctx.clearRect(0, 0, width, height);
}


canvas.addEventListener("mousemove", draw)
window.addEventListener("mousedown", drawStart)
window.addEventListener("mouseup", drawEnd)
button1.addEventListener("click", guess)
button2.addEventListener("click", clear)


function guess(){
    let scannedImage = ctx.getImageData(0,0,width,height)
    let imageData = scannedImage.data
    ctx2.drawImage(canvas, 0, 0, 50, 50, 0, 0, 28, 28);
    scannedImage = ctx2.getImageData(0,0,28,28)
    imageData = scannedImage.data
    let data = []
    if(imageData[3] === 0) {
        data[0] = 0
    }
    else{
        data[0] = 1
    }
    for(let i = 1;i<28*28;i++){
        if(imageData[i*4-1] === 0) {
            data[i] = 0
        }
        else{
            data[i] = 1
        }
    }
    predicted.textContent= "predicted: " + Neural(data)
}