var maxSeen = 255;
var showTracing = false;
var iteration = 0;

var canvas;
var width;
var height;
var ctx;
var imageData;
var data;

var scale;
var pixelWidth;
var pixelHeight;
var pixelCount;
var pixels;
var off;
var seen;

var renderTime = new Avg(1000);
var calcTime = new Avg(1000);

function render() {
    var before = Date.now();

    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            var actualY = Math.floor(y / scale);
            var actualX = Math.floor(x / scale);
            var pixel = pixels[actualY * pixelWidth + actualX];
            var seenBefore = seen[actualY * pixelWidth + actualX];

            var index = (y * width + x) * 4;
            data[index + 0] = 255;
            data[index + 1] = 255;
            data[index + 2] = 255;

            if (showTracing && seenBefore) {
                var colour = maxSeen - seenBefore;
                data[index + 0] = 0;
                data[index + 1] = 0;
                data[index + 2] = colour;
            } 
            if (pixel) {
                data[index + 0] = 0;
                data[index + 1] = 0;
                data[index + 2] = 0;
            }
            data[index + 3] = 255;
        }
    };
    ctx.putImageData(imageData, 0, 0);

    var duration = Date.now() - before;
    renderTime.sample(duration);
    var fps = "calc: ~" + Math.round(calcTime.get()) + "ms, render: ~" + Math.round(renderTime.get()) + "ms, iterations: " + iteration;

    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(0, 0, 1000, 500);

    ctx.font = "20px Monaco";
    ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.shadowBlur = 1;
    ctx.fillStyle = "white";
    ctx.fillText(fps, 10, 25);
}

function tick() {   
    iteration += 1;
    var before = Date.now();

    for (var y = 0; y < pixelHeight; y++) {
        for (var x = 0; x < pixelWidth; x++) {
            var index = y * pixelWidth + x;
            var current = pixels[index];
            var neighbourCount = neighbours(x, y);
            if (current == 1 && neighbourCount < 2) {
                off[index] = 0;
            } else if (current == 1 && (neighbourCount == 2 || neighbourCount == 3)) {
                off[index] = 1;
                seen[index] = maxSeen;
            } else if (current == 1 && neighbourCount > 3) {
                off[index] = 0;
            } else if (current == 0 && neighbourCount == 3) {
                off[index] = 1;
                seen[index] = maxSeen;
            } else {
                off[index] = 0;
            }
            seen[index] = Math.max(0, seen[index] - 1);
        }
    }

    var newOff = pixels;
    pixels = off;
    off = newOff;

    var duration = Date.now() - before;
    calcTime.sample(duration);
}

function neighbours(x, y) {
    var count = 0;
    for (var deltaX = -1; deltaX <= 1; deltaX++) {
        for (var deltaY = -1; deltaY <= 1; deltaY++) {
            var newX = x + deltaX;
            var newY = y + deltaY;
            if (newX >= 0 && newX < pixelWidth && newY >= 0 && newY < pixelHeight) {
                if (!(deltaX == 0 && deltaY == 0)) {
                    var cell = pixels[newY * pixelWidth + newX];
                    if (cell >= 1) {
                        count += 1;
                    }
                }
            }
        }
    };
    return count;
}

function onLoad() {
    var canvas = $('#myCanvas').get(0);
    var container = $(canvas).parent();
    width = container.width();
    height = container.height();
    
    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);
    ctx = canvas.getContext("2d");
    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    data = imageData.data;

    initializeGame();

    setInterval(tick, 50);
    setInterval(function () { window.requestAnimationFrame(render); }, 10);
}

function initializeGame() {
    iteration      = 0;
    scale          = 2;
    pixelWidth     = width / scale;
    pixelHeight    = height / scale;
    pixelCount     = pixelWidth * pixelHeight;
    pixels         = new Array(pixelCount);
    off            = new Array(pixelCount);
    seen           = new Array(pixelCount);

    for (var i = 0; i < pixelCount; i++) {
        pixels[i] = 0;
        off[i]    = 0;
        seen[i]   = 0;
    };

    seed();
}

function seed() {
    var initialCount = 0.1 * pixelCount;
    for (var i = 0; i < initialCount; i++) {
        var randomX = Math.round(Math.random() * (pixelWidth  - 1));
        var randomY = Math.round(Math.random() * (pixelHeight - 1));
        pixels[randomY * pixelWidth + randomX] = 1;
    };
}

function toggleTracing() {
    showTracing = !showTracing;
}