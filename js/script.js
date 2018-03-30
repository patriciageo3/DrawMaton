window.onload = function() {   
    let cv = document.getElementById("draw");
    let ctx = cv.getContext("2d");
    let cvBg = document.getElementById("bgDraw");
    let ctxBg = cvBg.getContext("2d"); 
    ctx.lineWidth = 100;
    let mouseDown = false;
    let mode = "brush";
    let x;
    let y;
    let hue = 0;
    let lineDirection = true;
    let eraseButton = document.getElementById("eraseMe");
    let brushButton = document.getElementById("brush"); 
    let saveButton = document.getElementById("saveMe");
    let clearButton = document.getElementById("clearMe");
    let defBrushColor = true;
    let defWidth = true;
    let currentBgColor = "#ffffff";
    let brushColorInput = document.getElementById("brushColor");
    let bgColorInput = document.getElementById("bgColor");
    let sizeInput = document.getElementById("brushSize");
    let sizeRange = document.getElementById("size");
    let defaults = document.querySelectorAll("p.default");
    
    function resizeCanvas() {
        let rect = cv.getBoundingClientRect();
        cv.width = rect.width;
        cv.height = rect.height;
        let rect2 = cvBg.getBoundingClientRect();
        cvBg.width = rect.width;
        cvBg.height = rect.height;
    }
    
    //default brush color to follow the colors of rainbow dynamically:
    function defaultBrushColor() {
        ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
        ++hue;
        if (hue >= 360) {
            hue = 0;
        }
    }
    
    function changeBrushColor() {
        defBrushColor = false;
    }
    
    function useCurrentBgColor() {
        ctxBg.fillStyle =  currentBgColor;
        ctxBg.fillRect(0, 0, cv.width, cv.height);
    }
    
    function updateBgColor() {
        currentBgColor = this.value || "#ffffff";
        useCurrentBgColor();
        return currentBgColor;
    }  
    
    //default brush size to go from 100 to 1 and reverse dynamically:
    function defaultLineWidth() {
        if (ctx.lineWidth >= 100 || ctx.lineWidth <= 1) {
            lineDirection = !lineDirection;
        }
        if (lineDirection) {
            ++ctx.lineWidth;
        } else {
            --ctx.lineWidth;
        }
    }
    
    function customWidth() {
        defWidth = false;
    }
    
    //brush/ erase main mechanism:
    function draw(e) {
        if (!mouseDown) return;
        ctx.beginPath();
        //corners should be rounded:
        ctx.lineJoin = "round"; 
        //end of line should be rounded:
        ctx.lineCap = "round"; 
        defWidth ? defaultLineWidth() : ctx.lineWidth =  sizeInput.value; 
        
        if (mode === "brush") {
            ctx.globalCompositeOperation="source-over";
            defBrushColor ? defaultBrushColor() :  ctx.strokeStyle = brushColorInput .value;             
        } else {
            ctx.globalCompositeOperation = "destination-out";
            ctx.strokeStyle = "rgba(0,0,0, 1)";            
        }
 
        ctx.moveTo(x, y);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        [x, y] = [e.offsetX, e.offsetY];   
    }
    
    resizeCanvas();
    
    function activateEraser() {
        mode = "eraser"; 
        eraseButton.classList.add("activated");
        brushButton.classList.remove("activated");
    }
    
    function activateBrush() {
        mode = "brush";
        eraseButton.classList.remove("activated");
        brushButton.classList.add("activated");
    }
    
    function clearCanvas(){
        //restore globalCompositeOperation in case eraser was used last
        ctx.globalCompositeOperation="source-over"; 
        ctx.clearRect(0, 0, cv.width, cv.height);
        useCurrentBgColor();
    }
    
    function saveImg() { 
        //restore globalCompositeOperation in case eraser was used last
        ctx.globalCompositeOperation="source-over"; 
        ctxBg.drawImage(cv, 0, 0);
        ctx.drawImage(cvBg, 0, 0);
        let dataUrl = cv.toDataURL('image/png');
        saveButton.href = dataUrl;
        saveButton.download = 'myDrawing.png';
        saveButton.click();
    }
    
    useCurrentBgColor();
    
    cv.addEventListener("mousemove", draw);
    cv.addEventListener("mousedown", e => {
        mouseDown = true;
        [x, y] = [e.offsetX, e.offsetY];
    });
    cv.addEventListener("mouseup", () => mouseDown = false);
    cv.addEventListener("mouseout", () => mouseDown = false);
    
    eraseButton.addEventListener("click", activateEraser);
    brushButton.addEventListener("click", activateBrush); 
    saveButton.addEventListener("click", saveImg);
    clearButton.addEventListener("click", clearCanvas); 
    
    brushColorInput.addEventListener("change", changeBrushColor);
    bgColorInput.addEventListener("change", updateBgColor);
    sizeInput.addEventListener("change", customWidth);
    sizeRange.addEventListener("change", customWidth);
    
    //restore defaults:
    defaults[0].addEventListener("click", () => defBrushColor = true);
    defaults[1].addEventListener("click", updateBgColor);
    defaults[2].addEventListener("click", () => defWidth = true);
    
    window.addEventListener("resize", function() {
        resizeCanvas();
        useCurrentBgColor();
    });    
};

    function checkEven(nb) {
        return nb % 2 === 0;
    }

    //display text with dynamic font-size to show the dynamics of the default lineWidth (brush/eraser size):
    function waveTheText(pix) {
        let leParent = document.getElementsByClassName("default")[2];
        let txt = leParent.textContent.trim();
        let fontS = pix;
     
        let size = "bigToSmall";
        let length = txt.length;
        let isEven, half, indMiddle, step;

        for (let i = 0; i < txt.length; ++i) {
            let child = document.createElement("span");
            child.textContent = txt[i];
            step = Math.round(pix / half);
            
            (checkEven(length)) ? isEven = true : isEven = false;
            if (!isEven) {
                indMiddle = Math.floor(length / 2);
                half = indMiddle + 1;
                
                if (i === half) {
                    size = "smallToBig";
                }
                
                if (i > 0 && size === "bigToSmall") {
                    fontS -= step;
                } else if (size === "smallToBig") {
                    fontS += step;
                } 
            } else {
                indMiddle = length / 2 - 1;
                half = length / 2;
                
                if (i === half) {
                    size = "smallToBig";
                }
                
                if (i > 0 && size === "bigToSmall") {
                    fontS -= step;
                } else if (i === half) {
                    fontS = fontS;
                } else if (size === "smallToBig") {
                    fontS += step;
                } 
            }
            
            if (fontS <= 0) fontS = 1;
            
            if (i === 0) {
                child.style.fontSize = fontS + "px";
                leParent.innerHTML = child.outerHTML;
                continue;
            } 
            child.style.fontSize = fontS + "px";
            leParent.appendChild(child);
        } 
    } 
    
    waveTheText(16);
    