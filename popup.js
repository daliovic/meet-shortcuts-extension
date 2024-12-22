// Get message from locale
function getMessage(key) {
  return chrome.i18n.getMessage(key);
}

let activeMeetTab = null;

// Shortcut configurations
const SHORTCUT_ICONS = {
  'toggle-mic': `
    <svg viewBox="0 0 24 24" class="shortcut-icon">
      <path fill="currentColor" d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
      <path fill="currentColor" d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
    </svg>
  `,
  'toggle-camera': `
    <svg viewBox="0 0 24 24" class="shortcut-icon">
      <path fill="currentColor" d="M18 10.48V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4.48l4 3.98v-11l-4 3.98zm-2-.79V18H4V6h12v3.69z"/>
    </svg>
  `,
  'toggle-hand': `
    <svg viewBox="0 0 24 24" class="shortcut-icon">
      <path fill="currentColor" d="M21 7c0-1.38-1.12-2.5-2.5-2.5-.17 0-.34.02-.5.05V4c0-1.38-1.12-2.5-2.5-2.5-.23 0-.46.03-.67.09C14.46.66 13.56 0 12.5 0c-1.23 0-2.25.89-2.46 2.06C9.87 2.02 9.69 2 9.5 2 8.12 2 7 3.12 7 4.5v5.89c-.34-.31-.76-.54-1.22-.66L5.01 9.52c-.83-.23-1.7.09-2.19.83-.38.57-.4 1.31-.15 1.95l2.56 6.43C6.49 21.91 9.57 24 13 24h0c4.42 0 8-3.58 8-8V7z"/>
    </svg>
  `,
  'toggle-captions': `
    <svg viewBox="0 0 24 24" class="shortcut-icon">
      <path fill="currentColor" d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v-1c0-.55-.45-1-1-1zm7 0h-1.5v-.5h-2v3h2V13H18v-1c0-.55-.45-1-1-1z"/>
    </svg>
  `,
  'toggle-reactions': `
    <svg viewBox="0 0 24 24" class="shortcut-icon">
      <path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
    </svg>
  `,
  'leave-call': `
    <svg viewBox="0 0 24 24" class="shortcut-icon">
      <path fill="#ea4335" d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.73-1.68-1.36-2.66-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
    </svg>
  `
};

const SHORTCUT_NAMES = {
  'toggle-mic': getMessage('toggleMic'),
  'toggle-camera': getMessage('toggleCamera'),
  'toggle-hand': getMessage('toggleHand'),
  'toggle-captions': getMessage('toggleCaptions'),
  'toggle-reactions': getMessage('toggleReactions'),
  'leave-call': getMessage('leaveCall')
};

function createShortcutElement(command, shortcut) {
  const div = document.createElement('div');
  div.className = 'shortcut-item';
  div.dataset.command = command;
  div.innerHTML = `
    <div class="shortcut-left">
      ${SHORTCUT_ICONS[command]}
      <span>${SHORTCUT_NAMES[command]}</span>
    </div>
    <code class="shortcut-code ${!shortcut ? 'not-set' : ''}">${shortcut || getMessage('notSet')}</code>
  `;
  return div;
}

// Execute command in active Meet tab
async function executeCommand(command) {
  try {
    const tabs = await chrome.tabs.query({ url: "https://meet.google.com/*" });
    
    if (tabs.length === 0) {
      showToast(getMessage('noMeetTab'));
      return;
    }

    // Add visual feedback
    const element = document.querySelector(`[data-command="${command}"]`);
    element.classList.add('shortcut-item-active');
    setTimeout(() => element.classList.remove('shortcut-item-active'), 200);

    for (const tab of tabs) {
      try {
        await chrome.tabs.sendMessage(tab.id, { command });
      } catch (error) {
        console.error(`Error sending command to tab ${tab.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error executing command:', error);
  }
}

// Show toast message
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// Fetch and display shortcuts
chrome.commands.getAll(commands => {
  const container = document.getElementById('shortcuts-container');
  commands.forEach(command => {
    if (SHORTCUT_NAMES[command.name]) {
      const element = createShortcutElement(command.name, command.shortcut);
      element.addEventListener('click', () => executeCommand(command.name));
      container.appendChild(element);
    }
  });
});

// Initialize i18n
function initializeI18n() {
  // Set language direction
  document.documentElement.setAttribute('lang', chrome.i18n.getUILanguage());
  document.body.setAttribute('dir', ['ar'].includes(chrome.i18n.getUILanguage()) ? 'rtl' : 'ltr');
  
  // Translate all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    element.textContent = getMessage(key);
  });
}

// Initialize active meeting indicator and rating link
function initializeUI() {
  // Initialize i18n
  initializeI18n();

  // Add toast element
  const toast = document.createElement('div');
  toast.id = 'toast';
  document.body.appendChild(toast);

  // Add rating link
  const ratingLink = document.createElement('a');
  ratingLink.href = 'https://chromewebstore.google.com/detail/hhihlojiednpjklolomagbfoafbbaiih/reviews';
  ratingLink.className = 'rate-link';
  ratingLink.innerHTML = `
    <svg viewBox="0 0 24 24">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </svg>
    ${getMessage('rateExtension')}
  `;
  document.querySelector('.note').after(ratingLink);

  // Add active meeting indicator
  const meetingIndicator = document.createElement('div');
  meetingIndicator.id = 'meeting-indicator';
  meetingIndicator.style.display = 'none';
  meetingIndicator.innerHTML = `
    <div class="active-meeting">
      <span>${getMessage('activeMeeting')}</span>
      <button class="go-to-meeting">${getMessage('goToMeeting')}</button>
    </div>
  `;
  document.querySelector('.title').after(meetingIndicator);

  // Check for active meeting
  checkActiveMeeting();
}

// Check for active Meet tab
async function checkActiveMeeting() {
  const tabs = await chrome.tabs.query({ url: "https://meet.google.com/*" });
  const meetingIndicator = document.getElementById('meeting-indicator');
  
  // Filter out landing pages
  const meetingTabs = tabs.filter(tab => !tab.url.includes('landing'));
  
  if (meetingTabs.length > 0) {
    activeMeetTab = meetingTabs[0];
    meetingIndicator.style.display = 'block';
    
    // Add click handler for "Go to meeting" button
    document.querySelector('.go-to-meeting').onclick = () => {
      chrome.tabs.update(activeMeetTab.id, { active: true });
      chrome.windows.update(activeMeetTab.windowId, { focused: true });
    };
  } else {
    activeMeetTab = null;
    meetingIndicator.style.display = 'none';
  }
}

// Handle links
document.addEventListener('click', (e) => {
  if (e.target.matches('.configure-link')) {
    if (e.target.href && e.target.href.startsWith('https://')) {
      chrome.tabs.create({ url: e.target.href });
    } else {
      chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
    }
    e.preventDefault();
  }
});

// Initialize UI when popup opens
document.addEventListener('DOMContentLoaded', initializeUI);
