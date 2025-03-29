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
function drawstart(){
    isDrawing = true
    ctx.beginPath()
}

function drawend(){
    isDrawing = false
    ctx.closePath()
}

canvas.addEventListener("mousemove", draw)
window.addEventListener("mousedown", drawstart)
window.addEventListener("mouseup", drawend)
button.addEventListener("click", guess)


function guess(){
    scannedImage = ctx.getImageData(0,0,50,50);
    imageData = scannedImage.data;
    let data = [];
    for (let i= 0;i<2500;i++){
        if(imageData[i*4+3] === 0){
            data[i] = 255;
        }
        else{
            data[i] = 0;
        }
    }
    console.log(data)
    predicted.textContent= "predicted: ";
}