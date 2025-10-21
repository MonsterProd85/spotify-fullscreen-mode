document.addEventListener('DOMContentLoaded', function() {
  const toggleButton = document.getElementById('toggleButton');
  const statusElement = document.getElementById('status');
  
  // Check current status when popup opens
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0].url.includes('open.spotify.com')) {
      // Enable the button and check status
      toggleButton.disabled = false;
      chrome.tabs.sendMessage(tabs[0].id, {action: "getStatus"}, function(response) {
        if (chrome.runtime.lastError) {
          statusElement.textContent = 'Status: Extension not ready on this page';
          return;
        }
        
        updateUI(response.isActive);
      });
    } else {
      toggleButton.disabled = true;
      statusElement.textContent = 'Status: Please navigate to Spotify Web Player';
    }
  });
  
  // Toggle fullscreen mode
  toggleButton.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        {action: "toggleFullscreen"},
        function(response) {
          if (response && response.status === "success") {
            updateUI(response.isActive);
          }
        }
      );
    });
  });
  
  function updateUI(isActive) {
    if (isActive) {
      toggleButton.textContent = 'Disable Fullscreen Mode';
      statusElement.textContent = 'Status: Active';
    } else {
      toggleButton.textContent = 'Enable Fullscreen Mode';
      statusElement.textContent = 'Status: Not active';
    }
  }
});