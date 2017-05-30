var Vector = function(x,y,z) {
	this.x = x;
	this.y = y;
	this.z = z;
	this.dobutok = function(b) {
		return this.x * b.x + this.y * b.y + this.z * b.z;
	}
	this.plus = function(b) {
		return new Vector(b.x + this.x, b.y + this.y, b.z + this.z);
	}
	this.minus = function(b) {
		return new Vector(this.x - b.x, this.y - b.y, this.z - b.z);
	}
	this.reverse = function() {
		return new Vector(-this.x, -this.y, -this.z);
	}
	this.multiply = function(alpha) {
		return new Vector(this.x*alpha, this.y*alpha, this.z * alpha);
	}
	this.length = function() {
		return Math.sqrt((this.x) * (this.x)
			            + (this.y) * (this.y)
			            + (this.z) * (this.z));
	}
	this.dist = function(B) {
		return B.minus(this).length();
	}
}
//-----------------------------------------------------------------
var Point = function(coord, normal, color) {
	this.coord = coord;
	this.normal = normal;
	this.color = color;
	this.width = 5;
	this.draw = function(lights) {
		var oldStyle = ctx.fillStyle;

		var color = GetCOlorwithLight(lights, this)

		ctx.fillStyle = generateColor(color);
		var z = get2dCoords(this.coord);
		ctx.fillRect(z.x-this.width/2, z.y-this.width/2,this.width,this.width);
		ctx.fillStyle = oldStyle;
	}
	this.clear = function() {
		var oldStyle = ctx.fillStyle;
		ctx.fillStyle = "#fff";
		var z = get2dCoords(this.coord);
		ctx.fillRect(z.x-this.width, z.y-this.width,this.width*2,this.width*2);
		ctx.fillStyle = oldStyle;
	}
}
//-----------------------------------------------------------------
//-----Constants---------------------------------------------------
var RED = new Vector(255,0,0);
var GREEN = new Vector(0,255, 0);
var BLUE = new Vector(0,0,255);
var GRAY = new Vector(1,1,1);
var WHITE = GRAY.multiply(255);
var BLACK = GRAY.plus(new Vector(-1,-1,-1));
var center = new Vector(200, 200,0);
var mashtab = new Vector(30,30,30);
//------FUNCTIONS--------------------------------------------------
var get2dCoords = function(coord) {
	var x = coord.x*mashtab.x;
	var y = coord.y*mashtab.y;
	var z = coord.z*mashtab.z;
	var resx = center.x + (y - x) * Math.sqrt(3) /2;
	var resy = center.y + (x + y) / 2 - z;
	return new Vector(resx, resy, 0);
}

var generateColor = function(color) {
	var r = (Math.round(color.x) <= 255) ? Math.round(color.x) : 255;
	var g = (Math.round(color.y) <= 255) ? Math.round(color.y) : 255;
	var b = (Math.round(color.z) <= 255) ? Math.round(color.z) : 255;
	return "rgb(" + r + ", " 
	              + g + ", " 
	              + b + ")";
}

var drawLine = function(p1, p2, color, size) {
	var z1 = get2dCoords(p1.coord);
	var z2 = get2dCoords(p2.coord);
	ctx.strokeStyle = generateColor(color);
	ctx.beginPath();
	ctx.moveTo(z1.x,z1.y);
	ctx.lineTo(z2.x,z2.y);
	if (size) 
		ctx.lineWidth = size;
	else
		ctx.lineWidth = 1;
	ctx.stroke();
	ctx.closePath();
}

var getPointsBetween = function(A, B, N) {
	var res = [];
	res.push(A);
	var dr = B.coord.minus(A.coord).multiply( 1 / (N+1));

	for (var i = 0; i < N; i++)
	{
		var newPoint = new Point(dr.multiply(i+1).plus(A.coord), A.normal, BLACK);
		res.push(newPoint);
	}
	res.push(B);
	return res;
}

var getPoligonPoints = function(A, B, C, D, N) {
	var mas = getPointsBetween(A, B, N);
	var mas2 = getPointsBetween(D, C, N);
	var res = [];
	for (var i = 0; i < mas.length; i++) {
		res = res.concat(getPointsBetween(mas[i], mas2[i], N));
	}
	return res;
}
var setColor = function(points, color) {
	for (var i = 0; i < points.length; i++){
		points[i].color = color;
	}
}
var setNormal = function(points, normal) {
	for (var i = 0; i < points.length; i++){
		points[i].normal = normal;
	}
}
var GetCOlorwithLight = function(lights, point) {
	var oldColor = point.color;
	add = 0;

	if (lights)
	{
		for (var i = 0; i < lights.length; i++) {
			var r = lights[i].normal;
			var n = point.normal;
			if (r.length() == 0) {
				r = n.reverse().multiply(200/n.length());
			}		
				
			var d = lights[i].coord.dist(point.coord);
			var intensity = r.dobutok(n);
			var dr = lights[i].coord.minus(point.coord);
			if (dr.dobutok(n) > 0)
			{
				intensity /= -n.length();
				intensity /= d;
			} else {
				intensity /= -n.length();
				intensity /= d*d;
				intensity /= 2;
			}
			lightcolor = lights[i].color;
			intensity /= r.length();
			var cos =- r.dobutok(dr) / r.length() / dr.length();
			/*if (cos > 0.80)
				oldColor = oldColor.plus( lightcolor.plus(GRAY.multiply(100*cos)).multiply(intensity) );
			else
				oldColor = oldColor.plus( lightcolor.multiply(intensity) );*/
			oldColor = oldColor.plus( lightcolor.plus(GRAY.multiply(128*cos)).multiply(intensity) );
			oldColor = oldColor.plus( lightcolor.multiply(intensity) );


		}
	}
	//oldColor = oldColor.plus(GRAY.multiply(add));


	return oldColor;
}
var redraw = function(points, lights) {
	/*for (var i = 0; i < z1.length; i++) {
		points[i].clear();
	}*/	
	for (var i = 0; i < z1.length; i++) {
		points[i].draw(lights);
	}	
}

//-----------------------------------------------------------------


var canvas = document.getElementById("canvas");
canvas.width = 400;
canvas.height = 300;

var ctx = canvas.getContext("2d");

var Ad = new Point(new Vector(0,0,0), new Vector(0,0,1), BLACK);
var Bd = new Point(new Vector(2,0,0), new Vector(0,0,1), BLACK);
var Cd = new Point(new Vector(2,2,0), new Vector(0,0,1), BLACK);
var Dd = new Point(new Vector(0,2,0), new Vector(0,0,1), BLACK);

var Au = new Point(new Vector(0,0,2), new Vector(0,0,1), BLACK);
var Bu = new Point(new Vector(2,0,2), new Vector(0,0,1), BLACK);
var Cu = new Point(new Vector(2,2,2), new Vector(0,0,1), BLACK);
var Du = new Point(new Vector(0,2,2), new Vector(0,0,1), BLACK);


var lights = [];
lights.push(new Point(new Vector(1, 1, 0), new Vector(0,0,0), RED));
lights.push(new Point(new Vector(1, 1, 0), new Vector(0,0,0), BLUE));
lights.push(new Point(new Vector(1, 1, 0), new Vector(0,0,0), GREEN));
lights.push(new Point(new Vector(1, 1, 0), new Vector(0,0,0), BLUE));


///*
var z1 = getPoligonPoints(Bd, Bu, Cu, Cd, 25);
setNormal(z1, new Vector(1,0,0));
var z2 = getPoligonPoints(Au, Bu, Cu, Du, 25);
setNormal(z2, new Vector(0,0,1));
var z3 = getPoligonPoints(Cd, Cu, Du, Dd, 25);
setNormal(z3, new Vector(0,1,0));

z1 = z1.concat(z2);
z1 = z1.concat(z3);
//*/
/*
var z1 = [];
var xstart = -2.5;
var xend = 2.5;

var dx = 1e-1;
var radius = (xend - xstart) / 2;
var sqr = function(x) { return x*x};
var ystart = function(x) {
	var res = Math.sqrt(sqr(radius) - sqr(x - xstart - radius));
	return res;

}

for (var x = xstart; x<=xend; x+=dx) {
	var dy = dx/2;
	for (var y = -ystart(x); y<=ystart(x); y+=dy) {
		var coord = new Vector(x,y,Math.cos(x*x + y*y));
		//var coord = new Vector(x,y,0);
		var normal = new Vector(Math.sin(x*x + y*y)*2*x,
								Math.sin(x*x + y*y)*2*y,
								1);
		//var normal = new Vector(0,0,1);
		var newPoint = new Point(coord, normal, BLACK);
		z1.push(newPoint);
	}	
}
//*/



var t =0;
var f = function() {
	//lights[0].clear();
	ctx.clear
	ctx.clearRect(0,0,canvas.width, canvas.height);

	lights[0].coord = new Vector(3*Math.sin(t),3*Math.cos(t), 1);
	lights[1].coord = new Vector(3*Math.sin(t*2),3*Math.cos(t*2), 1);
	lights[2].coord = new Vector(3*Math.sin(t*4),3*Math.cos(t*4), 1);
	lights[3].coord = new Vector(1,1, Math.sin(t)+2);




	redraw(z1, lights)
	drawLine(Ad, Bd, RED);
	drawLine(Ad, Dd, RED);
	drawLine(Ad, Au, RED);
	

	lights[0].draw();
	lights[1].draw();
	lights[2].draw();
	/*var p1 = Ad;
	var p2 = new Point(new Vector(lights[0].coord.x, 0,0), new Vector(0,0,0), BLACK);
	drawLine(p1, p2, BLACK);
	var p3 = new Point(new Vector(0,lights[0].coord.y,0), new Vector(0,0,0), BLACK);
	drawLine(p1, p3, BLACK);
	var p4 = new Point(new Vector(lights[0].coord.x,lights[0].coord.y,0), new Vector(0,0,0), BLACK);
	drawLine(p2, p4, BLACK);
	drawLine(p3, p4, BLACK);
	drawLine(p4, lights[0], BLACK);*/
	

	
	var p5 = new Point(new Vector(), new Vector(0,0,0), BLACK);
	t += 0.05;



	setTimeout(f, 30);
};
f();


/* 
drawLine(Ad, Bd, BLACK);
drawLine(Bd, Cd, BLACK);
drawLine(Cd, Dd, BLACK);
drawLine(Dd, Ad, BLACK);

drawLine(Au, Bu, BLACK);
drawLine(Bu, Cu, BLACK);
drawLine(Cu, Du, BLACK);
drawLine(Du, Au, BLACK);

drawLine(Au, Ad, BLACK);
drawLine(Bu, Bd, BLACK);
drawLine(Cu, Cd, BLACK);
drawLine(Du, Dd, BLACK);
*/
