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
var pixels;
var off;

var dataPoints = [];

function render() {
	iteration += 1;
	var before = Date.now();

	for (var y = 0; y < height; y++) {
		for (var x = 0; x < width; x++) {
			var actualY = Math.floor(y / scale);
			var actualX = Math.floor(x / scale);
			var pixel = pixels[actualY * pixelWidth + actualX];
			var index = (y * width + x) * 4;
			data[index + 0] = pixel * 255;
			data[index + 1] = 0;
			data[index + 2] = 0;
			data[index + 3] = 255;
		}
	};
	ctx.putImageData(imageData, 0, 0);

	var sampleSize = 100;
	var duration = Date.now() - before;
	dataPoints.push(duration);
	if (dataPoints.length >= sampleSize) {
		dataPoints = dataPoints.slice(1, sampleSize);
	}
	var sum = 0;
	for(var i = 0; i < dataPoints.length; i++) {
		sum = sum + dataPoints[i];
	}
	var avg = sum / sampleSize;
	var fps = "render: ~" + Math.round(1000 / avg) + "fps, iterations: " + iteration;

	ctx.font = "20px Monaco";
	ctx.fillStyle = "grey";
	ctx.fillText(fps, 11, 26);
	ctx.fillStyle = "#00FF00";
	ctx.fillText(fps, 10, 25);
}

function tick() {	
	for (var y = 0; y < pixelHeight; y++) {
		for (var x = 0; x < pixelWidth; x++) {
			var index = y * pixelWidth + x;
			var current = pixels[index];
			var neighbourCount = neighbours(x, y);
			if (current == 1 && neighbourCount < 2) {
				off[index] = 0;
			} else if (current == 1 && (neighbourCount == 2 || neighbourCount == 3)) {
				off[index] = 1;
			} else if (current == 1 && neighbourCount > 3) {
				off[index] = 0;
			} else if (current == 0 && neighbourCount == 3) {
				off[index] = 1;
			} else {
				off[index] = 0;
			}
		}
	}

	var newOff = pixels;
	pixels = off;
	off = newOff;
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

function start() {
	scale = 1;
	var canvas = $('#myCanvas').get(0);
	width = canvas.width;
	height = canvas.height;
	ctx = canvas.getContext("2d");

	imageData = ctx.getImageData(0, 0, width, height);
	data = imageData.data;

	pixelWidth     = width / scale;
	pixelHeight    = height / scale;
	var pixelCount = pixelWidth * pixelHeight;
	pixels         = new Array(pixelCount);
	off            = new Array(pixelCount);

    for (var i = 0; i < pixelCount; i++) {
		pixels[i] = 0;
		off[i]    = 0;
	};
	var initialCount = 0.2 * pixelCount;
	for (var i = 0; i < initialCount; i++) {
		var randomX = Math.round(Math.random() * (pixelWidth  - 1));
		var randomY = Math.round(Math.random() * (pixelHeight - 1));
		pixels[randomY * pixelWidth + randomX] = 1;
	};

	setInterval(tick, 50);
	setInterval(function () { window.requestAnimationFrame(render); }, 10);
}