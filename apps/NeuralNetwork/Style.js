let canvas = document.getElementById("c1")
let button1 = document.getElementById("b1")
let button2 = document.getElementById("b2")
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
function drawStart(){
    isDrawing = true
    ctx.beginPath()
}

function drawEnd(){
    isDrawing = false
    ctx.closePath()
}
function clear(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}


canvas.addEventListener("mousemove", draw)
window.addEventListener("mousedown", drawStart)
window.addEventListener("mouseup", drawEnd)
button1.addEventListener("click", guess)
button2.addEventListener("click", guess)
button2.addEventListener("click", clear)


function guess(){
    let scannedImage = ctx.getImageData(0,0,50,50);
    let imageData = scannedImage.data;
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