let canvas = document.getElementById("c1")
let button1 = document.getElementById("b1")
let button2 = document.getElementById("b2")
let predicted = document.getElementById("p1")
let ctx = canvas.getContext("2d")
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
    let data = []
    if(imageData[3] === 0) {
        data[0] = 0
    }
    else{
        data[0] = 1
    }
    for(let i = 1;i<width*height;i++){
        if(imageData[i*4-1] === 0) {
            data[i] = 0
        }
        else{
            data[i] = 1
        }
    }
    console.log(Neural(data))
    predicted.textContent= "predicted: "
}