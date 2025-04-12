function setActiveTool(tool, button) {
    currentTool = tool;
    
    [anthillBtn, foodBtn, wallBtn, eraserBtn].forEach(btn => {btn.classList.remove('active');});
    
    button.classList.add('active');
}

function createPixelRGBA(r, g, b, a) {
    let pixel = {
        r: r,
        g: g,
        b: b,
        a: a
    }
    return pixel;
}

function createPixelColor(color) {
    if(color == "black") return createPixelRGBA(0, 0, 0, 255);
    else if(color == "green") return createPixelRGBA(0, 128, 0, 255);
    else if(color == "brown") return createPixelRGBA(165, 42, 42, 255);
    else if(color == "violet") return createPixelRGBA(238, 130, 238, 255);
    else if(color == "grey") return createPixelRGBA(128, 128, 128, 255);
    return createPixelRGBA(0, 0, 0, 255);
}

function getColorPixel(pixel) {
    // if(pixel.r == 0 && pixel.g == 0 && pixel.b == 0 && pixel.a == 255) return "black";
    if(pixel.r == 0 && pixel.g == 128 && pixel.b == 0 && pixel.a == 255) return "green";
    else if(pixel.r == 165 && pixel.g == 42 && pixel.b == 42 && pixel.a == 255) return "brown";
    // else if(pixel.r == 238 && pixel.g == 130 && pixel.b == 238 && pixel.a == 255) return "violet";
    else if(pixel.r == 128 && pixel.g == 128 && pixel.b == 128 && pixel.a == 255) return "grey";
    return "white";
}

function uploadChunk(world, anthillPixels, food, pixel, chunk_height, chunk_width, mouse_x, mouse_y) {
    for(let y = mouse_y; y < mouse_y + chunk_height; ++y) {
        if(y < 0) continue;
        else if(y > world.length - 1) break;

        for(let x = mouse_x; x < mouse_x + chunk_width; ++x) {
            if(x < 0) continue;
            else if(x > world[y].length - 1) break;

            let color_this = getColorPixel(world[y][x]);
            let color_pixel = getColorPixel(pixel);
            let position = JSON.stringify({y, x});

            if((color_pixel == "brown") || (color_pixel == "green")) {
                (color_pixel == "brown" ? anthillPixels.add(position) : food.set(position, SATIETY));
            }
            else if((color_pixel == "white") || (color_pixel == "grey")) {
                if(color_this == "brown") {
                    anthillPixels.delete(position);
                }
                else if(color_this == "green") {
                    food.delete(position);
                }
            }

            world[y][x] = pixel;
        }
    }
    return;
}

function drawPixel(e, matrix, size_pixel) {
    if(!currentTool) return;
    
    // Получаем координаты курсора относительно canvas
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);
    
    ctx.fillStyle = toolColors[currentTool];

    ctx.fillRect(x - size_pixel/2 - 3, y - size_pixel/2 - 3, size_pixel, size_pixel);
    uploadChunk(matrix, anthillPixels, food, createPixelColor(toolColors[currentTool]), size_pixel, size_pixel, x - size_pixel/2 - 3, y - size_pixel/2 - 3);

    return;
}