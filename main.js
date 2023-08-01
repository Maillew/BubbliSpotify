import './style.css'
// view dimensions

let height = window.innerHeight, width = window.innerWidth;

// set up svg width

let svg = document.getElementById('svg');
const setSvgSize = (w, h) => {
	svg.setAttribute('width', width);
	svg.setAttribute('height', height);
};

// function to create svg nodes

const createNode = (n, attrs) => {
	n = document.createElementNS('http://www.w3.org/2000/svg', n);
	for (let a in attrs) {
		n.setAttributeNS(null, a.replace(/[A-Z]/g, m => '-' + m.toLowerCase()), attrs[a]);
	}
	svg.appendChild(n);
	return n;
};

// particle constructor

let gravity = false;

function random(lb, ub){
  return Math.random()*(ub-lb)+lb;
}
class Particle {
	constructor(radius, imageURL) {
		this.r = radius; // can adjust these values later
		this.d = this. r * 2;
		this.imageURL = imageURL;
		this.x = random(this.r, width - this.d);
		this.y = random(this.r, height - this.d);
		this.col = '#F15025';
		this.mass = 10 * this.r;
		// create el
		this.el = createNode('circle', {
			cx: this.x,
			cy: this.y, 
			r: this.r, 
			fill: "url(#"+this.imageURL +")",
		});
		this.imageEl = createNode('image', {
			x: this.x - this.r,
			y: this.y - this.r,
			width: this.r * 2,
			height: this.r * 2,
			href: this.imageURL,
		});
		//add a clip path to this? 
		this.clipPathEl = createNode('clipPath', { id: "circle-clip" });
		this.clipCircle = createNode('circle', {
			cx: this.x,
			cy: this.y,
			r: this.r
		});
		this.clipPathEl.appendChild(this.clipCircle);
		svg.appendChild(this.clipPathEl);
		this.imageEl.setAttribute('clip-path', 'url(#circle-clip)');
		svg.appendChild(this.imageEl);
		// vector
		this.vx = random(-10, 10) / 5;
		this.vy = random(-10, 10) / 5;
		// this.vx = 0;
		// this.vy = 0;
	}
	draw() {
		this.el.setAttribute('cx', this.x);
		this.el.setAttribute('cy', this.y);
		this.el.setAttribute('fill', this.collision ? '#F47F60' : "url(#" + this.imageURL + ") translate(" + this.x + "," + this.y + ")");
		
		const imageX = this.x - this.r;
		const imageY = this.y - this.r;
		this.imageEl.setAttribute('x', imageX);
		this.imageEl.setAttribute('y', imageY);
		this.clipCircle.setAttribute('cx', this.x);
		this.clipCircle.setAttribute('cy', this.y);

		this.clipPathEl.setAttribute('x', imageX);
		this.clipPathEl.setAttribute('y', imageY);
		this.collision = false;
	}
	update() {
		this.x += this.vx;
		this.y += this.vy;
		// check boundaries
		if (this.x <= this.r || this.x + this.r > width) {
			this.x = this.x <= this.r ? this.r : width - this.r;
			this.vx *= -1;
		}
		if (this.y <= this.r || this.y + this.r > height) {
			this.y = this.y <= this.r ? this.r : height - this.r;
			this.vy *= -1;
		}
		this.imageEl.setAttribute('x', this.x - this.r);
    	this.imageEl.setAttribute('y', this.y - this.r);
		this.clipPathEl.setAttribute('x', this.x - this.r);
		this.clipPathEl.setAttribute('y', this.y - this.r);
		// update pos
		this.draw();
	}
	get vector() {
		return [this.vx, this.vy];
	}
	rotate(v, theta) {
		return [v[0] * Math.cos(theta) - v[1] * Math.sin(theta), v[0] * Math.sin(theta) + v[1] * Math.cos(theta)];
	}
	collide(b) {
		// get angle
		let theta = -Math.atan2(b.y - this.y, b.x - this.x);
		// mass
		let m1 = this.mass,
			 m2 = b.mass;
		// update vectors
		let v1 = this.rotate(this.vector, theta),
			 v2 = this.rotate(b.vector, theta);
		// calculate momentum
		let u1 = this.rotate([v1[0] * (m1 - m2) / (m1 + m2) + v2[0] * 2 * m2 / (m1 + m2), v1[1]], -theta),
			 u2 = this.rotate([v2[0] * (m2 - m1) / (m1 + m2) + v1[0] * 2 * m1 / (m1 + m2), v2[1]], -theta);
		// set new velocities
		this.vx = u1[0];
		this.vy = u1[1];
		b.vx = u2[0];
		b.vy = u2[1];
	}
	checkForIntercept(b) {
		let dx = Math.max(this.x - b.x, b.x - this.x),
			 dy = Math.max(this.y - b.y, b.y - this.y),
			 dis = Math.sqrt(dx * dx + dy * dy),
			 r_combined = this.r + b.r,
			 collision = dis < r_combined;
		
		
		if (collision) {
			
			let theta = -Math.atan2(b.y - this.y, b.x - this.x);
			
			let rx = (dis - r_combined) * Math.cos(theta) / 2,
				 ry = (dis - r_combined) * Math.sin(theta) / 2;
			
			ry = ry < 0 ? 0 : ry;
			rx = rx < 0 ? 0 : rx;
			
			this.x += this.x < b.x ? -rx : rx;
			b.x += this.x < b.x ? rx : -rx;
			
			this.y += this.y < b.y ? -ry : ry;
			b.y += this.y < b.y ? ry : -ry;
			
			this.collide(b, dx, dy);
			this.collision = true;
			b.collision = true;
		}
	}
	
}


// create particles
let particles = [];
let maxParticles = 10;
let bigRadius = 100;

let testURL = "https://charts-static.billboard.com/img/2019/11/keshi-95t-344x344.jpg";
const img = new Image();
img.onload = () => {
  for (let i = 0; i < maxParticles; i++) {
    particles.push(new Particle(100 / Math.sqrt(i + 1), img.src));
  }
  loop();
};
img.src = "https://charts-static.billboard.com/img/2019/11/keshi-95t-344x344.jpg";

// animation loop

const loop = () => {
	// accounting for page resizing
	width = window.innerWidth;
	height = window.innerHeight;
	setSvgSize(width, height);
	// looping through particles checking for collisions and updating pos
	for (let i = 0; i < maxParticles; i++) {
		for (let n = i + 1; n < maxParticles; n++) {
			particles[i].checkForIntercept(particles[n])
		}
		particles[i].update();
	}
	window.requestAnimationFrame(loop);
}

loop();



