
class Point2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
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

function remap(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

const attParams = ['sMax', 'sMin', 'bCol', 'sCol']; //add aType!
const mainParams = ['xWidth', 'yHeight', 'cSize']; //add display!
const detailParams = ['xPos', 'yPos', 'zoom'];
let sCol = "#4c0013", bCol = "#f9f6ee";

function initializeApp() {
    window.addEventListener('resize', resizeCanvas, false);
    resizeCanvas();
}

function recolor() {
    bCol = document.getElementById('bCol').value;
    sCol = document.getElementById('sCol').value;
    drawAttractor()
}

function resizeCanvas() {
    const mainCanvas = document.getElementById("mainView");
    mainCanvas.width = window.innerWidth;
    //mainCanvas.height = window.innerHeight;
    drawAttractor();
}

function drawAttractor() {
    const attractorCanvas = document.getElementById("attractorView");
    const actx = attractorCanvas.getContext("2d");
    const attVals = Array.from(attParams, x => document.getElementById(x).value);
    const sMax = attVals[0], sMin = attVals[1], xPos = attVals[2], yPos = attVals[3];
    const scale = 1, xos = 0, yos = 0;
    const x = attractorCanvas.width, y = attractorCanvas.height;

    //clear canvas
    actx.clearRect(0, 0, x, y);

    //attractor gradient
    const r = x > y ? x / 2 : y / 2;
    const gradient = actx.createRadialGradient(x / 2, y / 2, 0, x / 2, y / 2, 100);
    gradient.addColorStop(0, sCol);
    gradient.addColorStop(1, bCol);
    actx.fillStyle = gradient;
    actx.fillRect(0, 0, x, y);

    drawPattern();
}

function drawPattern() {
    const mainCanvas = document.getElementById("mainView");
    const mctx = mainCanvas.getContext("2d");
    const mainVals = Array.from(mainParams, x => document.getElementById(x).value);
    const pX = mainVals[0], pY = mainVals[1], cS = mainVals[2];
    const scale = 1, xos = 0, yos = 0;

    //calculate scale

    //clear canvas
    const x = mainCanvas.width, y = mainCanvas.height;
    mctx.resetTransform();
    mctx.clearRect(0, 0, x, y);
    mctx.fillStyle = bCol;
    mctx.fillRect(0, 0, x, y);

    //move to center
    const topLeft = new Point2D(x / 2 - pX / 2, y / 2 - pY / 2);
    mctx.translate(topLeft.x, topLeft.y);

    //draw panel
    mctx.lineWidth = "2";
    mctx.strokeStyle = sCol;
    mctx.rect(0, 0, pX, pY);
    mctx.stroke();

    //calculate grid
    const xCount = Math.round(pX / cS), yCount = Math.round(pY / cS);
    const xRes = pX / (xCount * 2), yRes = pY / (yCount * 2);
    const pC = new Point2D(pX / 2, pY / 2);
    const r = ((xRes + yRes) / Math.SQRT2) * 0.5
    const rMax = Math.sqrt(pX ** 2 + pY ** 2) / 2;
    var grid = [];
    for (let j = 0; j < yCount * 2 + 1; j++) {
        var vertexRow = [];
        for (let i = 0; i < xCount * 2 + 1; i++) {
            vertexRow.push(new Point2D(xRes * i, yRes * j));
        }
        grid.push(vertexRow);
    }

    var centers = [];
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

    //draw shapes
    mctx.lineWidth = "1";
    mctx.strokeStyle = sCol;
    for (i = 0; i < centers.length; i++) {
        mctx.beginPath();
        mctx.arc(centers[i].x, centers[i].y, r * (1 - calcDis(centers[i], pC) / rMax), 0, 2 * Math.PI); //
        mctx.stroke();
    }

    //draw annotations

    drawDetail();
}

function drawDetail() {
    const detailCanvas = document.getElementById("detailView");
    const dctx = detailCanvas.getContext("2d");
    const detailVals = Array.from(detailParams, x => document.getElementById(x).value);
    const scale = 1, xos = 0, yos = 0;

    //clear canvas
    dctx.clearRect(0, 0, detailCanvas.width, detailCanvas.height);
    dctx.fillStyle = bCol;
    dctx.fillRect(0, 0, 200, 200);

    //detail view
    dctx.lineWidth = "2";
    dctx.strokeStyle = sCol;
    dctx.beginPath();
    dctx.moveTo(100, 10);
    dctx.quadraticCurveTo(10, 100, 100, 190);
    dctx.stroke();
    dctx.moveTo(100, 10);
    dctx.quadraticCurveTo(190, 100, 100, 190);
    dctx.stroke();
}
