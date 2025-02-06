
class Point2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Filler {
    constructor() {
    }
    draw(context) {
        context.fill();
    }
}

class Stroker {
    constructor() {
    }
    draw(context) {
        context.stroke();
    }
}

//parameter
const mainParams = ['xNumber', 'yNumber', 'cSize', 'sMax', 'sMin', 'xPos', 'yPos', 'zoom', 'bCol', 'sCol', 'xAtt', 'yAtt', 'cScale'];
const defaultValues = [];
let mainValues = defaultValues;
let sCol = "#4c0013", bCol = "#f9f6ee";

//control buttons
var interval = null;
let offset = 0;

function intervalOn(dir) {
    clearInterval(interval);
    sSize = 10;
    switch (dir) {
        case "up":
            e = document.getElementById('yPos');
            offset = Number(e.value);
            s = -sSize;
            break;
        case "down":
            e = document.getElementById('yPos');
            offset = Number(e.value);
            s = sSize;
            break;
        case "left":
            e = document.getElementById('xPos');
            offset = Number(e.value);
            s = -sSize;
            break;
        case "right":
            e = document.getElementById('xPos');
            offset = Number(e.value);
            s = sSize;
            break;
    }
    interval = setInterval(move, 100, e, s);
}

function intervalOff() {
    clearInterval(interval);
}

function move(element, step) {
    offset += step;
    element.value = offset;
    resizeCanvas();
}

const downloadFile = () => {
    const link = document.createElement("a");
    const content = getParameters();
    const file = new Blob([content], { type: 'text/plain' });
    link.href = URL.createObjectURL(file);
    link.download = "parameters.json";
    link.click();
    URL.revokeObjectURL(link.href);
};

function mapRange(value, low, high) {
    return (low + (high - low) * value);
}

function calcAvg(p1, p2, p3, p4) {
    x = (p1.x + p2.x + p3.x + p4.x) / 4;
    y = (p1.y + p2.y + p3.y + p4.y) / 4;
    return new Point2D(x, y);
}

function calcDis(p1, p2) {
    d = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
    return d;
}

function calcHorDis(p1) {
    d = Math.abs(p1.y);
    return d;
}

function calcVerDis(p1) {
    d = Math.abs(p1.x);
    return d;
}

function initializeApp() {
    window.addEventListener('resize', resizeCanvas, false);

    const trackDet = document.getElementById("detailView");
    trackDet.addEventListener("mousedown", function (e) {
        scale = getMousePosition(trackDet, e);
        document.getElementById('cScale').value = mapRange(scale.x, 0.5, 2.0);
        resizeCanvas();
    });

    const trackAtt = document.getElementById("attractorView");
    trackAtt.addEventListener("mousedown", function (e) {
        offset = getMousePosition(trackAtt, e);
        document.getElementById('xAtt').value = (offset.x - 0.5) * 2;
        document.getElementById('yAtt').value = (offset.y - 0.5) * 2;
        resizeCanvas();
    });

    document.getElementById('import')
        .addEventListener('change', function () {

            let fr = new FileReader();
            fr.onload = function () {
                setParameters(fr.result);
            }
            fr.readAsText(this.files[0]);
        })

    resizeCanvas();
}

function getMousePosition(element, event) {
    let rect = element.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    console.log("Coordinate x: " + x,
        "Coordinate y: " + y);
    const scale = new Point2D(x / rect.width, y / rect.height);
    return scale;
}

function resizeCanvas() {
    console.log("update called")
    const mainCanvas = document.getElementById("mainView");
    mainCanvas.width = window.innerWidth;
    mainCanvas.height = window.innerHeight;
    mainValues = Array.from(mainParams, x => document.getElementById(x).value);
    bCol = mainValues[8];
    sCol = mainValues[9];
    drawAttractor();
}

function canvasArrow(context, fromx, fromy, tox, toy) {
    var headlen = 10;
    var dx = tox - fromx;
    var dy = toy - fromy;
    var angle = Math.atan2(dy, dx);
    context.beginPath();
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    context.moveTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    context.stroke();
}

function drawAttractor() {
    const attractorCanvas = document.getElementById("attractorView");
    const actx = attractorCanvas.getContext("2d");
    const x = attractorCanvas.width, y = attractorCanvas.height;
    const xDomain = (Number(mainValues[10]) + 1) / 2, yDomain = (Number(mainValues[11]) + 1) / 2;
    const xCenter = xDomain * x, yCenter = yDomain * y;
    actx.clearRect(0, 0, x, y);

    attractor = "rad";
    var selector = document.querySelector('input[name="aType"]:checked');
    if (selector) {
        attractor = selector.value;
    }
    switch (attractor) {
        case "rad":
            const r = x > y ? x : y;
            const gradient = actx.createRadialGradient(xCenter, yCenter, 0, xCenter, yCenter, r);
            gradient.addColorStop(0, sCol);
            gradient.addColorStop(1, bCol);
            actx.scale(1, 1);
            actx.fillStyle = gradient;
            actx.fillRect(0, 0, x, y);
            break;
        case "ver":
            const vgrad = actx.createLinearGradient(0, 0, x, 0);
            vgrad.addColorStop(0, bCol);
            vgrad.addColorStop(xDomain, sCol);
            vgrad.addColorStop(1, bCol);
            actx.scale(1, 1);
            actx.fillStyle = vgrad;
            actx.fillRect(0, 0, x, y);
            break;
        case "hor":
            const hgrad = actx.createLinearGradient(0, 0, 0, y);
            hgrad.addColorStop(0, bCol);
            hgrad.addColorStop(yDomain, sCol);
            hgrad.addColorStop(1, bCol);
            actx.scale(1, 1);
            actx.fillStyle = hgrad;
            actx.fillRect(0, 0, x, y);
            break;
        case "crv":
            const ugradient = actx.createRadialGradient(x / 2, 0, 0, x / 2, 0, y);
            ugradient.addColorStop(0, bCol);
            ugradient.addColorStop(0.5, sCol);
            ugradient.addColorStop(1, bCol);
            actx.save(),
                actx.scale(1, 1.5);
            actx.fillStyle = ugradient;
            actx.fillRect(0, 0, x, y);
            actx.restore();
            break;
    }

    drawPattern();
}

function drawPattern() {
    const mainCanvas = document.getElementById("mainView");
    const mctx = mainCanvas.getContext("2d");
    const sMin = Number(mainValues[3]), sMax = Number(mainValues[4]), xPos = Number(mainValues[5]), yPos = Number(mainValues[6]), zoom = Number(mainValues[7]), xAtt = Number(mainValues[10]), yAtt = Number(mainValues[11]), cScale = Number(mainValues[12]);
    let pX = mainValues[0], pY = mainValues[1], cS = mainValues[2];

    const sOf = document.getElementById("panel").checked;

    let centers = [];
    let factors = [];

    //calculate scale
    const x = mainCanvas.width, y = mainCanvas.height;
    const scale = x / y > pX / pY ? y / pY * 0.8 : x / pX * 0.8;
    pX = pX * scale * zoom;
    pY = pY * scale * zoom;
    cS = cS * scale * zoom;

    //clear canvas
    mctx.resetTransform();
    mctx.clearRect(0, 0, x, y);
    mctx.fillStyle = bCol;
    mctx.fillRect(0, 0, x, y);

    //move to center
    const topLeft = new Point2D(x / 2 - pX / 2, y / 2 - pY / 2);
    mctx.translate(topLeft.x + xPos * zoom, topLeft.y + yPos * zoom);

    //draw panel
    if (sOf) {
        mctx.save();
        mctx.shadowColor = "black";
        mctx.shadowBlur = 20;
        mctx.shadowOffsetX = 10;
        mctx.shadowOffsetY = 10;
        mctx.lineWidth = "2";
        mctx.fillStyle = sCol;
        mctx.fillRect(0, 0, pX, pY);
        mctx.restore();
    }

    //calculate grid
    const xCount = Math.round(pX / cS), yCount = Math.round(pY / cS);
    const xRes = pX / (xCount * 2), yRes = pY / (yCount * 2);
    const pC = new Point2D(pX / 2 + xAtt * pX * 0.5, pY / 2 + yAtt * pY * 0.5);
    const r = ((xRes + yRes) / Math.SQRT2) * 0.5
    const rMax = Math.sqrt(pX ** 2 + pY ** 2); //changed to x2 with attractor relocation
    var grid = [];
    for (let j = 0; j < yCount * 2 + 1; j++) {
        var vertexRow = [];
        for (let i = 0; i < xCount * 2 + 1; i++) {
            vertexRow.push(new Point2D(xRes * i, yRes * j));
        }
        grid.push(vertexRow);
    }

    for (let j = 1; j < yCount * 2; j += 2) {
        for (let i = 1; i < xCount * 2; i += 2) {
            centers.push(calcAvg(grid[j - 1][i], grid[j][i - 1], grid[j + 1][i], grid[j][i + 1]));
        }
    }
    for (let j = 2; j < yCount * 2 - 1; j += 2) {
        for (let i = 2; i < xCount * 2 - 1; i += 2) {
            centers.push(calcAvg(grid[j - 1][i], grid[j][i - 1], grid[j + 1][i], grid[j][i + 1]));
        }
    }

    //draw grid
    if (document.getElementById("grid").checked) {
        mctx.lineWidth = "1";
        mctx.strokeStyle = sOf ? bCol : sCol;
        for (let j = 1; j < yCount * 2; j += 2) {
            for (let i = 1; i < xCount * 2; i += 2) {
                mctx.beginPath();
                mctx.moveTo(grid[j - 1][i].x, grid[j - 1][i].y);
                mctx.lineTo(grid[j][i - 1].x, grid[j][i - 1].y);
                mctx.lineTo(grid[j + 1][i].x, grid[j + 1][i].y);
                mctx.lineTo(grid[j][i + 1].x, grid[j][i + 1].y);
                mctx.lineTo(grid[j - 1][i].x, grid[j - 1][i].y);
                mctx.stroke();
            }
        }
    }
    //calculate radius factor
    let attractor = "rad";
    var selector = document.querySelector('input[name="aType"]:checked');
    if (selector) {
        attractor = selector.value;
    }
    switch (attractor) {
        case "rad":
            for (i = 0; i < centers.length; i++) {
                let f1 = (calcDis(centers[i], pC) / rMax);
                factors.push(mapRange(f1, sMin, sMax));
            }
            break;
        case "ver":
            h = pX * 0.5;
            for (i = 0; i < centers.length; i++) {
                let f2 = (Math.abs(h - centers[i].x) / h);
                factors.push(mapRange(f2, sMin, sMax));
            }
            break;
        case "hor":
            w = pY * 0.5;
            for (i = 0; i < centers.length; i++) {
                let f3 = (Math.abs(w - centers[i].y) / w);
                factors.push(mapRange(f3, sMin, sMax));
            }
            break;
        case "crv":
            const f = x > y ? y : x;
            for (i = 0; i < centers.length; i++) {
                dis = calcDis(new Point2D(centers[i].x / pX * f, centers[i].y / pY * f * 0.666), new Point2D(f / 2, 0));
                f4 = (Math.abs(dis - f * 0.5) / (f * 0.5));
                factors.push(mapRange(f4, sMin, sMax));
            }
            break;
    }

    //draw shapes
    if (document.getElementById("contour").checked) {
        let shape = "eye"
        selector = document.querySelector('input[name="shape"]:checked');
        if (selector) {
            shape = selector.value;
        }
        mctx.lineWidth = "1";
        mctx.strokeStyle = sCol;
        mctx.fillstyle = bCol;
        var drawAgent = sOf ? new Filler() : new Stroker();
        switch (shape) {
            case "circle":
                for (i = 0; i < centers.length; i++) {
                    mctx.beginPath();
                    mctx.ellipse(centers[i].x, centers[i].y, r * factors[i] * 0.9, r * factors[i] * 0.9, 0, 0, 2 * Math.PI);
                    drawAgent.draw(mctx);
                }
                break;
            case "eye":
                for (i = 0; i < centers.length; i++) {
                    rf = factors[i] * r;
                    mctx.beginPath();
                    mctx.moveTo(centers[i].x, centers[i].y - rf);
                    mctx.quadraticCurveTo(centers[i].x - rf * cScale, centers[i].y, centers[i].x, centers[i].y + rf);
                    mctx.quadraticCurveTo(centers[i].x + rf * cScale, centers[i].y, centers[i].x, centers[i].y - rf);
                    drawAgent.draw(mctx);
                }
                break;
            case "drop":
                for (i = 0; i < centers.length; i++) {
                    rf = factors[i] * r;
                    mctx.beginPath();
                    mctx.moveTo(centers[i].x, centers[i].y - rf);
                    mctx.quadraticCurveTo(centers[i].x - rf, centers[i].y + rf, centers[i].x, centers[i].y + rf);
                    mctx.quadraticCurveTo(centers[i].x + rf, centers[i].y + rf, centers[i].x, centers[i].y - rf);
                    drawAgent.draw(mctx);
                }
                break;
            case "heart":
                for (i = 0; i < centers.length; i++) {
                    rf = factors[i] * r;
                    mctx.beginPath();
                    mctx.moveTo(centers[i].x, centers[i].y - 0.1 * rf);
                    mctx.bezierCurveTo(centers[i].x - 0.4 * rf, centers[i].y - rf, centers[i].x - rf, centers[i].y + 0.4 * rf, centers[i].x, centers[i].y + rf);
                    mctx.bezierCurveTo(centers[i].x + rf, centers[i].y + 0.4 * rf, centers[i].x + 0.4 * rf, centers[i].y - rf, centers[i].x, centers[i].y - 0.1 * rf);
                    drawAgent.draw(mctx);
                }
                break;
        }
    }

    //draw annotations
    if (document.getElementById("dim").checked) {
        mctx.font = "20px Roboto";
        mctx.fillStyle = sCol;
        mctx.fillText(mainValues[0] + " mm", pX / 2 - 40, -40);
        mctx.rotate(-0.5 * Math.PI);
        mctx.fillText(mainValues[1] + " mm", -pY / 2 - 40, -40);
        mctx.rotate(0.5 * Math.PI);
        mctx.lineWidth = "1";
        canvasArrow(mctx, -20, pY / 2, -20, 0);
        canvasArrow(mctx, -20, pY / 2, -20, pY);
        canvasArrow(mctx, pX / 2, -20, 0, -20);
        canvasArrow(mctx, pX / 2, -20, pX, -20);
    }

    drawDetail(centers.length);
}

function drawDetail(nC) {
    const detailCanvas = document.getElementById("detailView");
    const dctx = detailCanvas.getContext("2d");
    const cScale = Number(mainValues[12]);
    let dim = 100, rf = dim * 0.9;

    //clear canvas
    dctx.clearRect(0, 0, detailCanvas.width, detailCanvas.height);
    dctx.fillStyle = bCol;
    dctx.fillRect(0, 0, dim * 2, dim * 2);

    //detail view
    dctx.lineWidth = "2";
    dctx.strokeStyle = sCol;

    let shape = "eye"
    var selector = document.querySelector('input[name="shape"]:checked');
    if (selector) {
        shape = selector.value;
    }
    dctx.lineWidth = "4";
    dctx.strokeStyle = sCol;
    switch (shape) {
        case "circle":
            dctx.beginPath();
            dctx.ellipse(dim, dim, rf, rf, 0, 0, 2 * Math.PI);
            dctx.stroke();
            break;
        case "eye":
            dctx.beginPath();
            dctx.moveTo(dim, dim - rf);
            dctx.quadraticCurveTo(dim - rf * cScale, dim, dim, dim + rf);
            dctx.quadraticCurveTo(dim + rf * cScale, dim, dim, dim - rf);
            dctx.stroke();
            break;
        case "drop":
            dctx.beginPath();
            dctx.moveTo(dim, dim - rf);
            dctx.quadraticCurveTo(dim - rf, dim + rf, dim, dim + rf);
            dctx.quadraticCurveTo(dim + rf, dim + rf, dim, dim - rf);
            dctx.stroke();
            break;
        case "heart":
            dctx.beginPath();
            dctx.moveTo(dim, dim);
            dctx.bezierCurveTo(dim - 0.5 * rf, dim - rf, dim - rf, dim + 0.3 * rf, dim, dim + rf);
            dctx.bezierCurveTo(dim + rf, dim + 0.3 * rf, dim + 0.5 * rf, dim - rf, dim, dim);
            dctx.stroke();
            break;
    }
    //draw annotations
    if (document.getElementById("dim").checked) {
        dctx.font = "20px Roboto";
        dctx.fillStyle = sCol;
        dctx.fillText(mainValues[2] + " mm", dim - 35, dim + 35);
        dctx.fillText("x" + nC, 10, dim * 2 - 10)
        dctx.lineWidth = "1";
        canvasArrow(dctx, dim, dim + 40, 0, dim + 40);
        canvasArrow(dctx, dim, dim + 40, dim * 2, dim + 40);
    }
}

function dimensionUpdate() {
    const ex = document.getElementById('xNumber'), ey = document.getElementById('yNumber');
    let x = ex.value, y = ey.value;
    if (x < 200) { x = 200; ex.value = 200; }
    else if (x > 2000) { x = 2000; ex.value = 2000; }
    if (y < 200) { y = 200; ey.value = 200; }
    else if (y > 2000) { y = 2000; ey.value = 2000; }
    document.getElementById('yHeight').value = y;
    document.getElementById('xWidth').value = x;
    resizeCanvas();
}

function resetValues() {
    /*
    for (i = 0; i < mainParams.length; i++) {
        document.getElementById(mainParams[i]).value = defaultValues[i];
    }
    */
    resizeCanvas();
}

function getParameters() {
    let attractor = "rad";
    var selector = document.querySelector('input[name="aType"]:checked');
    if (selector) {
        attractor = selector.value;
    }
    let shape = "eye"
    selector = document.querySelector('input[name="shape"]:checked');
    if (selector) {
        shape = selector.value;
    }
    const txt = JSON.stringify({ mP: mainParams, mV: mainValues, a: attractor, s: shape });
    return txt;
}

function setParameters(txt) {
    const obj = JSON.parse(txt);
    for (i = 0; i < obj.mP.length; i++) {
        console.log(obj.mP[i], obj.mV[i]);
        document.getElementById(obj.mP[i]).value = obj.mV[i];
    }
    document.configurator.shape.value = obj.s;
    document.configurator.aType.value = obj.a;
    dimensionUpdate();
}

function toggleFunction(className) {
    let para = document.getElementById(className);
    para.classList.toggle("hidden");
}
