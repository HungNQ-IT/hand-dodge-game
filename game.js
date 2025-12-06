// ========================================
// HAND DODGE GAME - Computer Vision Game
// ========================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const video = document.getElementById('videoElement');

// Game State
let gameState = 'start';
let score = 0;
let lives = 3;
let gameSpeed = 2;
let frameCount = 0;

// Hand Tracking
let handX = canvas.width / 2;
let handY = canvas.height / 2;
let isHandDetected = false;
let isFist = false;
let shieldActive = false;
let shieldCooldown = 0;
let detector = null;

// Game Objects
let obstacles = [];
let powerups = [];
let particles = [];

// Player
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 25,
    color: '#4ecdc4',
    trail: []
};

// Setup Hand Detector
async function setupHandDetector() {
    try {
        console.log('Loading TensorFlow backend...');
        await tf.ready();
        await tf.setBackend('webgl');
        
        console.log('Loading hand detector...');
        const model = handPoseDetection.SupportedModels.MediaPipeHands;
        const detectorConfig = {
            runtime: 'tfjs',
            modelType: 'lite',
            maxHands: 1
        };
        detector = await handPoseDetection.createDetector(model, detectorConfig);
        console.log('✅ Hand detector loaded!');
        return true;
    } catch (error) {
        console.error('❌ Error loading hand detector:', error);
        document.getElementById('status').textContent = '❌ Lỗi tải model AI: ' + error.message;
        return false;
    }
}

// Camera Setup
async function setupCamera() {
    try {
        // Check if running on HTTPS or localhost
        if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
            throw new Error('Camera chỉ hoạt động trên HTTPS hoặc localhost. Vui lòng chạy: python3 -m http.server 8000');
        }
        
        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Trình duyệt không hỗ trợ camera API. Vui lòng dùng Chrome/Edge/Firefox phiên bản mới.');
        }
        
        console.log('Requesting camera access...');
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { 
                width: { ideal: 640 }, 
                height: { ideal: 480 }, 
                facingMode: 'user' 
            }
        });
        
        video.srcObject = stream;
        video.style.display = 'block';
        
        await new Promise((resolve) => {
            video.onloadedmetadata = () => {
                console.log('✅ Camera loaded, starting video...');
                video.play();
                resolve();
            };
        });
        
        // Wait a bit for video to actually start
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('✅ Camera ready!');
        document.getElementById('status').textContent = '✅ Camera sẵn sàng! Nhấn nút để chơi.';
        document.getElementById('startButton').disabled = false;
        return true;
    } catch (error) {
        document.getElementById('status').innerHTML = '❌ Lỗi camera:<br>' + error.message;
        console.error('❌ Camera error:', error);
        return false;
    }
}

// Detect Hand
async function detectHand() {
    if (!detector || video.readyState !== 4) return;
    
    try {
        const hands = await detector.estimateHands(video, {
            flipHorizontal: false
        });
        
        if (hands.length > 0) {
            const hand = hands[0];
            const keypoints = hand.keypoints;
            
            // Get palm center (keypoint 9)
            const palmCenter = keypoints[9];
            
            // Mirror the X coordinate for natural movement
            handX = (video.videoWidth - palmCenter.x) * (canvas.width / video.videoWidth);
            handY = palmCenter.y * (canvas.height / video.videoHeight);
            
            // Clamp to canvas bounds
            handX = Math.max(player.radius, Math.min(canvas.width - player.radius, handX));
            handY = Math.max(player.radius, Math.min(canvas.height - player.radius, handY));
            
            isHandDetected = true;
            
            // Detect fist
            isFist = detectFistGesture(keypoints);
            updateGestureIndicator();
        } else {
            isHandDetected = false;
        }
    } catch (error) {
        console.error('Detection error:', error);
    }
}

// Detect Fist Gesture
function detectFistGesture(keypoints) {
    // Fingertips: thumb(4), index(8), middle(12), ring(16), pinky(20)
    // Knuckles: thumb(3), index(6), middle(10), ring(14), pinky(18)
    
    const fingerTips = [8, 12, 16, 20];
    const fingerKnuckles = [6, 10, 14, 18];
    
    let closedFingers = 0;
    for (let i = 0; i < fingerTips.length; i++) {
        const tipY = keypoints[fingerTips[i]].y;
        const knuckleY = keypoints[fingerKnuckles[i]].y;
        if (tipY > knuckleY) {
            closedFingers++;
        }
    }
    
    // Thumb check
    const thumbTip = keypoints[4];
    const thumbBase = keypoints[2];
    const thumbClosed = Math.abs(thumbTip.x - thumbBase.x) < 30;
    
    return closedFingers >= 3 && thumbClosed;
}

// Update Gesture Indicator
function updateGestureIndicator() {
    const indicator = document.getElementById('gestureIndicator');
    if (isFist && !shieldActive && shieldCooldown === 0) {
        indicator.textContent = '🛡️ Shield Ready!';
        indicator.style.background = 'rgba(76, 209, 55, 0.9)';
    } else if (shieldActive) {
        indicator.textContent = '🛡️ Shield Active!';
        indicator.style.background = 'rgba(52, 152, 219, 0.9)';
    } else if (shieldCooldown > 0) {
        indicator.textContent = `⏳ Cooldown: ${Math.ceil(shieldCooldown / 60)}s`;
        indicator.style.background = 'rgba(231, 76, 60, 0.9)';
    } else {
        indicator.textContent = '✋ Open Hand';
        indicator.style.background = 'rgba(255, 255, 255, 0.9)';
    }
}

// Start Game
async function startGame() {
    console.log('🎮 Starting game...');
    
    if (!detector) {
        alert('AI model chưa sẵn sàng! Vui lòng đợi...');
        return;
    }
    
    if (video.readyState !== 4) {
        alert('Camera chưa sẵn sàng! Vui lòng đợi...');
        return;
    }
    
    document.getElementById('startScreen').classList.add('hidden');
    gameState = 'playing';
    
    // Reset game
    score = 0;
    lives = 3;
    gameSpeed = 2;
    frameCount = 0;
    obstacles = [];
    powerups = [];
    particles = [];
    
    console.log('✅ Game started! State:', gameState);
    
    // Start game loop
    gameLoop();
}

// Restart Game
function restartGame() {
    document.getElementById('gameOverScreen').classList.add('hidden');
    startGame();
}

// Game Loop
let loopCount = 0;
async function gameLoop() {
    if (gameState !== 'playing') {
        console.log('Game loop stopped, state:', gameState);
        return;
    }
    
    loopCount++;
    if (loopCount % 60 === 0) {
        console.log('Game running... Frame:', loopCount, 'Hand detected:', isHandDetected);
    }
    
    await detectHand();
    update();
    draw();
    
    requestAnimationFrame(gameLoop);
}

// Update Game Logic
function update() {
    frameCount++;
    
    // Update player position
    if (isHandDetected) {
        player.x += (handX - player.x) * 0.2;
        player.y += (handY - player.y) * 0.2;
        
        player.trail.push({ x: player.x, y: player.y, alpha: 1 });
        if (player.trail.length > 10) player.trail.shift();
    }
    
    player.trail.forEach(t => t.alpha -= 0.1);
    
    // Shield activation
    if (isFist && !shieldActive && shieldCooldown === 0) {
        shieldActive = true;
        shieldCooldown = 180;
        setTimeout(() => {
            shieldActive = false;
        }, 3000);
    }
    
    if (shieldCooldown > 0) {
        shieldCooldown--;
    }
    
    // Spawn obstacles
    if (frameCount % 60 === 0) {
        obstacles.push({
            x: canvas.width + 30,
            y: Math.random() * (canvas.height - 60) + 30,
            radius: 20 + Math.random() * 10,
            speed: gameSpeed + Math.random() * 2,
            color: '#e74c3c'
        });
    }
    
    // Spawn powerups
    if (frameCount % 180 === 0) {
        powerups.push({
            x: canvas.width + 30,
            y: Math.random() * (canvas.height - 60) + 30,
            radius: 15,
            speed: gameSpeed,
            color: '#f39c12'
        });
    }
    
    // Update obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.x -= obs.speed;
        
        if (obs.x < -50) {
            obstacles.splice(i, 1);
            score += 10;
            continue;
        }
        
        const dist = Math.hypot(player.x - obs.x, player.y - obs.y);
        if (dist < player.radius + obs.radius) {
            if (shieldActive) {
                obstacles.splice(i, 1);
                createExplosion(obs.x, obs.y, '#3498db');
                score += 50;
            } else {
                obstacles.splice(i, 1);
                lives--;
                createExplosion(player.x, player.y, '#e74c3c');
                
                if (lives <= 0) {
                    gameOver();
                }
            }
        }
    }
    
    // Update powerups
    for (let i = powerups.length - 1; i >= 0; i--) {
        const pow = powerups[i];
        pow.x -= pow.speed;
        
        if (pow.x < -50) {
            powerups.splice(i, 1);
            continue;
        }
        
        const dist = Math.hypot(player.x - pow.x, player.y - pow.y);
        if (dist < player.radius + pow.radius) {
            powerups.splice(i, 1);
            score += 100;
            createExplosion(pow.x, pow.y, '#f39c12');
        }
    }
    
    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.02;
        if (p.alpha <= 0) particles.splice(i, 1);
    }
    
    // Increase difficulty
    if (frameCount % 600 === 0) {
        gameSpeed += 0.5;
    }
    
    // Update UI
    document.getElementById('score').textContent = `Score: ${score}`;
    document.getElementById('lives').textContent = `❤️ Lives: ${lives}`;
}

// Draw Game
function draw() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
    
    // Particles
    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    ctx.globalAlpha = 1;
    
    // Player trail
    player.trail.forEach(t => {
        ctx.fillStyle = player.color;
        ctx.globalAlpha = t.alpha * 0.3;
        ctx.beginPath();
        ctx.arc(t.x, t.y, player.radius * 0.8, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
    
    // Player
    if (isHandDetected) {
        const gradient = ctx.createRadialGradient(player.x, player.y, 0, player.x, player.y, player.radius * 2);
        gradient.addColorStop(0, 'rgba(78, 205, 196, 0.3)');
        gradient.addColorStop(1, 'rgba(78, 205, 196, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(player.x - player.radius * 2, player.y - player.radius * 2, player.radius * 4, player.radius * 4);
        
        ctx.fillStyle = player.color;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(player.x - 8, player.y - 5, 4, 0, Math.PI * 2);
        ctx.arc(player.x + 8, player.y - 5, 4, 0, Math.PI * 2);
        ctx.fill();
        
        if (shieldActive) {
            ctx.strokeStyle = '#3498db';
            ctx.lineWidth = 4;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(player.x, player.y, player.radius + 15, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }
    
    // Obstacles
    obstacles.forEach(obs => {
        const gradient = ctx.createRadialGradient(obs.x, obs.y, 0, obs.x, obs.y, obs.radius * 1.5);
        gradient.addColorStop(0, 'rgba(231, 76, 60, 0.5)');
        gradient.addColorStop(1, 'rgba(231, 76, 60, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(obs.x - obs.radius * 1.5, obs.y - obs.radius * 1.5, obs.radius * 3, obs.radius * 3);
        
        ctx.fillStyle = obs.color;
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#c0392b';
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(obs.x, obs.y);
            ctx.lineTo(obs.x + Math.cos(angle) * obs.radius, obs.y + Math.sin(angle) * obs.radius);
            ctx.lineTo(obs.x + Math.cos(angle + 0.4) * obs.radius, obs.y + Math.sin(angle + 0.4) * obs.radius);
            ctx.fill();
        }
    });
    
    // Powerups
    powerups.forEach(pow => {
        const gradient = ctx.createRadialGradient(pow.x, pow.y, 0, pow.x, pow.y, pow.radius * 2);
        gradient.addColorStop(0, 'rgba(243, 156, 18, 0.5)');
        gradient.addColorStop(1, 'rgba(243, 156, 18, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(pow.x - pow.radius * 2, pow.y - pow.radius * 2, pow.radius * 4, pow.radius * 4);
        
        ctx.fillStyle = pow.color;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
            const x = pow.x + Math.cos(angle) * pow.radius;
            const y = pow.y + Math.sin(angle) * pow.radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
            
            const innerAngle = angle + Math.PI / 5;
            const innerX = pow.x + Math.cos(innerAngle) * (pow.radius * 0.5);
            const innerY = pow.y + Math.sin(innerAngle) * (pow.radius * 0.5);
            ctx.lineTo(innerX, innerY);
        }
        ctx.closePath();
        ctx.fill();
    });
}

// Create Explosion
function createExplosion(x, y, color) {
    for (let i = 0; i < 20; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            size: Math.random() * 4 + 2,
            alpha: 1,
            color: color
        });
    }
}

// Game Over
function gameOver() {
    gameState = 'gameover';
    document.getElementById('finalScore').textContent = `Điểm của bạn: ${score}`;
    document.getElementById('gameOverScreen').classList.remove('hidden');
}

// Initialize
async function init() {
    console.log('🎮 Initializing game...');
    document.getElementById('status').textContent = '⏳ Đang tải AI model...';
    
    try {
        const detectorLoaded = await setupHandDetector();
        if (!detectorLoaded) {
            console.error('Failed to load detector');
            document.getElementById('status').innerHTML = '❌ Không thể tải AI model.<br>Vui lòng kiểm tra kết nối internet!';
            return;
        }
        
        document.getElementById('status').textContent = '⏳ Đang khởi động camera...';
        const cameraReady = await setupCamera();
        if (!cameraReady) {
            console.error('Failed to setup camera');
            return;
        }
        
        console.log('🎮 Game ready!');
    } catch (error) {
        console.error('Init error:', error);
        document.getElementById('status').innerHTML = '❌ Lỗi khởi tạo: ' + error.message;
    }
}

// Wait for page to fully load
window.addEventListener('load', () => {
    console.log('Page loaded, checking dependencies...');
    
    // Check if TensorFlow is loaded
    if (typeof tf === 'undefined') {
        console.error('❌ TensorFlow.js not loaded!');
        document.getElementById('status').innerHTML = '❌ Lỗi: TensorFlow.js không tải được.<br>Kiểm tra kết nối internet!';
        return;
    }
    
    // Check if HandPoseDetection is loaded
    if (typeof handPoseDetection === 'undefined') {
        console.error('❌ HandPoseDetection not loaded!');
        document.getElementById('status').innerHTML = '❌ Lỗi: Hand detection library không tải được.<br>Kiểm tra kết nối internet!';
        return;
    }
    
    console.log('✅ All dependencies loaded!');
    console.log('TensorFlow version:', tf.version.tfjs);
    
    // Start initialization
    setTimeout(init, 100);
});
