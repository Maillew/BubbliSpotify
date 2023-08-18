import './style.css'

var script = document.createElement('script');
script.src = 'https://code.jquery.com/jquery-3.6.3.min.js';
document.getElementsByTagName('head')[0].appendChild(script);

const clientId = "CLIENT_ID"; // Replace with your client id

// set up svg width
let height = document.getElementById('svg').clientHeight, width = document.getElementById('svg').clientWidth;
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
var currentType = "track";
var currentSize = 5;
let mouseDown = false;
let mouseX = 0;
let mouseY = 0;
const dragVelocityFactor = 0.005;

/*
	ok i think i know the issue:
		the mouse click is with respect to the whole page
		but the coordinate of the particles is with respect to the svg

	i think what we do is get the coord of the top left corner of the container?
*/

svg.addEventListener('mousedown', (e) => {
	mouseDown = true;
	var offset = $('svg').offset();
	mouseX = e.clientX; 
	mouseY = e.clientY;
	// Check if any particle is clicked and set its 'isClicked' flag.
	console.log(mouseX,mouseY);
	if(currentType ==="track"){
		trackParticles.forEach((particle) => {
			const dx = particle.x - mouseX + offset.left;
			const dy = particle.y - mouseY + offset.top;
			if (Math.sqrt(dx * dx + dy * dy) <= particle.r) {
				particle.isClicked = true;
			}
			else {
				particle.isClicked = false;
			}
		});
	}
	else{
		artistParticles.forEach((particle) => {
			const dx = particle.x - mouseX + offset.left;
			const dy = particle.y - mouseY + offset.top;
			if (Math.sqrt(dx * dx + dy * dy) <= particle.r) {
				particle.isClicked = true;
			}
			else {
				particle.isClicked = false;
			}
		});
	}
	
});
  
svg.addEventListener('mouseup', () => {
	mouseDown = false;

	// Reset 'isClicked' flag for all particles when the mouse is released.
	if(currentType === "track"){
		trackParticles.forEach((particle) => {
			particle.isClicked = false;
		});
	}
	else{
		artistParticles.forEach((particle) => {
			particle.isClicked = false;
		});
	}
	
});

svg.addEventListener('mousemove', (e) => {
	if (mouseDown) {
		const deltaX = e.clientX - mouseX;
		const deltaY = e.clientY - mouseY;
		if(currentType ==="track"){
			trackParticles.forEach((particle) => {
				if (particle.isClicked) {
					particle.vx += deltaX * dragVelocityFactor;
					particle.vy += deltaY * dragVelocityFactor;
				}
			});
		}
		else{
			artistParticles.forEach((particle) => {
				if (particle.isClicked) {
					particle.vx += deltaX * dragVelocityFactor;
					particle.vy += deltaY * dragVelocityFactor;
				}
			});
		}
		var offset = $('svg').offset();
		mouseX = e.clientX; 
		mouseY = e.clientY;
	}
});

function random(lb, ub){
  return Math.random()*(ub-lb)+lb;
}
let imageScale = 1.2;
let dim = Math.min(width,height);
class Particle {
	constructor(radius, imageURL, text, type) {
		this.isClicked = false;
		this.r = radius; // can adjust these values later
		this.d = this. r * 2;
		this.imageURL = imageURL;
		this.x = random(this.r, width - this.d);
		this.y = random(this.r, height - this.d);
		this.col = '#F15025';
		this.text = text;
		this.mass = this.r;
		this.fontsize = Math.max(10, 2.5*this.r/this.text.length);
		this.type = type;
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
		if(this.type === "track") this.clipPathID = "circle-clip" + trackParticles.length;
		else this.clipPathID = "circle-clip" + artistParticles.length;
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
			y: this.y + this.r + 0.6 * this.fontsize,
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
		if(this.isClicked) console.log(this.text);
		this.fontsize = Math.max(10, 2.5*this.r/this.text.length);
		this.el.setAttribute('cx', this.x);
		this.el.setAttribute('cy', this.y);
		this.el.setAttribute('r', this.r);
		this.el.setAttribute('fill', this.collision ? '#000000' : "url(#" + this.imageURL + ") translate(" + this.x + "," + this.y + ")");
		
		const imageX = this.x - this.r * imageScale;
		const imageY = this.y - this.r * imageScale;
		this.imageEl.setAttribute('x', imageX);
		this.imageEl.setAttribute('y', imageY);
		this.imageEl.setAttribute('width', this.r * 2 * imageScale);
		this.imageEl.setAttribute('height', this.r * 2 * imageScale);
		this.imageEl.setAttribute('href', this.imageURL);
		

		this.clipCircle.setAttribute('r',this.r);
		this.clipCircle.setAttribute('cx', this.x);
		this.clipCircle.setAttribute('cy', this.y);

		this.clipPathEl.setAttribute('x', imageX);
		this.clipPathEl.setAttribute('y', imageY);

		this.textEl.setAttribute('x', this.x);
		this.textEl.setAttribute('y', this.y + this.r + 0.6 * this.fontsize);
		this.textEl.setAttribute('font-size', this.fontsize);
		this.overlayEl.setAttribute('cx', this.x);
    	this.overlayEl.setAttribute('cy', this.y);
		this.overlayEl.setAttribute('r', this.r);
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
		if (this.y <= this.r || this.y + this.r + this.fontsize > height) {
			this.y = this.y <= this.r ? this.r : height - this.r - this.fontsize;
			this.vy *= -1;
		}
		this.imageEl.setAttribute('x', this.x - this.r * imageScale);
    	this.imageEl.setAttribute('y', this.y - this.r * imageScale);
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
let trackParticles = [];
let artistParticles = [];


//// api shenanigans
const params = new URLSearchParams(window.location.search);
const code = params.get("code");
var trackImages = [];
var trackNames = [];
var trackArtistNames = [];
var trackPopularity = [];

var artistImages = [];
var artistNames = [];
var artistPopularity = [];
var artistGenres = [];

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
    params.append("redirect_uri", "http://localhost:5173/user.html");
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
    params.append("redirect_uri", "http://localhost:5173/user.html");
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
	var artistName = profile.items[trackImages.length].artists[0].name;
	var popularity = profile.items[trackImages.length].popularity;
	//trim the track name
		//if it has brackets (with) or (feat.) we can trim
	for(let i =1; i<name.length; i++){
		if(name[i] === '('){
			name = name.substring(0,i-1);
		}
	}
	name = "#" + (trackImages.length+1) + " " + name;
	var img = new Image();
	img.src = url;
	trackImages.push(img);
	trackNames.push(name);
	trackArtistNames.push(artistName);
	trackPopularity.push(popularity);
}

function initArtists(profile) {
    console.log(profile);
	for(let i =0; i<20; i++) addArtist(profile);
}

function addArtist(profile){
	var url = profile.items[artistImages.length].images[0].url;
	var name = profile.items[artistImages.length].name;
	var popularity = profile.items[artistImages.length].popularity;
	var followers = profile.items[artistImages.length].genres;
	name = "#" + (artistImages.length+1) + " " + name;

	var img = new Image();
	img.src = url;
	artistImages.push(img);
	artistNames.push(name);
	artistPopularity.push(popularity);
	artistGenres.push(followers);
}

function removeNode(obj){
	svg.removeChild(obj);
}
function removeParticle(type){//removes num smallest particles
	if(type === "track"){
		if(trackParticles.length ===0) return;
		var obj = trackParticles.pop();
		removeNode(obj.imageEl);
		removeNode(obj.clipPathEl);
		removeNode(obj.textEl);
		removeNode(obj.overlayEl);
		removeNode(obj.el);
	}
	else{
		if(artistParticles.length ===0) return;
		var obj = artistParticles.pop();
		removeNode(obj.imageEl);
		removeNode(obj.clipPathEl);
		removeNode(obj.textEl);
		removeNode(obj.overlayEl);
		removeNode(obj.el);
	}
}
function addParticle(type){//adds next num largest particles
	if(type ==="track") trackParticles.push(new Particle((dim/5) / Math.sqrt(trackParticles.length + 1), trackImages[trackParticles.length].src, trackNames[trackParticles.length], "track"));
	else artistParticles.push(new Particle((dim/5) / Math.sqrt(artistParticles.length + 1), artistImages[artistParticles.length].src, artistNames[artistParticles.length], "artist"));
}
function adjustSize(sz, type){
	if(type === "track"){
		while(trackParticles.length > sz) removeParticle(type);
		while(trackParticles.length < sz) addParticle(type);
	}
	else{
		while(artistParticles.length > sz) removeParticle(type);
		while(artistParticles.length < sz) addParticle(type);
	}
}

// animation loop

const trackButton = document.getElementById("trackButton");
const artistButton = document.getElementById("artistButton");


trackButton.addEventListener("click", () => {
    trackCarousel.classList.add("active");
	trackButton.classList.add("active");
    artistButton.classList.remove("active");
    artistCarousel.classList.remove("active");
	adjustSize(0,currentType);
	currentType = "track";
	adjustSize(currentSize,currentType);
});

artistButton.addEventListener("click", () => {
	artistButton.classList.add("active");
	artistCarousel.classList.add("active");
	trackCarousel.classList.remove("active");
    trackButton.classList.remove("active");
	adjustSize(0,currentType);
	currentType = "artist";
	adjustSize(currentSize,currentType);
});

const button5 = document.getElementById("button5");
const button10 = document.getElementById("button10");
const button20 = document.getElementById("button20");

button5.addEventListener("click", () => {
	adjustSize(5, currentType);
	currentSize = 5;
    button5.classList.add("active");
    button10.classList.remove("active");
	button20.classList.remove("active");
});

button10.addEventListener("click", () => {
	adjustSize(10, currentType);
	currentSize = 10;
    button5.classList.remove("active");
    button10.classList.add("active");
	button20.classList.remove("active");
});

button20.addEventListener("click", () => {
	adjustSize(20, currentType);
	currentSize = 20;
    button5.classList.remove("active");
    button10.classList.remove("active");
	button20.classList.add("active");
});

trackButton.classList.add("active"); //by default, what is loaded in
button5.classList.add("active");
adjustSize(currentSize,currentType);

const loop = () => {
	// accounting for page resizing
	height = document.getElementById('svg').clientHeight;
	width = document.getElementById('svg').clientWidth;

	setSvgSize(width, height);
	dim = Math.min(width,height);
	for(let i =0; i < trackParticles.length; i++){
		trackParticles[i].r = (dim/5) / Math.sqrt(i+1);
	}
	for(let i =0; i < artistParticles.length; i++){
		artistParticles[i].r = (dim/5) / Math.sqrt(i+1);
	}
	// looping through particles checking for collisions and updating pos
	if(currentType === "track"){
		for (let i = 0; i < trackParticles.length; i++) {
			for (let n = i + 1; n < trackParticles.length; n++) {
				trackParticles[i].checkForIntercept(trackParticles[n])
			}
			trackParticles[i].update();
		}
	}
	else{
		for (let i = 0; i < artistParticles.length; i++) {
			for (let n = i + 1; n < artistParticles.length; n++) {
				artistParticles[i].checkForIntercept(artistParticles[n])
			}
			artistParticles[i].update();
		}
	}
	window.requestAnimationFrame(loop);
}

loop();

// Carousel

function adjustCarousel(type){
	for(let i = 1; i<=20; i++){
		let name = "name" + i;
		let d = "d" + i;
		let img = "img" + i;
		const htmlName = document.getElementById(name);
		const htmlImg = document.getElementById(img);
		const htmlD = document.getElementById(d);

		if(type === "track"){
			htmlName.textContent = trackNames[i-1];
			htmlImg.src = trackImages[i-1].src;
			var artistName = trackArtistNames[i-1];
			var popularity = trackPopularity[i-1];
			var desc = "By: " + artistName + '<br>' + "Popularity: " + popularity;
			htmlD.innerHTML = desc;
		}
		else{
			htmlName.textContent = artistNames[i-1];
			htmlImg.src = artistImages[i-1].src;
			var genres = artistGenres[i-1];
			var popularity = artistPopularity[i-1];
			var genreD = "Genre(s): ";
			for(let j =0; j<Math.min(3,genres.length); j++){
				if(j>0) genreD+=", ";
				genreD += genres[j];
			}
			var desc = "";
			if(genres.length!==0) desc+=genreD + '<br>';
			desc+= "Popularity: " + popularity;
			htmlD.innerHTML = desc;
		}
	}
}
adjustCarousel(currentType);

const trackCarousel = document.getElementById("trackButtonCarousel");
const artistCarousel = document.getElementById("artistButtonCarousel");

trackCarousel.addEventListener("click", () => {
    trackCarousel.classList.add("active");
	trackButton.classList.add("active");
    artistButton.classList.remove("active");
    artistCarousel.classList.remove("active");
	adjustSize(0,currentType);
	currentType = "track";
	adjustSize(currentSize,currentType);
	adjustCarousel(currentType);
});

artistCarousel.addEventListener("click", () => {
    artistButton.classList.add("active");
	artistCarousel.classList.add("active");
	trackCarousel.classList.remove("active");
    trackButton.classList.remove("active");
	adjustSize(0,currentType);
	currentType = "artist";
	adjustSize(currentSize,currentType);
	adjustCarousel(currentType);
});
