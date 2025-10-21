// Spotify Fullscreen Mode - Content Script
let isFullscreenActive = false;
let lastCanvasVideo = null;
let playerUpdateInterval = null;

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
        display: "none",  // Start hidden, will be shown when activated
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontFamily: "Arial, sans-serif",
        zIndex: 9999,
        overflow: "hidden",
        background: "#000"
    });

    const img = document.createElement("img");
    img.id = "fullscreen-cover";
    Object.assign(img.style, {
        width: "450px",
        height: "450px",
        objectFit: "cover",
        borderRadius: "20px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
        zIndex: 2,
        transition: "opacity 0.4s ease"
    });

    const title = document.createElement("div");
    title.id = "fullscreen-title";
    Object.assign(title.style, {
        marginTop: "20px",
        fontSize: "28px",
        fontWeight: "bold",
        zIndex: 2,
        transition: "opacity 0.4s ease",
        textAlign: "center"
    });

    const artist = document.createElement("div");
    artist.id = "fullscreen-artist";
    Object.assign(artist.style, {
        fontSize: "18px",
        opacity: "0.8",
        transition: "opacity 0.4s ease",
        zIndex: 2,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: "90vw",
        textAlign: "center"
    });

    const exitButton = document.createElement("button");
    exitButton.id = "fullscreen-exit";
    exitButton.innerText = "Exit Fullscreen";
    Object.assign(exitButton.style, {
        position: "absolute",
        top: "20px",
        right: "20px",
        padding: "8px 16px",
        background: "rgba(0,0,0,0.5)",
        border: "none",
        borderRadius: "4px",
        color: "white",
        cursor: "pointer",
        zIndex: 3
    });
    exitButton.addEventListener("click", toggleFullscreenMode);

    container.appendChild(img);
    container.appendChild(title);
    container.appendChild(artist);
    container.appendChild(exitButton);
    document.body.appendChild(container);
}

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

    if(!coverHQ || !titleElem || !artistElem || !fullscreenCover) return;

    // Update cover and text
    if(fullscreenTitle.innerText !== titleElem.innerText) {
        fullscreenCover.style.opacity = "0";
        fullscreenTitle.style.opacity = "0";
        fullscreenArtist.style.opacity = "0";

        setTimeout(() => {
            fullscreenCover.src = coverHQ.src;
            fullscreenTitle.innerText = titleElem.innerText;

            // Clean artist text
            const artistTextClean = Array.from(artistElem.querySelectorAll('a'))
                .map(a => a.textContent)
                .join(', ');
            fullscreenArtist.innerText = artistTextClean;

            fullscreenCover.style.opacity = "1";
            fullscreenTitle.style.opacity = "1";
            fullscreenArtist.style.opacity = "1";
        }, 200);
    }

    // Canvas background (no animation)
    if(canvasVideo && canvasVideo.parentElement !== container) {
        canvasVideo.style.position = "absolute";
        canvasVideo.style.top = "0";
        canvasVideo.style.left = "0";
        canvasVideo.style.width = "100%";
        canvasVideo.style.height = "100%";
        canvasVideo.style.objectFit = "cover";
        canvasVideo.style.filter = "blur(6px) brightness(0.5)";
        canvasVideo.style.transform = "scale(1.05)";
        canvasVideo.style.zIndex = "0";
        canvasVideo.style.display = "block";
        container.insertBefore(canvasVideo, container.firstChild);
        lastCanvasVideo = canvasVideo;
    }

    // Fallback if no canvas
    if(!canvasVideo && coverHQ) {
        getDominantColor(coverHQ.src, color => {
            container.style.background = color;
        });
    }
    document.title = "Spotify Live Player";
}

function enableFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
    }
}

function exitFullscreen() {
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
    }
}

function toggleFullscreenMode() {
    const container = document.getElementById("fullscreen-player");
    
    if (isFullscreenActive) {
        // Deactivate fullscreen mode
        container.style.display = "none";
        exitFullscreen();
        if (playerUpdateInterval) {
            clearInterval(playerUpdateInterval);
            playerUpdateInterval = null;
        }
        isFullscreenActive = false;
    } else {
        // Activate fullscreen mode
        container.style.display = "flex";
        enableFullscreen();
        updateFullscreenPlayer();
        playerUpdateInterval = setInterval(updateFullscreenPlayer, 1000);
        isFullscreenActive = true;
    }
}

function init() {
    createFullscreenPlayer();
    
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "toggleFullscreen") {
            toggleFullscreenMode();
            sendResponse({status: "success", isActive: isFullscreenActive});
        } else if (request.action === "getStatus") {
            sendResponse({isActive: isFullscreenActive});
        }
    });
}

// Initialize when the page is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}