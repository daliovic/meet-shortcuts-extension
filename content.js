// content.js
const SELECTOR_ALTERNATIVES = {
  "toggle-mic": [
    'button[data-mute-button="true"][aria-label*="microphone"]',
    ".VYBDae-Bz112c-LgbsSe[data-is-muted]",
    'button[data-promo-anchor-id="aSBQL"]',
    'button[aria-label*="microphone"]',
    'div[aria-label*="Turn off microphone"]',
    'div[aria-label*="Turn on microphone"]',
  ],
  "toggle-camera": [
    'button[data-mute-button="true"][aria-label*="camera"]',
    ".VYBDae-Bz112c-LgbsSe[data-video-state]",
    'button[data-promo-anchor-id="yhZxwc"]',
    'button[aria-label*="camera"]',
    'button[aria-label*="Turn camera off"]',
    'button[aria-label*="Turn camera on"]',
  ],
  "toggle-hand": [
    'button[aria-label*="Raise hand"]',
    'button[jsname="FpSaz"]',
    'button[data-promo-anchor-id="e7iErc"]'
  ],
  "toggle-captions": [
    'button[aria-label*="captions"]',
    'button[jsname="r8qRAd"]'
  ],
  "toggle-reactions": [
    'button[aria-label="Send a reaction"]',
    'button[jsname="G0pghc"]'
  ],
  "leave-call": [
    'button[aria-label="Leave call"]',
    'button[jsname="CQylAd"]'
  ]
};

function findButton(selectors) {
  return selectors
    .map((selector) => document.querySelector(selector))
    .find((el) => el !== null);
}

// Set up message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    const { command } = message;
    console.log("Received command:", command);

    if (command in SELECTOR_ALTERNATIVES) {
      const button = findButton(SELECTOR_ALTERNATIVES[command]);
      if (button) {
        button.click();
        sendResponse({ success: true });
      } else {
        console.warn(`Button not found for command: ${command}`);
        sendResponse({ success: false, error: "Button not found" });
      }
    }
  } catch (error) {
    console.error("Error in content script:", error);
    sendResponse({ success: false, error: error.message });
  }
  return true; // Keep the message channel open for async response
});

// Log when content script is loaded
console.log("Meet Shortcuts content script loaded");

// Let the extension know the content script is ready
chrome.runtime.sendMessage({ type: "CONTENT_SCRIPT_LOADED" });
