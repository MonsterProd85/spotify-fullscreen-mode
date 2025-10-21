document.addEventListener('DOMContentLoaded', function() {
  const toggleButton = document.getElementById('toggleButton');
  const statusElement = document.getElementById('status');
  
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0] && tabs[0].url && tabs[0].url.includes('open.spotify.com')) {
      toggleButton.disabled = false;
      chrome.tabs.sendMessage(tabs[0].id, {action: "getStatus"}, function(response) {
        if (chrome.runtime.lastError) {
          return;
        }
        
        if (response && response.isActive !== undefined) {
          updateUI(response.isActive);
        }
      });
    } else {
      toggleButton.disabled = true;
      statusElement.textContent = 'status: navigate to spotify web player';
    }
  });
  
  toggleButton.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0] && tabs[0].url && tabs[0].url.includes('open.spotify.com')) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          {action: "toggleFullscreen"},
          function(response) {
            if (chrome.runtime.lastError) {
              return;
            }
            
            if (response && response.status === "success") {
              updateUI(response.isActive);
            }
          }
        );
      }
    });
  });
  
  function updateUI(isActive) {
    if (isActive) {
      toggleButton.textContent = 'disable fullscreen mode';
      statusElement.textContent = 'status: active';
    } else {
      toggleButton.textContent = 'enable fullscreen mode';
      statusElement.textContent = 'status: not active';
    }
  }
});