import Experience from './Experience.js';

// Initialize the 3D experience
const experience = new Experience();

// Initialize loading animation
const loadingBarElement = document.querySelector('.loading-bar');
let sceneReady = false;

// Update loading bar
function updateLoadingBar(progress) {
    loadingBarElement.style.transform = `scaleX(${progress})`;
    if (progress >= 1) {
        setTimeout(() => {
            loadingBarElement.style.opacity = '0';
            loadingBarElement.style.display = 'none';
            sceneReady = true;
        }, 500);
    }
}

// Start with initial progress
updateLoadingBar(0);

// Simulate loading progress
let progress = 0;
const loadingInterval = setInterval(() => {
    progress += 0.1;
    updateLoadingBar(progress);
    if (progress >= 1) {
        clearInterval(loadingInterval);
    }
}, 200);

// Sound effects
const hoverSound = new Audio('/sounds/hover.mp3');
const clickSound = new Audio('/sounds/click.mp3');
const ambientSound = new Audio('/sounds/ambient.mp3');

hoverSound.volume = 0.2;
clickSound.volume = 0.3;
ambientSound.volume = 0.1;
ambientSound.loop = true;

// Play ambient sound on user interaction
document.addEventListener('click', () => {
    ambientSound.play().catch(() => {});
}, { once: true });

// 3D parallax effect
document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.hover-card');
    const depth = 15;
    
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / centerY * depth;
        const rotateY = (centerX - x) / centerX * depth;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(30px)`;
    });
});

// Reset card position on mouse leave
document.addEventListener('mouseleave', () => {
    const cards = document.querySelectorAll('.hover-card');
    cards.forEach(card => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    });
});

// Add hover sound effects
document.querySelectorAll('a, button, .hover-card').forEach(element => {
    element.addEventListener('mouseenter', () => {
        hoverSound.currentTime = 0;
        hoverSound.play().catch(() => {});
    });
    
    element.addEventListener('click', () => {
        clickSound.currentTime = 0;
        clickSound.play().catch(() => {});
    });
});

// Glitch text effect
document.querySelectorAll('.glitch-effect').forEach(element => {
    element.setAttribute('data-text', element.textContent);
});

// Smooth scroll with cyberpunk effect
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            clickSound.play().catch(() => {});
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Particle background
const canvas = document.createElement('canvas');
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.style.zIndex = '-2';
canvas.style.pointerEvents = 'none';
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
            this.reset();
        }
    }

    draw() {
        ctx.fillStyle = `rgba(0, 247, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Create particles
for (let i = 0; i < 100; i++) {
    particles.push(new Particle());
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    
    requestAnimationFrame(animate);
}

animate();
