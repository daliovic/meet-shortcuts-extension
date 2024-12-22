// background.js
chrome.commands.onCommand.addListener(async (command) => {
  try {
    const tabs = await chrome.tabs.query({ url: "https://meet.google.com/*" });

    for (const tab of tabs) {
      try {
        // Send message and catch any connection errors
        await chrome.tabs.sendMessage(tab.id, { command }).catch((error) => {
          console.log(`Failed to send command to tab ${tab.id}:`, error);
          // If content script isn't ready, try reinjecting it
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"],
          });
        });
      } catch (error) {
        console.error(`Error with tab ${tab.id}:`, error);
      }
    }
  } catch (error) {
    console.error("Error in background script:", error);
  }
});
