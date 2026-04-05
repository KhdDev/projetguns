// ===== PARTICLES =====
const canvas = document.getElementById('particles');
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
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.color = Math.random() > 0.5 ? '139, 92, 246' : '88, 101, 242';
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
            this.reset();
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
        ctx.fill();
    }
}

// Create particles
for (let i = 0; i < 80; i++) {
    particles.push(new Particle());
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateParticles);
}
animateParticles();

// ===== INTRO → PROFILE TRANSITION =====
const intro = document.getElementById('intro');
const profile = document.getElementById('profile');

// ===== AUDIO =====
const bgMusic = document.getElementById('bgMusic');
const musicControl = document.getElementById('musicControl');
const musicBtn = document.getElementById('musicBtn');
const volumeSlider = document.getElementById('volumeSlider');

bgMusic.volume = 0.3;

musicBtn.addEventListener('click', () => {
    if (bgMusic.paused) {
        bgMusic.play();
        musicBtn.classList.remove('muted');
    } else {
        bgMusic.pause();
        musicBtn.classList.add('muted');
    }
});

volumeSlider.addEventListener('input', (e) => {
    bgMusic.volume = e.target.value / 100;
    if (bgMusic.volume === 0) {
        musicBtn.classList.add('muted');
    } else {
        musicBtn.classList.remove('muted');
    }
});

intro.addEventListener('click', () => {
    intro.classList.add('fade-out');

    // Start music on click (required by browsers)
    bgMusic.play().catch(() => {});
    musicControl.classList.remove('hidden');
    musicControl.classList.add('visible');

    setTimeout(() => {
        intro.style.display = 'none';
        profile.classList.remove('hidden');
        document.body.style.overflow = 'auto';

        // Trigger show animation
        requestAnimationFrame(() => {
            profile.classList.add('show');
        });
    }, 600);
});

// ===== FETCH DISCORD (via Lanyard API) =====
const DISCORD_ID = '1255967804889501889';

async function fetchDiscord() {
    try {
        const res = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
        const data = await res.json();

        if (!data.success) throw new Error('Lanyard error');

        const user = data.data;
        const discordUser = user.discord_user;

        // Avatar
        const avatarUrl = discordUser.avatar
            ? `https://cdn.discordapp.com/avatars/${DISCORD_ID}/${discordUser.avatar}.png?size=128`
            : `https://cdn.discordapp.com/embed/avatars/${parseInt(discordUser.discriminator) % 5}.png`;

        document.getElementById('avatar').src = avatarUrl;
        document.getElementById('discordAvatar').src = avatarUrl;
        document.getElementById('discordName').textContent = discordUser.global_name || discordUser.username;

        // Status
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('discordStatus');
        const statusMap = {
            online: 'En ligne',
            idle: 'Inactif',
            dnd: 'Ne pas déranger',
            offline: 'Hors ligne'
        };
        statusDot.className = `status-dot ${user.discord_status}`;
        statusText.textContent = statusMap[user.discord_status] || 'Hors ligne';

        // Custom status
        if (user.activities) {
            const customStatus = user.activities.find(a => a.type === 4);
            if (customStatus && customStatus.state) {
                const emoji = customStatus.emoji ? customStatus.emoji.name + ' ' : '';
                document.getElementById('bio').textContent = emoji + customStatus.state;
            }

            // Playing / Listening activity
            const activity = user.activities.find(a => a.type === 0 || a.type === 2);
            if (activity) {
                const actDiv = document.getElementById('discordActivity');
                const prefix = activity.type === 2 ? '🎵 Écoute' : '🎮 Joue à';
                actDiv.textContent = `${prefix} ${activity.name}`;
                actDiv.classList.add('visible');
            }
        }
    } catch (e) {
        console.warn('Discord fetch failed:', e);
        document.getElementById('discordName').textContent = 'Kamss';
        document.getElementById('discordStatus').textContent = 'Profil Discord';
        document.getElementById('avatar').src = 'https://cdn.discordapp.com/embed/avatars/0.png';
        document.getElementById('discordAvatar').src = 'https://cdn.discordapp.com/embed/avatars/0.png';
    }
}

// ===== FETCH GITHUB =====
async function fetchGitHub() {
    try {
        const res = await fetch('https://api.github.com/users/KhdDev');
        const user = await res.json();

        document.getElementById('githubAvatar').src = user.avatar_url;
        document.getElementById('githubName').textContent = user.name || user.login;
        document.getElementById('githubBio').textContent = user.bio || '';

        document.getElementById('githubStats').innerHTML = `
            <span><strong>${user.public_repos}</strong> repos</span>
            <span><strong>${user.followers}</strong> followers</span>
            <span><strong>${user.following}</strong> following</span>
        `;
    } catch (e) {
        console.warn('GitHub fetch failed:', e);
        document.getElementById('githubName').textContent = 'KhdDev';
        document.getElementById('githubBio').textContent = '';
    }
}

// ===== INIT =====
fetchDiscord();
fetchGitHub();
