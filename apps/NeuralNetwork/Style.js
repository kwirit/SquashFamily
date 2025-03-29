let canvas = document.getElementById("c1")
let button = document.getElementById("b1")
let predicted = document.getElementById("p1")
let ctx = canvas.getContext("2d")

let isDrawing = false;

function draw(event){
    if (!isDrawing){
        return
    }
    ctx.lineTo(event.offsetX, event.offsetY)
    ctx.stroke()
}
function drawstart(event){
    isDrawing = true
    ctx.beginPath()
}

function drawend(event){
    isDrawing = false
    ctx.closePath()
}

canvas.addEventListener("mousemove", draw)
window.addEventListener("mousedown", drawstart)
window.addEventListener("mouseup", drawend)
button.addEventListener("click", guess)


function guess(event){
    ctx.getImageData(0,0,50,50);

    predicted.textContent= "predicted: ";
}