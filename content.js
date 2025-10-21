let isFullscreenActive = false;
let lastCanvasVideo = null;
let playerUpdateInterval = null;
let loadingTimeout = null;

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
        fontFamily: "Arial, sans-serif",
        zIndex: 9999,
        overflow: "hidden",
        background: "#000"
    });

    // spinner
    const spinner = document.createElement("div");
    spinner.id = "fullscreen-spinner";
    spinner.className = "loading-spinner";

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
        fontWeight: "bold",
        zIndex: 2,
        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        textAlign: "center"
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
        textAlign: "center"
    });

    // background blur
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
        transition: "opacity 1s ease-in-out, background-image 0.5s ease-in-out"
    });

    container.appendChild(blurBg);
    container.appendChild(spinner);
    container.appendChild(img);
    container.appendChild(title);
    container.appendChild(artist);
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
    const blurBg = document.getElementById("fullscreen-blur-bg");

    if(!coverHQ || !titleElem || !artistElem || !fullscreenCover) return;

    // cover art and text
    if(fullscreenTitle.innerText !== titleElem.innerText) {
        // animation logic
        fullscreenCover.style.opacity = "0";
        fullscreenCover.style.transform = "scale(0.9) translateY(-20px)";
        fullscreenTitle.style.opacity = "0";
        fullscreenTitle.style.transform = "translateY(20px)";
        fullscreenArtist.style.opacity = "0";
        fullscreenArtist.style.transform = "translateY(20px)";

        setTimeout(() => {
            fullscreenCover.src = coverHQ.src;
            fullscreenTitle.innerText = titleElem.innerText;

            // clean artist text
            const artistTextClean = Array.from(artistElem.querySelectorAll('a'))
                .map(a => a.textContent)
                .join(', ');
            fullscreenArtist.innerText = artistTextClean;

            // add blurred background
            blurBg.style.backgroundImage = `url(${coverHQ.src})`;

            setTimeout(() => {
                fullscreenCover.style.opacity = "1";
                fullscreenCover.style.transform = "scale(1) translateY(0)";
                fullscreenTitle.style.opacity = "1";
                fullscreenTitle.style.transform = "translateY(0)";
                fullscreenArtist.style.opacity = "1";
                fullscreenArtist.style.transform = "translateY(0)";
            }, 50);
        }, 400);
    }

    // canvas background
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
        
        // hide blur cover when video
        blurBg.style.opacity = "0";
    } else if (!canvasVideo && blurBg) {
        // show blur cover when no video
        blurBg.style.opacity = "1";
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
    const spinner = document.getElementById("fullscreen-spinner");
    
    if (isFullscreenActive) {
        // deactivate fullscreen mode
        container.style.display = "none";
        exitFullscreen();
        if (playerUpdateInterval) {
            clearInterval(playerUpdateInterval);
            playerUpdateInterval = null;
        }
        document.body.classList.remove("fullscreen-active");
        isFullscreenActive = false;
    } else {
        // activate fullscreen mode
        container.style.display = "flex";
        enableFullscreen();
        
        // loading spinner
        spinner.style.display = "block";
        const fullscreenCover = document.getElementById("fullscreen-cover");
        const fullscreenTitle = document.getElementById("fullscreen-title");
        const fullscreenArtist = document.getElementById("fullscreen-artist");
        
        fullscreenCover.style.opacity = "0";
        fullscreenTitle.style.opacity = "0";
        fullscreenArtist.style.opacity = "0";
        
        // hide spinner after content loads or timeout
        loadingTimeout = setTimeout(() => {
            spinner.style.display = "none";
            updateFullscreenPlayer();
            
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

function init() {
    createFullscreenPlayer();
    
    // listen for Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isFullscreenActive) {
            toggleFullscreenMode();
        }
    });
    
    // listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "toggleFullscreen") {
            toggleFullscreenMode();
            sendResponse({status: "success", isActive: isFullscreenActive});
        } else if (request.action === "getStatus") {
            sendResponse({isActive: isFullscreenActive});
        }
    });
}

// initialize when the page is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}