const background_canvas = document.getElementById("backgroundCanvas");
const dynamic_canvas = document.getElementById("dynamicCanvas");
const startBtn = document.getElementById("startBtn");

const points = [];

var CAN_DRAW = true;

background_canvas.addEventListener("click", function(event) {
    if(!CAN_DRAW) return;

    const rect = background_canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    points.push({x, y});

    
    const ctx = background_canvas.getContext("2d");
    const radius = 5;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
});


startBtn.addEventListener("click", () => {
    start(dynamic_canvas, points);
});