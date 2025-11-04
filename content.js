let isFullscreenActive = false;
let lastCanvasVideo = null;
let playerUpdateInterval = null;
let loadingTimeout = null;
let isPlaying = true;
let patternAnimationId = null;

// create main player container
function createFullscreenPlayer() {
    if (document.getElementById("fullscreen-player")) return;

    const container = document.createElement("div");
    container.id = "fullscreen-player";
    Object.assign(container.style, {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "none",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontFamily: "'Montserrat', sans-serif",
        zIndex: 9999,
        overflow: "hidden",
        background: "#000"
    });

    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&display=swap';
    document.head.appendChild(fontLink);

    const spinner = document.createElement("div");
    spinner.id = "fullscreen-spinner";
    spinner.className = "loading-spinner";

    const patternOverlay = document.createElement("div");
    patternOverlay.id = "pattern-overlay";

    const img = document.createElement("img");
    img.id = "fullscreen-cover";
    Object.assign(img.style, {
        width: "450px",
        height: "450px",
        objectFit: "cover",
        borderRadius: "20px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
        zIndex: 2,
        transition: "all 0.7s cubic-bezier(0.4, 0, 0.2, 1)"
    });

    const title = document.createElement("div");
    title.id = "fullscreen-title";
    Object.assign(title.style, {
        marginTop: "20px",
        fontSize: "28px",
        fontWeight: "700",
        zIndex: 2,
        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        textAlign: "center",
        fontFamily: "'Montserrat', sans-serif"
    });

    const artist = document.createElement("div");
    artist.id = "fullscreen-artist";
    Object.assign(artist.style, {
        fontSize: "18px",
        opacity: "0.8",
        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        zIndex: 2,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: "90vw",
        textAlign: "center",
        fontFamily: "'Montserrat', sans-serif",
        marginTop: "15px"
    });

    const blurBg = document.createElement("div");
    blurBg.id = "fullscreen-blur-bg";
    Object.assign(blurBg.style, {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: "blur(30px) brightness(0.4)",
        transform: "scale(1.2)",
        zIndex: 0,
        transition: "all 0.8s ease-in-out"
    });

    container.appendChild(blurBg);
    container.appendChild(patternOverlay);
    container.appendChild(spinner);
    container.appendChild(img);
    container.appendChild(title);
    container.appendChild(artist);
    document.body.appendChild(container);
}

// extract color from image
function getDominantColor(src, callback) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = function() {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, img.width, img.height).data;
        let r=0,g=0,b=0,count=0;
        for(let i=0;i<data.length;i+=40){r+=data[i];g+=data[i+1];b+=data[i+2];count++;}
        callback(`rgb(${Math.floor(r/count)},${Math.floor(g/count)},${Math.floor(b/count)})`);
    };
    img.onerror = function() { callback("#000"); };
}

// animate background pattern
function animatePattern() {
    const overlay = document.getElementById('pattern-overlay');
    if (!overlay) return;
    
    let time = Date.now() * 0.001;
    const brightness = Math.sin(time * 0.2) * 0.05 + 0.95;
    
    // more obvious pattern for testing
    const x1 = 50 + Math.sin(time * 0.1) * 25;
    const y1 = 50 + Math.cos(time * 0.11) * 25;
    const x2 = 50 + Math.sin(time * 0.12 + 2) * 25;
    const y2 = 50 + Math.cos(time * 0.13 + 1) * 25;
    
    overlay.style.background = `radial-gradient(
        circle at ${x1}% ${y1}%, 
        rgba(255, 255, 255, 0.25), 
        transparent 35%
    ), 
    radial-gradient(
        circle at ${x2}% ${y2}%, 
        rgba(255, 255, 255, 0.2), 
        transparent 30%
    ),
    radial-gradient(
        circle at ${80 - x1}% ${90 - y2}%, 
        rgba(255, 255, 255, 0.18), 
        transparent 35%
    ),
    radial-gradient(
        circle at ${20 + x2}% ${y1 - 10}%, 
        rgba(255, 255, 255, 0.22), 
        transparent 30%
    )`;
    
    if (isFullscreenActive && isPlaying) {
        patternAnimationId = requestAnimationFrame(animatePattern);
    }
}

// check if music is playing or paused
function updatePlayState() {
    const playButton = document.querySelector('button[data-testid="control-button-playpause"]');
    if (!playButton) return;
    
    const newPlayState = playButton.getAttribute('aria-label').toLowerCase().includes('play');
    
    if (isPlaying !== !newPlayState) {
        isPlaying = !newPlayState;
        const cover = document.getElementById('fullscreen-cover');
        const title = document.getElementById('fullscreen-title');
        const artist = document.getElementById('fullscreen-artist');
        const blurBg = document.getElementById('fullscreen-blur-bg');
        
        if (cover && title && artist && blurBg) {
            if (!isPlaying) {
                // paused state
                cover.style.transform = 'scale(0.95)';
                cover.classList.add('monochrome80');
                title.classList.add('lowopacity');
                title.style.transform = 'scale(0.95) translateY(-10px)';
                artist.classList.add('lowopacity');
                artist.style.transform = 'scale(0.95) translateY(-10px)';
                blurBg.classList.add('dimmed');
                
                if (patternAnimationId) {
                    cancelAnimationFrame(patternAnimationId);
                    patternAnimationId = null;
                }
            } else {
                // playing state
                cover.style.transform = 'scale(1)';
                cover.classList.remove('monochrome80');
                title.classList.remove('lowopacity');
                title.style.transform = 'scale(1) translateY(0)';
                artist.classList.remove('lowopacity');
                artist.style.transform = 'scale(1) translateY(0)';
                blurBg.classList.remove('dimmed');
                
                if (!patternAnimationId) {
                    animatePattern();
                }
            }
        }
    }
}

// update fullscreen player with current song info
function updateFullscreenPlayer() {
    if (!isFullscreenActive) return;

    const coverHQ = document.querySelector("#Desktop_PanelContainer_Id img[data-testid='cover-art-image']");
    const titleElem = document.querySelector('[data-testid="context-item-info-title"]');
    const artistElem = document.querySelector('[data-testid="context-item-info-subtitles"]');
    const canvasVideo = document.querySelector("#Desktop_PanelContainer_Id video");
    const fullscreenCover = document.getElementById("fullscreen-cover");
    const fullscreenTitle = document.getElementById("fullscreen-title");
    const fullscreenArtist = document.getElementById("fullscreen-artist");
    const container = document.getElementById("fullscreen-player");
    const blurBg = document.getElementById("fullscreen-blur-bg");
    
    updatePlayState();

    if(!coverHQ || !titleElem || !artistElem || !fullscreenCover) return;

    if(fullscreenTitle.innerText !== titleElem.innerText) {
        fullscreenCover.style.opacity = "0";
        fullscreenCover.style.transform = isPlaying ? "scale(0.9) translateY(-20px)" : "scale(0.85) translateY(-20px)";
        fullscreenTitle.style.opacity = "0";
        fullscreenTitle.style.transform = "translateY(20px)";
        fullscreenArtist.style.opacity = "0";
        fullscreenArtist.style.transform = "translateY(20px)";

        setTimeout(() => {
            fullscreenCover.src = coverHQ.src;
            fullscreenTitle.innerText = titleElem.innerText;

            const artistTextClean = Array.from(artistElem.querySelectorAll('a'))
                .map(a => a.textContent)
                .join(', ');
            fullscreenArtist.innerText = artistTextClean;

            blurBg.style.backgroundImage = `url(${coverHQ.src})`;
            blurBg.classList.add('background-cover');
            
            // apply monochrome if paused
            if (!isPlaying) {
                fullscreenTitle.classList.add('monochrome');
                fullscreenArtist.classList.add('monochrome');
                blurBg.classList.add('dimmed');
            } else {
                fullscreenTitle.classList.remove('monochrome');
                fullscreenArtist.classList.remove('monochrome');
                blurBg.classList.remove('dimmed');
            }

            setTimeout(() => {
                fullscreenCover.style.opacity = "1";
                fullscreenCover.style.transform = isPlaying ? "scale(1) translateY(0)" : "scale(0.95) translateY(0)";
                fullscreenTitle.style.opacity = "1";
                fullscreenTitle.style.transform = "translateY(0)";
                fullscreenArtist.style.opacity = "1";
                fullscreenArtist.style.transform = "translateY(0)";
            }, 50);
        }, 400);
    }

    // handle canvas video
    if(canvasVideo) {
        if(canvasVideo.parentElement !== container) {
            canvasVideo.style.position = "absolute";
            canvasVideo.style.top = "0";
            canvasVideo.style.left = "0";
            canvasVideo.style.width = "100%";
            canvasVideo.style.height = "100%";
            canvasVideo.style.objectFit = "cover";
            canvasVideo.style.filter = "blur(6px) brightness(0.5)";
            canvasVideo.style.transform = "scale(1.05)";
            canvasVideo.style.zIndex = "1";
            canvasVideo.style.display = "block";
            container.insertBefore(canvasVideo, container.firstChild);
            lastCanvasVideo = canvasVideo;
        }
    } else {
        // no canvas video available
        // if(lastCanvasVideo && lastCanvasVideo.parentNode) {
        //     lastCanvasVideo.parentNode.removeChild(lastCanvasVideo);
        //     lastCanvasVideo = null;
        // }
    }
    document.title = "Spotify Live Player"
}

// enter fullscreen mode
function enableFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
    }
}

// exit fullscreen mode
function exitFullscreen() {
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
    }
}

// toggle fullscreen player on/off
function toggleFullscreenMode() {
    const container = document.getElementById("fullscreen-player");
    const spinner = document.getElementById("fullscreen-spinner");
    
    if (isFullscreenActive) {
        container.style.display = "none";
        exitFullscreen();
        if (playerUpdateInterval) {
            clearInterval(playerUpdateInterval);
            playerUpdateInterval = null;
        }
        if (patternAnimationId) {
            cancelAnimationFrame(patternAnimationId);
            patternAnimationId = null;
        }
        document.body.classList.remove("fullscreen-active");
        isFullscreenActive = false;
    } else {
        container.style.display = "flex";
        enableFullscreen();
        
        spinner.style.display = "block";
        const fullscreenCover = document.getElementById("fullscreen-cover");
        const fullscreenTitle = document.getElementById("fullscreen-title");
        const fullscreenArtist = document.getElementById("fullscreen-artist");
        
        fullscreenCover.style.opacity = "0";
        fullscreenTitle.style.opacity = "0";
        fullscreenArtist.style.opacity = "0";
        
        loadingTimeout = setTimeout(() => {
            spinner.style.display = "none";
            updateFullscreenPlayer();
            
            animatePattern();
            
            setTimeout(() => {
                fullscreenCover.style.opacity = "1";
                fullscreenTitle.style.opacity = "1";
                fullscreenArtist.style.opacity = "1";
            }, 100);
        }, 1500);
        
        playerUpdateInterval = setInterval(updateFullscreenPlayer, 1000);
        document.body.classList.add("fullscreen-active");
        isFullscreenActive = true;
    }
}

// initialize extension
function init() {
    createFullscreenPlayer();
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isFullscreenActive) {
            toggleFullscreenMode();
        }
    });
    
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "toggleFullscreen") {
            toggleFullscreenMode();
            sendResponse({status: "success", isActive: isFullscreenActive});
        } else if (request.action === "getStatus") {
            sendResponse({isActive: isFullscreenActive});
        }
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}

let audio = null;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "play") {
    if (!audio) {
      audio = new Audio(msg.url);
      audio.loop = true;
    }
    audio.play();
    sendResponse({status: "playing"});
  } else if (msg.action === "pause") {
    if (audio) audio.pause();
    sendResponse({status: "paused"});
  }
});
