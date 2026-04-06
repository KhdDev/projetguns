// ===== CURSOR SNOW =====
let mouseX = 0, mouseY = 0;
const snowFlakes = [];

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Spawn a few particles on each move
    for (let i = 0; i < 2; i++) {
        spawnSnow(mouseX, mouseY);
    }
});

function spawnSnow(x, y) {
    const el = document.createElement('div');
    el.className = 'cursor-snow';
    const size = Math.random() * 3 + 2;
    el.style.width = size + 'px';
    el.style.height = size + 'px';
    document.body.appendChild(el);

    snowFlakes.push({
        el,
        x: x + (Math.random() - 0.5) * 20,
        y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: Math.random() * 1.5 + 0.5,
        life: 1,
        decay: Math.random() * 0.015 + 0.008
    });
}

function animateSnow() {
    for (let i = snowFlakes.length - 1; i >= 0; i--) {
        const s = snowFlakes[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vx += (Math.random() - 0.5) * 0.1;
        s.life -= s.decay;

        s.el.style.left = s.x + 'px';
        s.el.style.top = s.y + 'px';
        s.el.style.opacity = s.life;

        if (s.life <= 0) {
            s.el.remove();
            snowFlakes.splice(i, 1);
        }
    }
    requestAnimationFrame(animateSnow);
}
animateSnow();

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
        this.color = Math.random() > 0.5 ? '57, 255, 20' : '0, 230, 118';
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
const bgImage = document.getElementById('bgImage');

// ===== AUDIO =====
const bgMusic = document.getElementById('bgMusic');
const musicControl = document.getElementById('musicControl');
const musicBtn = document.getElementById('musicBtn');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const rewindBtn = document.getElementById('rewindBtn');
const forwardBtn = document.getElementById('forwardBtn');
const musicProgress = document.getElementById('musicProgress');
const musicProgressBar = document.getElementById('musicProgressBar');

bgMusic.volume = 0.3;

function updatePlayPauseIcon() {
    if (bgMusic.paused) {
        playIcon.style.display = '';
        pauseIcon.style.display = 'none';
    } else {
        playIcon.style.display = 'none';
        pauseIcon.style.display = '';
    }
}

musicBtn.addEventListener('click', () => {
    if (bgMusic.paused) {
        bgMusic.play();
    } else {
        bgMusic.pause();
    }
    updatePlayPauseIcon();
});

rewindBtn.addEventListener('click', () => {
    bgMusic.currentTime = Math.max(0, bgMusic.currentTime - 10);
});

forwardBtn.addEventListener('click', () => {
    bgMusic.currentTime = Math.min(bgMusic.duration, bgMusic.currentTime + 10);
});

musicProgress.addEventListener('click', (e) => {
    const rect = musicProgress.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    bgMusic.currentTime = ratio * bgMusic.duration;
});

bgMusic.addEventListener('timeupdate', () => {
    if (bgMusic.duration) {
        const pct = (bgMusic.currentTime / bgMusic.duration) * 100;
        musicProgressBar.style.width = pct + '%';
    }
});

intro.addEventListener('click', () => {
    intro.classList.add('fade-out');
    bgImage.classList.add('revealed');

    bgMusic.play().catch(() => {});
    updatePlayPauseIcon();
    musicControl.classList.remove('hidden');
    musicControl.classList.add('visible');
    viewCounter.classList.remove('hidden');
    viewCounter.classList.add('visible');

    setTimeout(() => {
        intro.style.display = 'none';
        profile.classList.remove('hidden');
        document.body.style.overflow = 'auto';

        requestAnimationFrame(() => {
            profile.classList.add('show');
            typeUsername('Kamss');
        });
    }, 600);
});

// ===== TYPING EFFECT (loop) =====
function typeUsername(text) {
    const el = document.getElementById('username');
    el.classList.add('typing');

    function loop() {
        // Type
        el.textContent = '';
        let i = 0;
        function type() {
            if (i < text.length) {
                el.textContent += text[i];
                i++;
                setTimeout(type, 250);
            } else {
                // Pause then erase
                setTimeout(erase, 2000);
            }
        }
        // Erase
        function erase() {
            if (el.textContent.length > 0) {
                el.textContent = el.textContent.slice(0, -1);
                setTimeout(erase, 120);
            } else {
                // Pause then restart
                setTimeout(loop, 800);
            }
        }
        type();
    }
    loop();
}

// ===== FETCH DISCORD (via Lanyard API) =====
const DISCORD_ID = '1255967804889501889';

async function fetchDiscord() {
    try {
        const res = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
        const data = await res.json();

        if (!data.success) throw new Error('Lanyard error');

        const user = data.data;
        const discordUser = user.discord_user;

        const avatarUrl = discordUser.avatar
            ? `https://cdn.discordapp.com/avatars/${DISCORD_ID}/${discordUser.avatar}.png?size=128`
            : `https://cdn.discordapp.com/embed/avatars/${parseInt(discordUser.discriminator) % 5}.png`;

        document.getElementById('avatar').src = avatarUrl;
        document.getElementById('discordAvatar').src = avatarUrl;
        document.getElementById('discordName').textContent = discordUser.global_name || 'kammsss';

        // Discord tag with copy tooltip
        const tag = discordUser.username;
        const tagEl = document.getElementById('discordTag');
        tagEl.textContent = '@' + tag;
        tagEl.addEventListener('click', () => {
            navigator.clipboard.writeText(tag);
            tagEl.textContent = 'Copié !';
            tagEl.classList.add('copied');
            setTimeout(() => {
                tagEl.textContent = '@' + tag;
                tagEl.classList.remove('copied');
            }, 1500);
        });

        // Discord badges
        const badgesEl = document.getElementById('discordBadges');
        badgesEl.innerHTML = '';

        const userBadges = [
            { name: 'HypeSquad Bravery', icon: 'fa-shield-heart', color: '#9b84ee' },
            { name: 'A terminé une quête', icon: 'fa-scroll', color: '#5865f2' },
            { name: 'Last Meadow Online', icon: 'fa-leaf', color: '#57f287' },
            { name: 'Apprenti', icon: 'fa-seedling', color: '#fee75c' },
            { name: 'Membre depuis le 27 juin 2024', icon: 'fa-calendar', color: '#5865f2' },
        ];

        // Also check API flags
        const flags = discordUser.public_flags || 0;
        const flagBadges = {
            64: { name: 'HypeSquad Bravery', icon: 'fa-shield-heart', color: '#9b84ee' },
            4194304: { name: 'Active Developer', icon: 'fa-code', color: '#23a559' },
        };
        for (const [flag, badge] of Object.entries(flagBadges)) {
            if ((flags & parseInt(flag)) && !userBadges.find(b => b.name === badge.name)) {
                userBadges.push(badge);
            }
        }

        // Nitro
        if (discordUser.avatar && discordUser.avatar.startsWith('a_')) {
            userBadges.push({ name: 'Nitro', icon: 'fa-gem', color: '#f47fff' });
        }

        userBadges.forEach(badge => {
            const b = document.createElement('span');
            b.className = 'badge';
            b.title = badge.name;
            b.style.color = badge.color;
            b.innerHTML = `<i class="fa-solid ${badge.icon}"></i>`;
            badgesEl.appendChild(b);
        });

        // Status dots (main avatar + discord card)
        const statusDot = document.getElementById('statusDot');
        const discordStatusDot = document.getElementById('discordStatusDot');
        statusDot.className = `status-dot ${user.discord_status}`;
        discordStatusDot.className = `discord-status-dot ${user.discord_status}`;

        // Banner color from user if available
        if (discordUser.banner_color) {
            document.getElementById('discordBanner').style.background = discordUser.banner_color;
        }

        if (user.activities) {
            const customStatus = user.activities.find(a => a.type === 4);
            if (customStatus && customStatus.state) {
                const emoji = customStatus.emoji ? customStatus.emoji.name + ' ' : '';
                document.getElementById('bio').textContent = emoji + customStatus.state;
            }

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
        document.getElementById('discordName').textContent = 'kammsss';
        document.getElementById('discordTag').textContent = '@kml691';
        document.getElementById('avatar').src = 'https://cdn.discordapp.com/embed/avatars/0.png';
        document.getElementById('discordAvatar').src = 'https://cdn.discordapp.com/embed/avatars/0.png';

        // Show badges even if API fails
        const badgesEl = document.getElementById('discordBadges');
        badgesEl.innerHTML = '';
        const fallbackBadges = [
            { name: 'HypeSquad Bravery', icon: 'fa-shield-heart', color: '#9b84ee' },
            { name: 'A terminé une quête', icon: 'fa-scroll', color: '#5865f2' },
            { name: 'Last Meadow Online', icon: 'fa-leaf', color: '#57f287' },
            { name: 'Apprenti', icon: 'fa-seedling', color: '#fee75c' },
        ];
        fallbackBadges.forEach(badge => {
            const b = document.createElement('span');
            b.className = 'badge';
            b.title = badge.name;
            b.style.color = badge.color;
            b.innerHTML = `<i class="fa-solid ${badge.icon}"></i>`;
            badgesEl.appendChild(b);
        });
    }
}

// ===== FETCH GITHUB =====
async function fetchGitHub() {
    try {
        const res = await fetch('https://api.github.com/users/KhdDev');
        const user = await res.json();

        document.getElementById('githubAvatar').src = user.avatar_url;
        document.getElementById('githubName').textContent = user.name || user.login;
        document.getElementById('githubTag').textContent = '@' + user.login;
        document.getElementById('githubBio').textContent = user.bio || '';

        if (user.location) {
            document.getElementById('githubLocation').innerHTML = `<i class="fa-solid fa-location-dot"></i> ${user.location}`;
        } else {
            document.getElementById('githubLocation').parentElement.style.display = 'none';
        }

        const created = new Date(user.created_at);
        const months = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
        document.getElementById('githubSince').innerHTML = `<i class="fa-brands fa-github" style="color:#fff"></i> ${created.getDate()} ${months[created.getMonth()]} ${created.getFullYear()}`;

        document.getElementById('githubStats').innerHTML = `
            <span><strong>${user.public_repos}</strong> repos</span>
            <span><strong>${user.followers}</strong> followers</span>
            <span><strong>${user.following}</strong> following</span>
        `;
    } catch (e) {
        console.warn('GitHub fetch failed:', e);
        document.getElementById('githubName').textContent = 'KhdDev';
        document.getElementById('githubTag').textContent = '@KhdDev';
        document.getElementById('githubBio').textContent = 'ripro';
        document.getElementById('githubSince').innerHTML = `<i class="fa-brands fa-github" style="color:#fff"></i> 26 avr. 2021`;
    }
}

// ===== FETCH STEAM =====
const STEAM_KEY = 'YOUR_STEAM_API_KEY';
const STEAM_ID = '76561198816671133';

async function fetchSteam() {
    try {
        const res = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_KEY}&steamids=${STEAM_ID}`);
        const data = await res.json();
        const player = data.response.players[0];

        document.getElementById('steamAvatar').src = player.avatarfull;
        document.getElementById('steamName').textContent = player.personaname;
        document.getElementById('steamTag').textContent = 'Steam ID: ' + STEAM_ID.slice(-6);

        const statusMap = {
            0: 'Hors ligne',
            1: 'En ligne',
            2: 'Occupé',
            3: 'Absent',
            4: 'Snooze',
            5: 'Échange',
            6: 'En jeu'
        };
        document.getElementById('steamStatus').textContent = statusMap[player.personastate] || 'Hors ligne';

        // Status dot
        const steamDot = document.getElementById('steamStatusDot');
        if (player.gameextrainfo) {
            steamDot.className = 'steam-status-dot ingame';
        } else if (player.personastate >= 1) {
            steamDot.className = 'steam-status-dot online';
        } else {
            steamDot.className = 'steam-status-dot offline';
        }

        // Member since
        if (player.timecreated) {
            const created = new Date(player.timecreated * 1000);
            const months = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
            document.getElementById('steamSince').innerHTML = `<i class="fa-brands fa-steam" style="color:#66c0f4"></i> ${created.getDate()} ${months[created.getMonth()]} ${created.getFullYear()}`;
        }

        // Currently playing
        if (player.gameextrainfo && player.gameid) {
            document.getElementById('steamGameSection').style.display = '';
            const cpDiv = document.getElementById('currentlyPlaying');
            cpDiv.innerHTML = `
                <img class="game-banner" src="https://cdn.cloudflare.steamstatic.com/steam/apps/${player.gameid}/header.jpg" alt="">
                <div class="game-info">
                    <span class="game-name">${player.gameextrainfo}</span>
                </div>
            `;
            cpDiv.classList.add('visible');
        }
    } catch (e) {
        console.warn('Steam fetch failed:', e);
        document.getElementById('steamName').textContent = 'everythingK 🗻';
        document.getElementById('steamTag').textContent = 'Steam ID: 671133';
        document.getElementById('steamStatus').textContent = 'Hors ligne';
        document.getElementById('steamAvatar').src = 'https://avatars.steamstatic.com/c39670fa44782ba1bd7b6f9acf20225450d3995f_full.jpg';
        document.getElementById('steamSince').innerHTML = `<i class="fa-brands fa-steam" style="color:#66c0f4"></i> 20 févr. 2018`;
    }
}

// ===== VIEW COUNTER =====
const viewCounter = document.getElementById('viewCounter');

async function updateViewCount() {
    try {
        const res = await fetch('https://api.counterapi.dev/v1/khddev-projetguns/visits/up');
        const data = await res.json();
        document.getElementById('viewCount').textContent = data.count.toLocaleString();
    } catch (e) {
        document.getElementById('viewCount').textContent = '-';
    }
}

// ===== INIT =====
fetchDiscord();
fetchGitHub();
fetchSteam();
updateViewCount();
