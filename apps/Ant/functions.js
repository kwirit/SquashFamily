function setActiveTool(tool, button) {
    currentTool = tool;
    
    [anthillBtn, foodBtn, wallBtn].forEach(btn => {btn.classList.remove('active');});
    
    button.classList.add('active');
}

function drawPixel(e) {
    if(!currentTool || (currentTool == "anthill" && anthill)) return;
    
    // Получаем координаты курсора относительно canvas
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.fillStyle = toolColors[currentTool];
    
    if(currentTool == "anthill") {
        ctx.fillRect(x, y, 30, 30);
        anthill = true;
        console.log(x, y);
    }

    ctx.fillRect(x, y, 10, 10);

    return;
}


