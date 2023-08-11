import './style.css'
// view dimensions

let height = window.innerHeight, width = window.innerWidth;
const clientId = "CLIENT ID"; // Replace with your client id

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

let mouseDown = false;
let mouseX = 0;
let mouseY = 0;
const dragVelocityFactor = 0.001;

svg.addEventListener('mousedown', (e) => {
	mouseDown = true;
	mouseX = e.clientX;
	mouseY = e.clientY;

	// Check if any particle is clicked and set its 'isClicked' flag.
	particles.forEach((particle) => {
		const dx = particle.x - e.clientX;
		const dy = particle.y - e.clientY;
		if (Math.sqrt(dx * dx + dy * dy) <= particle.r) {
			particle.isClicked = true;
		}
		else {
			particle.isClicked = false;
		}
	});
});
  
svg.addEventListener('mouseup', () => {
	mouseDown = false;

	// Reset 'isClicked' flag for all particles when the mouse is released.
	particles.forEach((particle) => {
		particle.isClicked = false;
	});
});

svg.addEventListener('mousemove', (e) => {
	if (mouseDown) {
		const deltaX = e.clientX - mouseX;
		const deltaY = e.clientY - mouseY;
		particles.forEach((particle) => {
		if (particle.isClicked) {
			particle.vx += deltaX * dragVelocityFactor;
			particle.vy += deltaY * dragVelocityFactor;
		}
		});

		mouseX = e.clientX;
		mouseY = e.clientY;
	}
});

function random(lb, ub){
  return Math.random()*(ub-lb)+lb;
}
let imageScale = 1.2;
class Particle {
	constructor(radius, imageURL, text) {
		this.isClicked = false;
		this.r = radius; // can adjust these values later
		this.d = this. r * 2;
		this.imageURL = imageURL;
		this.x = random(this.r, width - this.d);
		this.y = random(this.r, height - this.d);
		this.col = '#F15025';
		this.text = text;
		this.mass = this.r;
		this.fontsize = 2.5*this.r/this.text.length;
		// create el
		this.el = createNode('circle', {
			cx: this.x,
			cy: this.y, 
			r: this.r, 
			fill: "url(#"+this.imageURL +")",
		});
		
		this.el.addEventListener('mousedown', (e) => {
			mouseDown = true;
			mouseX = e.clientX;
			mouseY = e.clientY;
			this.isClicked = true; 
		});
	  
		  // Add a mouseup event listener to the particle's <circle> element
		this.el.addEventListener('mouseup', () => {
			mouseDown = false;
			this.isClicked = false; 
		});

		this.imageEl = createNode('image', {
			width: this.r * 2 * imageScale,
			height: this.r * 2 * imageScale,
			x: this.x - this.r * imageScale,
			y: this.y - this.r * imageScale,
			href: this.imageURL
		});
		//add a clip path to this? 
		this.clipPathID = "circle-clip" + particles.length;
		this.clipPathEl = createNode('clipPath', { id: this.clipPathID});
		this.clipCircle = createNode('circle', {
			cx: this.x,
			cy: this.y,
			r: this.r
		});
		this.clipPathEl.appendChild(this.clipCircle);
		svg.appendChild(this.clipPathEl);
		this.imageEl.setAttribute('clip-path', 'url(#'+this.clipPathID+")");
		svg.appendChild(this.imageEl);
		// vector
		this.vx = random(-5, 5) / 5;
		this.vy = random(-5, 5) / 5;
		// this.vx = 0;
		// this.vy = 0;
		this.overlayEl = createNode('circle', {
			cx: this.x,
			cy: this.y,
			r: this.r,
			fill: 'transparent', // Make the overlay transparent
			class: 'hover-overlay', // Add a class for styling if needed
		});
		svg.appendChild(this.overlayEl);
		this.textEl = createNode('text',{
			x: this.x,
			y: this.y,
			'text-anchor': 'middle',
			'alignment-baseline': 'middle',
			stroke: '#000000',
			'stroke-width': this.r/(20*this.text.length),
			fill: '#000000',
			// 'font-weight': 'bolder',
			'font-size': this.fontsize,
			'font-family': "Poppins, sans-serif",
			class: 'unselectable'
		});
		this.textEl.textContent = this.text;
		svg.appendChild(this.textEl);
	}
	draw() {
		this.el.setAttribute('cx', this.x);
		this.el.setAttribute('cy', this.y);
		this.el.setAttribute('fill', this.collision ? '#000000' : "url(#" + this.imageURL + ") translate(" + this.x + "," + this.y + ")");
		
		const imageX = this.x - this.r * imageScale;
		const imageY = this.y - this.r * imageScale;
		this.imageEl.setAttribute('x', imageX);
		this.imageEl.setAttribute('y', imageY);
		this.clipCircle.setAttribute('cx', this.x);
		this.clipCircle.setAttribute('cy', this.y);

		this.clipPathEl.setAttribute('x', imageX);
		this.clipPathEl.setAttribute('y', imageY);
		this.textEl.setAttribute('x', this.x);
		this.textEl.setAttribute('y', this.y + this.r + 0.6 * this.fontsize);
		this.overlayEl.setAttribute('cx', this.x);
    	this.overlayEl.setAttribute('cy', this.y);
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

//// api shenanigans
const params = new URLSearchParams(window.location.search);
const code = params.get("code");
var trackImages = [];
var trackNames = [];
var artistImages = [];
var artistNames = [];

if (!code) {
    redirectToAuthCodeFlow(clientId);
} else {
    const accessToken = await getAccessToken(clientId, code);
    const tracks = await fetchTracks(accessToken);
    const artists = await fetchArtists(accessToken);
	initTracks(tracks);
	initArtists(artists);
}

export async function redirectToAuthCodeFlow(clientId) {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", "http://localhost:5173/callback");
    params.append("scope", "user-read-private user-read-email user-top-read");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export async function getAccessToken(clientId, code) {
    const verifier = localStorage.getItem("verifier");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", "http://localhost:5173/callback");
    params.append("code_verifier", verifier);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    const { access_token } = await result.json();
    return access_token;
}

async function fetchTracks(token) {
    const result = await fetch("https://api.spotify.com/v1/me/top/tracks", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
}
async function fetchArtists(token) {
    const result = await fetch("https://api.spotify.com/v1/me/top/artists", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
}

function initTracks(profile) {
    console.log(profile);
	for(let i =0; i<20; i++) addTrack(profile);
}

function addTrack(profile){
	var url = profile.items[trackImages.length].album.images[0].url;
	var name = profile.items[trackImages.length].name;

	var img = new Image();
	img.src = url;
	trackImages.push(img);
	trackNames.push(name);
}

function initArtists(profile) {
    console.log(profile);
	for(let i =0; i<20; i++) addArtist(profile);
}

function addArtist(profile){
	var url = profile.items[artistImages.length].images[0].url;
	var name = profile.items[artistImages.length].name;

	var img = new Image();
	img.src = url;
	artistImages.push(img);
	artistNames.push(name);
}

for(let j =0; j<1; j++){
	artistImages[j].onload = () => {
		particles.push(new Particle((width/10) / Math.sqrt(j + 1), artistImages[j].src, artistNames[j]));
		loop();
	};
}

document.getElementById("generateArtist").addEventListener("click", addParticle, false);

function removeNode(obj){
	svg.removeChild(obj);
}
function removeParticle(){//removes num smallest particles
	if(particles.length ===0) return;
	var obj = particles.pop();
	removeNode(obj.imageEl);
	removeNode(obj.clipPathEl);
	removeNode(obj.textEl);
	removeNode(obj.overlayEl);
	removeNode(obj.el);
}
function addParticle(){//adds next num largest particles
	particles.push(new Particle((width/10) / Math.sqrt(particles.length + 1), artistImages[particles.length].src, artistNames[particles.length]));
}
function adjustSize(sz){
	while(particles.length > sz) removeParticle();
	while(particles.length < sz) addParticle();
}

// animation loop

const loop = () => {
	// accounting for page resizing
	width = window.innerWidth;
	height = window.innerHeight;
	setSvgSize(width, height);
	// looping through particles checking for collisions and updating pos
	for (let i = 0; i < particles.length; i++) {
		for (let n = i + 1; n < particles.length; n++) {
			particles[i].checkForIntercept(particles[n])
		}
		particles[i].update();
	}
	window.requestAnimationFrame(loop);
}

loop();



