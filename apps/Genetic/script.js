const background_canvas = document.getElementById("backgroundCanvas");
const dynamic_canvas = document.getElementById("dynamicCanvas");
const startBtn = document.getElementById("startBtn");

const points = [];


background_canvas.addEventListener("click", function(event) {
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

    // console.log(`Point added at (${x.toFixed(0)}, ${y.toFixed(0)})`);
});


startBtn.addEventListener("click", () => {
    start(dynamic_canvas, points);
});




// const background_canvas = document.getElementById("backgroundCanvas");
// const dynamic_canvas = document.getElementById("dynamicCanvas");
// const startBtn = document.getElementById("startBtn");

// const points = [];

// background_canvas.addEventListener("click", function(event) {

//     const rect = background_canvas.getBoundingClientRect();
//     const x = event.clientX - rect.left;
//     const y = event.clientY - rect.top;

//     points.push({x, y});

//     const radius = 5;
//     const ctx = background_canvas.getContext("2d");

//     ctx.beginPath();
//     ctx.arc(x, y, radius, 0, Math.PI * 2);
//     ctx.fillStyle = "red";
//     ctx.fill();
    
//     console.log(`Point added at (${x.toFixed(0)}, ${y.toFixed(0)})`); // Для отладки
// });

// startBtn.addEventListener("click", () => {
//     if (points.length < 2) {
//         alert("Please add at least 2 points first");
//         return;
//     }
//     start(dynamic_canvas, points);
// });




// // const background_canvas = document.getElementById("backgroundCanvas");
// // const dynamic_canvas = document.getElementById("dynamicCanvas")

// // const startBtn = document.getElementById("startBtn");

// // const points = [];

// // background_canvas.addEventListener("click", function(event) {
// //     const rect = background_canvas.getBoundingClientRect();
// //     const x = event.clientX - rect.left;
// //     const y = event.clientY - rect.top;

// //     points.push({x, y});

// //     const radius = 5;
// //     const ctx = background_canvas.getContext("2d");
// //     ctx.beginPath();
// //     ctx.arc(x, y, radius, 0, Math.PI * 2);
// //     ctx.fillStyle = "red";
// //     ctx.fill();
// // });

// // startBtn.addEventListener("click", () => start(dynamic_canvas, points));