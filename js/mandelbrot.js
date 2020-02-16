let windowHeight = window.innerHeight;
let canvasSize = parseInt(windowHeight * 0.8);
let canv = document.getElementById("canvas");
canv.width = canvasSize;
canv.height = canvasSize;
let ctx = canv.getContext("2d");
let imgdata = ctx.getImageData(0,0, canvasSize, canvasSize);
let imgdatalen = imgdata.data.length;
let shift = {x: -0.5, y: 0};
let x1 = -2.5;
let y1 = 2.5;
let maxIters = 100;
let zoomSpeed = 0.1;
let stripes = {
	'r': false,
	'g': false,
	'b': false
}

//make webm videowriter object
var videoWriter = new WebMWriter({
    quality: 0.98,
    fileWriter: null,
    fd: null,
    frameDuration: 50,
    frameRate: null,
});

//prevent menu when clicking canvas with right mouse button
canv.oncontextmenu = function (e) {
    e.preventDefault();
};

//download current canvas image
var downloadBtn = document.getElementById('downloadButton');
downloadBtn.addEventListener('click', function (e) {
    var dataURL = canv.toDataURL('image/png');
    downloadBtn.href = dataURL;
});

var zoomInBtn = document.getElementById('zoomInButton');
zoomInBtn.addEventListener('click', function (e) {
    Zoom(zoomSpeed);
});

var makeVideoBtn = document.getElementById('makeVideoButton');
makeVideoBtn.addEventListener('click', function (e) {
	videoWriter.complete().then(function(webMBlob) {
		$("video").attr("src", URL.createObjectURL(webMBlob));
	});
});

var resetBtn = document.getElementById('resetButton');
resetBtn.addEventListener('click', function (e) {
	location.reload();
});

//detect mouse click on canvas
const canvas = document.querySelector('canvas')
canvas.addEventListener('mousedown', function(e) {
    let mousePos = getCursorPosition(canvas, e);
	MouseMove(mousePos, e.button);
})

//function called by stripes checkboxes
function EnableStripes(rgb) {
	let checkBox = document.getElementById(rgb + "Stripes");
	stripes[rgb] = checkBox.checked;
}

//getting slider elements
var rMinSlider = document.getElementById("RedMinSlider");
var gMinSlider = document.getElementById("GreenMinSlider");
var bMinSlider = document.getElementById("BlueMinSlider");
var rMaxSlider = document.getElementById("RedMaxSlider");
var gMaxSlider = document.getElementById("GreenMaxSlider");
var bMaxSlider = document.getElementById("BlueMaxSlider");

let rMinVal = document.getElementById("rMinValue");
let gMinVal = document.getElementById("gMinValue");
let bMinVal = document.getElementById("bMinValue");
let rMaxVal = document.getElementById("rMaxValue");
let gMaxVal = document.getElementById("gMaxValue");
let bMaxVal = document.getElementById("bMaxValue");

let rMin = parseInt(rMinSlider.value);
let gMin = parseInt(gMinSlider.value);
let bMin = parseInt(bMinSlider.value);
let rMax = parseInt(rMaxSlider.value);
let gMax = parseInt(gMaxSlider.value);
let bMax = parseInt(bMaxSlider.value);

UpdateSliderValue(rMinVal, rMinSlider.value);
UpdateSliderValue(gMinVal, gMinSlider.value);
UpdateSliderValue(bMinVal, bMinSlider.value);
UpdateSliderValue(rMaxVal, rMaxSlider.value);
UpdateSliderValue(gMaxVal, gMaxSlider.value);
UpdateSliderValue(bMaxVal, bMaxSlider.value);

rMinSlider.oninput = function() {
	let val = rMinSlider.value;
	rMin = parseInt(val);
	UpdateSliderValue(rMinVal, val);
}
gMinSlider.oninput = function() {
	let val = gMinSlider.value;
	gMin = parseInt(val);
	UpdateSliderValue(gMinVal, val);
}
bMinSlider.oninput = function() {
	let val = bMinSlider.value;
	bMin = parseInt(val);
	UpdateSliderValue(bMinVal, val);
}
rMaxSlider.oninput = function() {
	let val = rMaxSlider.value;
	rMax = parseInt(val);
	UpdateSliderValue(rMaxVal, val);
}
gMaxSlider.oninput = function() {
	let val = gMaxSlider.value;
	gMax = parseInt(val);
	UpdateSliderValue(gMaxVal, val);
}
bMaxSlider.oninput = function() {
	let val = bMaxSlider.value;
	bMax = parseInt(val);
	UpdateSliderValue(bMaxVal, val);
}

function UpdateSliderValue(valElement, value) {
	valElement.innerHTML = value + ".";
}

//map numbers (e.g. 0-1 -> 0-255)
const Map = (num, in_min, in_max, out_min, out_max) => {
	return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function Zoom(zoomSpd) {
    let zoomAmount = x1 * zoomSpd;
	let maxItersIncreaseAmount = 2;
    y1 += zoomAmount;
    x1 -= zoomAmount;
	maxIters += maxItersIncreaseAmount;
	videoWriter.addFrame(canv);
}

//move and zoom with mouse 0 and 1
function MouseMove(mousePos, button) {
	if(button == 0) {
		//shift with left mouse button
		let center = canvasSize / 2;
		let distanceFromCenterX = Math.abs(center - mousePos.x);
		let distanceFromCenterY = Math.abs(center - mousePos.y);
		let shiftScaleX = Map(distanceFromCenterX, 0, center, 0, y1);
		let shiftScaleY = Map(distanceFromCenterY, 0, center, 0, y1);
		if(mousePos.x < center) { shiftScaleX *= -1; }
		if(mousePos.y < center) { shiftScaleY *= -1; }
		shift.x += shiftScaleX;
		shift.y += shiftScaleY;	
		videoWriter.addFrame(canv);		
	} else if(button == 2) {
		//zoom with right mouse button
		Zoom(zoomSpeed);
	}
}

function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
	let mousePos = {x, y};
	return mousePos;
}

//calculate mandelbrot set image
setInterval(Main, 150);
function Main() {	
	for(let y = 0; y < canvasSize; y++) {
		for(let x = 0; x < canvasSize; x++) {
			
			let a = Map(x, 0, canvasSize, x1, y1);
            let b = Map(y, 0, canvasSize, x1, y1);
			
			a += shift.x;
			b += shift.y;
			
			let pa = a;
			let pb = b;
			let nIters = 0;
			
			while (nIters < maxIters) {
				let aa = a * a - b * b;
				let bb = 2 * a * b;
				a = aa + pa;
				b = bb + pb;
				
				//out of mandelbrot set
				if (a * a + b * b > 8) {
					break;
				}
				
				nIters++;
			}
			
			let colorR = Map(nIters, 0, maxIters, rMin, rMax);
			let colorG = Map(nIters, 0, maxIters, gMin, gMax);
			let colorB = Map(nIters, 0, maxIters, bMin, bMax);
			let colorA = 255;
			
			//"stripes" effect
			if(nIters % 2 == 0 && nIters < maxIters - 85) {
				if(stripes.r) { colorR = 255; }
				if(stripes.g) { colorG = 255; }
				if(stripes.b) { colorB = 255; }
			}
			
			//in mandelbrot set
			if (nIters == maxIters) {
				colorR = 0;
				colorG = 0;
				colorB = 0;
				colorA = 255;
			}
			
			let offset = (canvasSize * 4 * y) + x * 4;
			imgdata.data[offset] 	 = colorR;
			imgdata.data[offset + 1] = colorG;
			imgdata.data[offset + 2] = colorB;
			imgdata.data[offset + 3] = colorA;
		}
	}
	
	ctx.putImageData(imgdata,0,0);
}
