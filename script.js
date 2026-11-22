/* =============================================
   MUNIZA - THE ROYAL BIRTHDAY CARD
   Interactive Logic, Canvas Physics & Audio
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
    // ============ STATE ============
    let currentSceneId = 'scene-intro';
    let isTransitioning = false;
    let isMusicPlaying = false;
    let audioCtx = null;
    let bgMusicTimer = null;
    let bgAudio = null;

    // Feature States
    let wishIndex = 0;
    const wishesList = [
        "May your 20th year be as radiant, pure, and breathtaking as you are. 💖",
        "May every whispered dream you've held close to your heart come to life. 🌟",
        "May your smile never fade, because it truly has the power to heal the world. 🌸",
        "You deserve a lifetime filled with deep peace, endless laughter, and true love. 💎",
        "I thank the universe every day for the blessing of having you in my life, MUNIZA. 👑"
    ];

    let isCandleBlown = false;
    let isLetterTyped = false;
    let typewriterTimeout = null;

    // ============ WEB AUDIO SOUND ENGINE ============
    function getAudioContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function playTone(freq, type = 'sine', duration = 0.4, gainLevel = 0.1) {
        try {
            const ctx = getAudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);

            gain.gain.setValueAtTime(0.001, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(gainLevel, ctx.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {}
    }

    // Melodic Sound Effects
    function playChime() {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((n, i) => {
            setTimeout(() => playTone(n, 'triangle', 0.5, 0.12), i * 90);
        });
    }

    function playSparkleSound() {
        const freq = 1200 + Math.random() * 800;
        playTone(freq, 'sine', 0.15, 0.04);
    }

    function playFireworksBoom() {
        try {
            const ctx = getAudioContext();
            // Noise buffer
            const bufferSize = ctx.sampleRate * 0.5;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(250, ctx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.5);

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            noise.start();
            noise.stop(ctx.currentTime + 0.5);
        } catch (e) {}
    }

    // Background Romantic Music Loop (Synthesizer + Audio Fallback)
    const romanticMelody = [
        392.00, 440.00, 493.88, 587.33, 523.25, 493.88, 440.00, // G A B D C B A
        392.00, 493.88, 587.33, 659.25, 587.33, 523.25, 493.88, // G B D E D C B
        523.25, 659.25, 783.99, 659.25, 587.33, 523.25, 493.88, // C E G E D C B
        440.00, 493.88, 523.25, 587.33, 493.88, 440.00, 392.00  // A B C D B A G
    ];
    let melIdx = 0;

    function playMusicStep() {
        if (!isMusicPlaying) return;
        const note = romanticMelody[melIdx];
        playTone(note, 'triangle', 0.6, 0.08);
        melIdx = (melIdx + 1) % romanticMelody.length;
        bgMusicTimer = setTimeout(playMusicStep, 450);
    }

    function toggleBackgroundMusic(force) {
        isMusicPlaying = typeof force === 'boolean' ? force : !isMusicPlaying;
        const btn = document.getElementById('musicBtn');
        const ico = document.getElementById('musicIco');

        if (isMusicPlaying) {
            btn.classList.add('playing');
            ico.textContent = '🎶';
            if (!bgAudio) {
                bgAudio = new Audio('https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3');
                bgAudio.loop = true;
                bgAudio.volume = 0.45;
            }
            bgAudio.play().catch(() => {
                clearTimeout(bgMusicTimer);
                playMusicStep();
            });
        } else {
            btn.classList.remove('playing');
            ico.textContent = '🔇';
            if (bgAudio) bgAudio.pause();
            clearTimeout(bgMusicTimer);
        }
    }

    document.getElementById('musicBtn').addEventListener('click', () => toggleBackgroundMusic());

    // ============ SCENE SWITCHER ============
    function goToScene(nextId) {
        if (isTransitioning || currentSceneId === nextId) return;
        isTransitioning = true;

        const current = document.getElementById(currentSceneId);
        const next = document.getElementById(nextId);

        if (!current || !next) {
            isTransitioning = false;
            return;
        }

        current.classList.add('fade-exit');

        setTimeout(() => {
            current.classList.remove('active', 'fade-exit');
            current.style.display = 'none';

            next.style.display = 'flex';
            next.classList.add('active', 'fade-enter');
            currentSceneId = nextId;

            onEnterScene(nextId);

            setTimeout(() => {
                next.classList.remove('fade-enter');
                isTransitioning = false;
            }, 600);
        }, 450);
    }

    function onEnterScene(id) {
        if (id === 'scene-letter') {
            if (!isLetterTyped) startTypewriter();
        } else if (id === 'scene-finale') {
            launchContinuousFireworks();
            autoReleaseLanterns(3);
        }
    }

    // ============ SCENE 1: WAX SEAL & 3D TILT ============
    const sealBox = document.getElementById('sealBox');
    const waxSeal = document.getElementById('waxSeal');

    // 3D Tilt on Mouse / Touch Move
    function handleCardMove(x, y) {
        if (currentSceneId !== 'scene-intro') return;
        const rect = sealBox.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (x - centerX) / (rect.width / 2);
        const deltaY = (y - centerY) / (rect.height / 2);

        const rotateX = -deltaY * 12;
        const rotateY = deltaX * 12;

        const cardFace = sealBox.querySelector('.card-face');
        if (cardFace) {
            cardFace.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        }
    }

    window.addEventListener('mousemove', (e) => handleCardMove(e.clientX, e.clientY));
    window.addEventListener('touchmove', (e) => {
        if (e.touches[0]) handleCardMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    function breakSeal() {
        playChime();
        toggleBackgroundMusic(true);

        // Spawn gold burst particles around the seal
        const rect = waxSeal.getBoundingClientRect();
        for (let i = 0; i < 35; i++) {
            particles.push(new GoldenParticle(rect.left + rect.width / 2, rect.top + rect.height / 2, true));
        }

        waxSeal.style.transform = 'scale(1.4)';
        waxSeal.style.opacity = '0';
        waxSeal.style.transition = 'all 0.4s ease';

        setTimeout(() => {
            goToScene('scene-queen');
        }, 500);
    }

    waxSeal.addEventListener('click', breakSeal);
    sealBox.addEventListener('click', breakSeal);

    // ============ SCENE 2: QUEEN REVEAL ============
    document.getElementById('btnQueenNext').addEventListener('click', () => {
        playChime();
        goToScene('scene-wishes');
    });

    // ============ SCENE 3: WISHES JAR ============
    const jarContainer = document.getElementById('jarContainer');
    const wishCard = document.getElementById('wishCard');
    const wishText = document.getElementById('wishText');
    const wishCountEl = document.getElementById('wishCount');
    const btnWishesNext = document.getElementById('btnWishesNext');

    jarContainer.addEventListener('click', () => {
        if (wishIndex >= wishesList.length) {
            wishIndex = 0;
        }

        playChime();

        // Spawn burst from jar
        const rect = jarContainer.getBoundingClientRect();
        for (let i = 0; i < 25; i++) {
            particles.push(new GoldenParticle(rect.left + rect.width / 2, rect.top + rect.height / 3, true));
        }

        // Display current wish with animation
        wishCard.style.animation = 'none';
        void wishCard.offsetHeight;
        wishCard.style.animation = 'jarGlow 0.5s ease';

        wishText.textContent = wishesList[wishIndex];
        wishIndex++;
        wishCountEl.textContent = Math.min(wishIndex, wishesList.length);

        if (wishIndex >= 3) {
            btnWishesNext.style.display = 'block';
        }
    });

    btnWishesNext.addEventListener('click', () => {
        playChime();
        goToScene('scene-cake');
    });

    // ============ SCENE 4: ROYAL CAKE & CANDLE ============
    const royalFlame = document.getElementById('royalFlame');
    const btnBlowCandle = document.getElementById('btnBlowCandle');
    const candlePrompt = document.getElementById('candlePrompt');
    const cakeStage = document.getElementById('cakeStage');

    function extinguishCandle() {
        if (isCandleBlown) return;
        isCandleBlown = true;

        royalFlame.classList.add('extinguished');
        playTone(300, 'sine', 0.8, 0.15); // soft whoosh

        candlePrompt.textContent = '✨ WISH GRANTED! Happy 20th Birthday, MUNIZA! ✨';
        candlePrompt.style.color = '#FFF2B2';
        candlePrompt.style.fontWeight = 'bold';

        // Little celebratory fireworks
        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                fireworks.push(new Firework(
                    window.innerWidth * (0.2 + Math.random() * 0.6),
                    window.innerHeight * (0.2 + Math.random() * 0.4)
                ));
                playFireworksBoom();
            }, i * 250);
        }

        setTimeout(() => {
            goToScene('scene-letter');
        }, 2200);
    }

    royalFlame.addEventListener('click', extinguishCandle);
    cakeStage.addEventListener('click', extinguishCandle);
    btnBlowCandle.addEventListener('click', extinguishCandle);

    // ============ SCENE 5: PARCHMENT LETTER TYPEWRITER ============
    const letterTypedBody = document.getElementById('letterTypedBody');
    const letterSign = document.getElementById('letterSign');
    const btnLetterNext = document.getElementById('btnLetterNext');
    const parchmentContainer = document.getElementById('parchmentContainer');

    const LETTER_TEXT = `On this milestone 20th birthday, I wanted to create something truly worthy of who you are.

You are one of the rarest, kindest, and most genuine souls in this world. Your radiant smile carries so much warmth, and your presence alone turns any gloomy day into sunshine.

I hope this new decade blesses you with abundant peace, good health, wild success in everything your heart desires, and memories sweeter than you ever imagined.

Never ever forget how deeply special, cherished, and admired you are, MUNIZA.

Happy Birthday, Queen! 👑✨`;

    function startTypewriter() {
        clearTimeout(typewriterTimeout);
        letterTypedBody.innerHTML = '';
        letterSign.classList.remove('show');
        btnLetterNext.disabled = true;
        isLetterTyped = false;

        let charIdx = 0;
        const blinker = document.createElement('span');
        blinker.className = 'type-blinker';

        function typeChar() {
            if (charIdx < LETTER_TEXT.length) {
                const char = LETTER_TEXT[charIdx];
                if (char === '\n') {
                    letterTypedBody.appendChild(document.createElement('br'));
                } else {
                    letterTypedBody.appendChild(document.createTextNode(char));
                }
                charIdx++;

                if (blinker.parentNode) blinker.remove();
                letterTypedBody.appendChild(blinker);

                parchmentContainer.scrollTop = parchmentContainer.scrollHeight;

                typewriterTimeout = setTimeout(typeChar, 25);
            } else {
                if (blinker.parentNode) blinker.remove();
                letterSign.classList.add('show');
                btnLetterNext.disabled = false;
                isLetterTyped = true;
                playChime();
            }
        }

        typewriterTimeout = setTimeout(typeChar, 400);
    }

    btnLetterNext.addEventListener('click', () => {
        playChime();
        goToScene('scene-finale');
    });

    // ============ SCENE 6: FINALE SKY LANTERNS & REPLAY ============
    document.getElementById('btnReleaseLantern').addEventListener('click', () => {
        playSparkleSound();
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                skyLanterns.push(new SkyLantern(
                    window.innerWidth * (0.15 + Math.random() * 0.7),
                    window.innerHeight + 40
                ));
            }, i * 200);
        }
    });

    document.getElementById('btnFullReplay').addEventListener('click', () => {
        // Reset state
        isCandleBlown = false;
        royalFlame.classList.remove('extinguished');
        candlePrompt.textContent = '🔥 Tap the flame to blow out the candle and launch the grand celebration!';
        candlePrompt.style.color = '';
        candlePrompt.style.fontWeight = '';

        wishIndex = 0;
        wishCountEl.textContent = '0';
        wishText.textContent = 'Tap the jar to make your first wish...';
        btnWishesNext.style.display = 'none';

        isLetterTyped = false;
        letterTypedBody.innerHTML = '';
        letterSign.classList.remove('show');
        btnLetterNext.disabled = true;

        waxSeal.style.transform = '';
        waxSeal.style.opacity = '';

        goToScene('scene-intro');
    });

    // ============ CANVAS 1: AMBIENT GOLD DUST & TOUCH TRAILS ============
    const ambientCanvas = document.getElementById('ambientCanvas');
    const aCtx = ambientCanvas.getContext('2d');
    let particles = [];

    function resizeCanvases() {
        ambientCanvas.width = window.innerWidth;
        ambientCanvas.height = window.innerHeight;
        fireworksCanvas.width = window.innerWidth;
        fireworksCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvases);
    resizeCanvases();

    class GoldenParticle {
        constructor(x, y, isBurst = false) {
            this.x = x ?? Math.random() * ambientCanvas.width;
            this.y = y ?? Math.random() * ambientCanvas.height;
            this.size = Math.random() * (isBurst ? 3.5 : 2.2) + 0.8;
            this.baseAlpha = Math.random() * 0.6 + 0.3;
            this.alpha = this.baseAlpha;
            const angle = Math.random() * Math.PI * 2;
            const speed = isBurst ? Math.random() * 5 + 1.5 : Math.random() * 0.6 + 0.2;
            this.vx = Math.cos(angle) * speed;
            this.vy = isBurst ? Math.sin(angle) * speed : -(Math.random() * 0.5 + 0.3);
            this.decay = isBurst ? Math.random() * 0.015 + 0.01 : 0;
            this.life = 1;
            this.hue = Math.random() > 0.4 ? 45 : 340; // Gold or Rose
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.decay > 0) {
                this.life -= this.decay;
                this.alpha = this.life * this.baseAlpha;
            } else {
                if (this.y < -10) this.y = ambientCanvas.height + 10;
                if (this.x < -10) this.x = ambientCanvas.width + 10;
                if (this.x > ambientCanvas.width + 10) this.x = -10;
            }
        }
        draw(ctx) {
            if (this.alpha <= 0) return;
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 90%, 75%, ${this.alpha})`;
            ctx.shadowBlur = 10;
            ctx.shadowColor = `hsl(${this.hue}, 100%, 65%)`;
            ctx.fill();
            ctx.restore();
        }
    }

    // Initialize initial ambient floaters
    for (let i = 0; i < 45; i++) {
        particles.push(new GoldenParticle());
    }

    // Touch & pointer interaction to spawn fairy dust trail
    function spawnTouchDust(x, y) {
        playSparkleSound();
        for (let i = 0; i < 4; i++) {
            particles.push(new GoldenParticle(x, y, true));
        }
    }

    window.addEventListener('pointermove', (e) => {
        if (Math.random() > 0.6) spawnTouchDust(e.clientX, e.clientY);
    });

    window.addEventListener('touchstart', (e) => {
        if (e.touches[0]) spawnTouchDust(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    function animateAmbient() {
        aCtx.clearRect(0, 0, ambientCanvas.width, ambientCanvas.height);
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.update();
            p.draw(aCtx);
            if (p.decay > 0 && p.life <= 0) {
                particles.splice(i, 1);
            }
        }
        requestAnimationFrame(animateAmbient);
    }
    animateAmbient();

    // ============ CANVAS 2: FIREWORKS & SKY LANTERNS ============
    const fireworksCanvas = document.getElementById('fireworksCanvas');
    const fCtx = fireworksCanvas.getContext('2d');
    let fireworks = [];
    let skyLanterns = [];
    let fireworksInterval = null;

    class Firework {
        constructor(targetX, targetY) {
            this.x = targetX;
            this.y = targetY;
            this.sparks = [];
            const hues = [45, 340, 200, 280, 160];
            const hue = hues[Math.floor(Math.random() * hues.length)];

            for (let i = 0; i < 50; i++) {
                const angle = (Math.PI * 2 * i) / 50 + (Math.random() - 0.5) * 0.2;
                const speed = Math.random() * 4.5 + 1.5;
                this.sparks.push({
                    x: this.x,
                    y: this.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    alpha: 1,
                    decay: Math.random() * 0.016 + 0.012,
                    gravity: 0.04,
                    hue: hue,
                    size: Math.random() * 2 + 1.2
                });
            }
        }
        update() {
            for (let i = this.sparks.length - 1; i >= 0; i--) {
                const s = this.sparks[i];
                s.x += s.vx;
                s.y += s.vy;
                s.vy += s.gravity;
                s.vx *= 0.98;
                s.vy *= 0.98;
                s.alpha -= s.decay;
                if (s.alpha <= 0) {
                    this.sparks.splice(i, 1);
                }
            }
        }
        draw(ctx) {
            ctx.save();
            this.sparks.forEach(s => {
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${s.hue}, 95%, 70%, ${s.alpha})`;
                ctx.shadowBlur = 8;
                ctx.shadowColor = `hsl(${s.hue}, 100%, 60%)`;
                ctx.fill();
            });
            ctx.restore();
        }
    }

    class SkyLantern {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.vy = -(Math.random() * 0.8 + 0.6);
            this.vx = (Math.random() - 0.5) * 0.4;
            this.width = 24;
            this.height = 34;
            this.wobble = Math.random() * Math.PI;
            this.alpha = 0.95;
        }
        update() {
            this.wobble += 0.02;
            this.x += this.vx + Math.sin(this.wobble) * 0.3;
            this.y += this.vy;
            if (this.y < 80) {
                this.alpha -= 0.005;
            }
        }
        draw(ctx) {
            if (this.alpha <= 0) return;
            ctx.save();
            ctx.globalAlpha = this.alpha;
            // Lantern Body (Warm Golden Orange Glow)
            const grad = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
            grad.addColorStop(0, '#FFE899');
            grad.addColorStop(0.5, '#FF9933');
            grad.addColorStop(1, '#CC4400');

            ctx.shadowBlur = 18;
            ctx.shadowColor = 'rgba(255, 170, 50, 0.9)';

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(this.x - this.width / 2, this.y, this.width, this.height, [4, 4, 8, 8]);
            ctx.fill();

            // Candle flicker inside
            ctx.beginPath();
            ctx.arc(this.x, this.y + this.height - 6, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();

            ctx.restore();
        }
    }

    function autoReleaseLanterns(count = 2) {
        for (let i = 0; i < count; i++) {
            skyLanterns.push(new SkyLantern(
                window.innerWidth * (0.2 + Math.random() * 0.6),
                window.innerHeight + 20 + i * 40
            ));
        }
    }

    function launchContinuousFireworks() {
        clearInterval(fireworksInterval);
        fireworksInterval = setInterval(() => {
            if (currentSceneId === 'scene-finale') {
                fireworks.push(new Firework(
                    window.innerWidth * (0.15 + Math.random() * 0.7),
                    window.innerHeight * (0.15 + Math.random() * 0.45)
                ));
                playFireworksBoom();
                if (Math.random() > 0.6) autoReleaseLanterns(1);
            }
        }, 1600);
    }

    function animateFireworks() {
        fCtx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

        // Update & Draw Fireworks
        for (let i = fireworks.length - 1; i >= 0; i--) {
            const fw = fireworks[i];
            fw.update();
            fw.draw(fCtx);
            if (fw.sparks.length === 0) {
                fireworks.splice(i, 1);
            }
        }

        // Update & Draw Sky Lanterns
        for (let i = skyLanterns.length - 1; i >= 0; i--) {
            const l = skyLanterns[i];
            l.update();
            l.draw(fCtx);
            if (l.alpha <= 0 || l.y < -50) {
                skyLanterns.splice(i, 1);
            }
        }

        requestAnimationFrame(animateFireworks);
    }
    animateFireworks();

    console.log('👑 MUNIZA Royal Birthday Card Loaded Successfully!');
});
