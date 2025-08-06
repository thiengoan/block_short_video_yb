function renderList(id, items) {
  const list = document.getElementById(id);
  list.innerHTML = '';
  items.forEach((item, i) => {
    const li = document.createElement('li');
    li.textContent = item;
    li.onclick = () => {
      items.splice(i, 1);
      saveLists();
    };
    list.appendChild(li);
  });
}

function saveLists() {
  chrome.storage.local.set({ 
    blockKeywords, 
    blockChannels,
    blockShorts: document.getElementById('blockShortsToggle').checked 
  }, () => renderAll());
}

function renderAll() {
  renderList('keywordList', blockKeywords);
  renderList('channelList', blockChannels);

  // Update counts
  document.getElementById('keywordCount').textContent = `(${blockKeywords.length})`;
  document.getElementById('channelCount').textContent = `(${blockChannels.length})`;
}

function addKeyword() {
  const input = document.getElementById('keywordInput');
  const val = input.value.trim();
  if (val && !blockKeywords.includes(val.toLowerCase())) {
    blockKeywords.push(val.toLowerCase());
    input.value = '';
    saveLists();
  }
}

function addChannel() {
  const input = document.getElementById('channelInput');
  const val = input.value.trim();
  if (val && !blockChannels.includes(val.toLowerCase())) {
    // Clean the channel name - remove common prefixes and normalize
    const cleanChannelName = val.toLowerCase()
      .replace(/^@/, '') // Remove @ prefix if present
      .replace(/^by\s+/i, '') // Remove "by " prefix
      .trim();

    if (!blockChannels.includes(cleanChannelName)) {
      blockChannels.push(cleanChannelName);
      input.value = '';
      saveLists();

      // Send message to content script to refresh blocking
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0] && tabs[0].url.includes('youtube.com')) {
          chrome.tabs.sendMessage(tabs[0].id, {action: 'refreshBlocking'});
        }
      });
    }
  }
}

let blockKeywords = [];
let blockChannels = [];

document.addEventListener('DOMContentLoaded', () => {
  // Load data first
  chrome.storage.local.get(['blockKeywords', 'blockChannels', 'blockShorts'], (data) => {
    blockKeywords = data.blockKeywords || [];
    blockChannels = data.blockChannels || [];
    document.getElementById('blockShortsToggle').checked = !!data.blockShorts;
    renderAll();
  });

  // Add event listeners
  document.getElementById('blockShortsToggle').addEventListener('change', (e) => {
    chrome.storage.local.set({ blockShorts: e.target.checked });
  });

  document.getElementById('keywordInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  });

  document.getElementById('channelInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addChannel();
    }
  });

  // Fix button selectors
  document.getElementById('addKeywordBtn').onclick = addKeyword;
  document.getElementById('addChannelBtn').onclick = addChannel;
});




