var script = document.createElement('script');
script.src = 'https://code.jquery.com/jquery-3.6.3.min.js';
document.getElementsByTagName('head')[0].appendChild(script);

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
	constructor(radius, imageURL, text, type, color, email) {
		this.isClicked = false;
		this.r = radius; // can adjust these values later
		this.d = this. r * 2;
		this.imageURL = imageURL;
		this.x = random(this.r, width - this.d);
		this.y = random(this.r, height - this.d);
		this.col = '#' + color;
		this.text = text;
		this.mass = this.r;
        this.email = email;
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
//i think we make the track and artist 2d, each time we insert an array of the current particles
let trackParticles = [];
let artistParticles = [];



var trackImages = [];
var trackNames = [];

var artistImages = [];
var artistNames = [];

var colorsUsed = [0,0,0,0,0];
var colors = [
    "F4C209",
    "FF8C5A",
    "FF99AD",
    "D9A9E2",
    "4BAA71"
];

function addUser(email, trackData, artistData){
    let color = "";
    for(let i =0; i<5; i++){
        if(!colorsUsed[i]){
            color = colors[i];
            colorsUsed[i] = 1;
            break;
        }
    }
    var tracks = [];
    var artists = [];

    if(1){
        var trackImages = [];
        var trackNames = [];
        for(let t =0; t<5; t++){
            var url = trackData.items[trackImages.length].album.images[0].url;
            var name = trackData.items[trackImages.length].name;
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
        }
        for(let i =0; i<5; i++){
            tracks.push(new Particle((dim/4) / Math.sqrt(tracks.length + 1), trackImages[tracks.length].src, trackNames[tracks.length], "track", color, email));
        }
    }
    if(1){
        var artistImages = [];
        var artistNames = [];
        for(let t =0; t<5; t++){
            var url = artistData.items[artistImages.length].images[0].url;
            var name = artistData.items[artistImages.length].name;
            name = "#" + (artistImages.length+1) + " " + name;

            var img = new Image();
            img.src = url;
            artistImages.push(img);
            artistNames.push(name);
        }
        for(let i =0; i<5; i++){
            artists.push(new Particle((dim/4) / Math.sqrt(artists.length + 1), artistImages[artists.length].src, artistNames[artists.length], "artist", color, email));
        }
    }
}
function removeUser(email){
    for(let i =0; i<trackParticles.length; i++){
        if(trackParticles[i][0].email === email){
            color = trackParticles[i][0].col;
            color = color.substring(1);
            for(let j =0; j<5; j++){
                if(colors[j] === color){
                    colorsUsed[j] = 0;
                }
            }
            trackParticles.splice(i,1);
            console.log(trackParticles);
            break;
        }
    }
    for(let i =0; i<artistParticles.length; i++){
        if(artistParticles[i][0].email === email){
            artistParticles.splice(i,1);
            console.log(artistParticles);
            break;
        }
    }
}

// animation loop

const trackButton = document.getElementById("trackShareButton");
const artistButton = document.getElementById("artistShareButton");

trackButton.addEventListener("click", () => {
	trackButton.classList.add("active");
    artistButton.classList.remove("active");
	currentType = "track";
});

artistButton.addEventListener("click", () => {
	artistButton.classList.add("active");
    trackButton.classList.remove("active");
	currentType = "artist";
});


const loop = () => {
	// accounting for page resizing
	height = document.getElementById('svg').clientHeight;
	width = document.getElementById('svg').clientWidth;

	setSvgSize(width, height);
	dim = Math.min(width,height);
	for(let i =0; i < trackParticles.length; i++){
        for(let j =0; j < trackParticles[i].length; j++){
            trackParticles[i][j].r = (dim/4) / Math.sqrt(j+1);
        }
	}
	for(let i =0; i < artistParticles.length; i++){
        for(let j =0; j < artistParticles[i].length; j++){
            artistParticles[i][j].r = (dim/4) / Math.sqrt(j+1);
        }
	}
	// looping through particles checking for collisions and updating pos
	if(currentType === "track"){
        for(let u1 =0; u1<trackParticles.length; u1++){
            for(let u2 =0; u2 < trackParticles.length; u2++){
                for(let i =0; i<trackParticles[u1].length; i++){
                    for(let j =0; j<trackParticles[u2].length; j++){
                        if(u1 === u2 && i ===j) continue;
                        trackParticles[u1][i].checkForIntercept(trackParticles[u2][j]);
                    }
                    trackParticles[u1][i].update();
                }
            }
            
        }
	}
	else{
		for(let u1 =0; u1<artistParticles.length; u1++){
            for(let u2 =0; u2 < artistParticles.length; u2++){
                for(let i =0; i<artistParticles[u1].length; i++){
                    for(let j =0; j<artistParticles[u2].length; j++){
                        if(u1 === u2 && i ===j) continue;
                        artistParticles[u1][i].checkForIntercept(artistParticles[u2][j]);
                    }
                    artistParticles[u1][i].update();
                }
            }
            
        }
	}
	window.requestAnimationFrame(loop);
}

loop();


// share.js


// share.js
const addUserForm = document.getElementById('addUserForm');
addUserForm.addEventListener('submit', function(event) {
	event.preventDefault();
	
	const newUserEmail = event.target.newUserEmail.value;
	console.log(`Add button clicked for new user email: ${newUserEmail}`);
	fetch('/addUser', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ newUserEmail: newUserEmail })
	})
	.then(response => response.json())
	.then(data => {
		if (data.message === "User already exists") {
			alert("User already added");
		} else if (data.message === "User added successfully") {
			window.location.href = "/share";
		}
		else{
			alert("User doesn't currently exist");
		}
	})
	.catch(error => {
		console.error('Error:', error);
	});
});

const checkboxes = document.querySelectorAll('input[type="checkbox"]');
checkboxes.forEach(checkbox => {
	checkbox.addEventListener('change', function() {
		const email = this.value;
		console.log(`Delete button clicked for email: ${email}`);
		
	});
});
