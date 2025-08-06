// Track shown modals to avoid spam
let shownModals = new Set();

// Function to show modal notification
function showBlockedChannelModal(channelName, isChannelPage = false) {
  // Don't show modal if already shown for this channel in this session
  if (shownModals.has(channelName.toLowerCase())) {
    return;
  }
  shownModals.add(channelName.toLowerCase());

  // Remove existing modal if any
  const existingModal = document.getElementById('ytcf-blocked-channel-modal');
  if (existingModal) {
    existingModal.remove();
  }

  // Create modal
  const modal = document.createElement('div');
  modal.id = 'ytcf-blocked-channel-modal';
  modal.innerHTML = `
    <div class="ytcf-modal-overlay">
      <div class="ytcf-modal-content">
        <div class="ytcf-modal-header">
          <h3>🚫 Kênh đã bị chặn</h3>
          <button class="ytcf-modal-close">&times;</button>
        </div>
        <div class="ytcf-modal-body">
          <p>Kênh "<strong>${channelName}</strong>" đã có trong danh sách chặn của bạn.</p>
          ${isChannelPage ?
            '<p>Bạn đang xem trang kênh này. Video từ kênh này sẽ bị ẩn ở các trang khác như trang chủ, tìm kiếm, đề xuất.</p>' :
            '<p>Video từ kênh này sẽ bị ẩn ở các trang khác.</p>'
          }
        </div>
        <div class="ytcf-modal-footer">
          <button class="ytcf-btn ytcf-btn-primary" id="ytcf-remove-from-blacklist">Bỏ chặn kênh</button>
          <button class="ytcf-btn ytcf-btn-secondary" id="ytcf-modal-ok">OK</button>
        </div>
      </div>
    </div>
  `;

  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    #ytcf-blocked-channel-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 10000;
      font-family: 'Roboto', sans-serif;
    }
    .ytcf-modal-overlay {
      background: rgba(0, 0, 0, 0.7);
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .ytcf-modal-content {
      background: white;
      border-radius: 8px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      animation: ytcf-modal-appear 0.3s ease-out;
    }
    @keyframes ytcf-modal-appear {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }
    .ytcf-modal-header {
      padding: 20px 20px 10px;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .ytcf-modal-header h3 {
      margin: 0;
      color: #333;
      font-size: 18px;
    }
    .ytcf-modal-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #999;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .ytcf-modal-close:hover {
      color: #333;
    }
    .ytcf-modal-body {
      padding: 20px;
      color: #333;
      line-height: 1.5;
    }
    .ytcf-modal-body p {
      margin: 0 0 10px 0;
    }
    .ytcf-modal-footer {
      padding: 10px 20px 20px;
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }
    .ytcf-btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    }
    .ytcf-btn-primary {
      background: #ff4444;
      color: white;
    }
    .ytcf-btn-primary:hover {
      background: #cc3333;
    }
    .ytcf-btn-secondary {
      background: #f0f0f0;
      color: #333;
    }
    .ytcf-btn-secondary:hover {
      background: #e0e0e0;
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(modal);

  // Event listeners
  const closeModal = () => {
    modal.remove();
    style.remove();
  };

  modal.querySelector('.ytcf-modal-close').onclick = closeModal;
  modal.querySelector('#ytcf-modal-ok').onclick = closeModal;
  modal.querySelector('.ytcf-modal-overlay').onclick = (e) => {
    if (e.target === e.currentTarget) closeModal();
  };

  // Remove from blacklist functionality
  modal.querySelector('#ytcf-remove-from-blacklist').onclick = () => {
    chrome.storage.local.get(['blockChannels'], (data) => {
      const blockChannels = data.blockChannels || [];
      const updatedChannels = blockChannels.filter(c =>
        !c.toLowerCase().includes(channelName.toLowerCase()) &&
        !channelName.toLowerCase().includes(c.toLowerCase())
      );

      chrome.storage.local.set({ blockChannels: updatedChannels }, () => {
        closeModal();
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #4CAF50;
          color: white;
          padding: 12px 20px;
          border-radius: 4px;
          z-index: 10001;
          font-family: 'Roboto', sans-serif;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        successMsg.textContent = `Đã bỏ chặn kênh "${channelName}"`;
        document.body.appendChild(successMsg);
        setTimeout(() => successMsg.remove(), 3000);
      });
    });
  };

  // Auto close after 10 seconds
  setTimeout(closeModal, 10000);
}

function hideUnwantedVideos() {
  chrome.storage.local.get(['blockKeywords', 'blockChannels', 'blockShorts'], ({ blockKeywords = [], blockChannels = [], blockShorts = true }) => {

    // Determine current page context
    const currentUrl = window.location.href;
    const isChannelPage = currentUrl.includes('/channel/') || currentUrl.includes('/@');
    const isSearchPage = currentUrl.includes('/results?search_query=');

    // Check if searching for a blocked channel
    if (isSearchPage) {
      const searchQuery = new URLSearchParams(window.location.search).get('search_query')?.toLowerCase();
      if (searchQuery && blockChannels.length > 0) {
        // Clean search query
        const cleanSearch = searchQuery.trim().replace(/^@/, '');

        const blockedChannel = blockChannels.find(c => {
          const cleanChannel = c.toLowerCase().trim().replace(/^@/, '');
          // More precise matching - search query should closely match channel name
          return cleanChannel === cleanSearch ||
                 cleanChannel.includes(cleanSearch) ||
                 cleanSearch.includes(cleanChannel);
        });

        if (blockedChannel) {
          // Show modal after a short delay to ensure page is loaded and check if channel results exist
          setTimeout(() => {
            // Only show modal if there are actual channel results on the page
            const hasChannelResults = document.querySelector('ytd-channel-renderer, #avatar-section, #channel-header');
            if (hasChannelResults) {
              showBlockedChannelModal(blockedChannel);
            }
          }, 1500);
        }
      }
    }

    // Check if directly visiting a blocked channel page
    if (isChannelPage && blockChannels.length > 0) {
      setTimeout(() => {
        // Multiple selectors to find channel name on different YouTube layouts
        const channelNameSelectors = [
          '#channel-name #text',
          '#channel-header-container #channel-name',
          'ytd-channel-name #text',
          '#owner-name a',
          '#channel-title',
          'yt-formatted-string#text',
          '#text.ytd-channel-name',
          '.ytd-channel-name #text',
          '#channel-name yt-formatted-string',
          'h1.ytd-channel-name',
          '.channel-header-content h1',
          '#channel-header #channel-name'
        ];

        let channelName = '';
        for (const selector of channelNameSelectors) {
          const el = document.querySelector(selector);
          if (el && el.textContent?.trim()) {
            channelName = el.textContent.trim();
            break;
          }
        }

        // Also try to get from URL if name not found in DOM
        if (!channelName) {
          const urlMatch = currentUrl.match(/@([^\/\?]+)/);
          if (urlMatch) {
            channelName = urlMatch[1];
          }
        }

        if (channelName) {
          const cleanChannelName = channelName.toLowerCase().trim().replace(/^@/, '');

          const blockedChannel = blockChannels.find(c => {
            const cleanChannel = c.toLowerCase().trim().replace(/^@/, '');
            return cleanChannel === cleanChannelName ||
                   cleanChannel.includes(cleanChannelName) ||
                   cleanChannelName.includes(cleanChannel);
          });

          if (blockedChannel) {
            showBlockedChannelModal(blockedChannel, true);
          }
        }
      }, 2000); // Longer delay for channel page to fully load
    }

    // All video containers - expanded selectors for better coverage
    const videos = document.querySelectorAll('ytd-rich-item-renderer, ytd-video-renderer, ytd-rich-grid-media, ytd-compact-video-renderer, ytd-movie-renderer, ytd-playlist-video-renderer');

    videos.forEach(video => {
      // More precise detection of what should NOT be blocked
      const isChannelResult = video.closest('ytd-channel-renderer') ||
                             video.querySelector('ytd-channel-renderer') ||
                             video.classList.contains('ytd-channel-renderer') ||
                             video.querySelector('#avatar-section, #channel-header, #subscriber-count');

      const isPlaylistResult = video.closest('ytd-playlist-renderer') ||
                              video.querySelector('ytd-playlist-renderer') ||
                              video.classList.contains('ytd-playlist-renderer');

      // Skip non-video content
      if (isChannelResult || isPlaylistResult) {
        return;
      }

      // Skip if viewing a channel page directly
      if (isChannelPage) {
        return;
      }

      // Enhanced title selectors - must have a video title to be considered a video
      const titleEl = video.querySelector('#video-title, #video-title-link, h3 a[href*="/watch"], a[href*="/watch"] h3, #meta h3 a, .ytd-video-meta-block h3 a, #dismissible h3 a, .title a, [id="video-title"]');
      if (!titleEl) {
        return; // Not a video if no video title found
      }

      // Enhanced channel selectors - more comprehensive
      const channelEl = video.querySelector([
        'ytd-channel-name a',
        '#channel-info #text a',
        '#metadata #byline a',
        '.ytd-video-meta-block #byline a',
        '#channel-name a',
        'yt-formatted-string[id="text"] a',
        '#owner-text a',
        '#byline a',
        '.ytd-channel-name a',
        'a[href*="/channel/"]:not([href*="/channel/UC"]):not([href*="/c/"])',
        'a[href*="/@"]'
      ].join(', '));

      const title = titleEl?.innerText?.toLowerCase() || titleEl?.textContent?.toLowerCase() || '';
      let channel = channelEl?.innerText?.toLowerCase() || channelEl?.textContent?.toLowerCase() || '';

      // Clean channel name - remove extra whitespace and common prefixes
      channel = channel.trim().replace(/^by\s+/i, '');

      // Only block if we have actual content to check
      if (!title && !channel) {
        return;
      }

      const isBlockedByKeyword = blockKeywords.some(k => title.includes(k.toLowerCase()));
      const isBlockedByChannel = blockChannels.some(c => {
        const cleanBlockedChannel = c.toLowerCase().trim();
        return channel && (channel.includes(cleanBlockedChannel) || cleanBlockedChannel.includes(channel));
      });

      if (isBlockedByKeyword || isBlockedByChannel) {
        video.style.display = 'none';
      }
    });

    // Handle Shorts blocking
    if (blockShorts) {
      // Method 1: Hide by URL pattern
      document.querySelectorAll('a[href*="/shorts/"]').forEach(link => {
        const container = link.closest('ytd-rich-item-renderer, ytd-video-renderer, ytd-rich-grid-media, ytd-compact-video-renderer, ytd-reel-shelf-renderer, ytd-rich-section-renderer');
        if (container) container.style.display = 'none';
      });

      // Method 2: Hide by duration (Shorts are usually < 1 min)
      document.querySelectorAll('span.ytd-thumbnail-overlay-time-status-renderer').forEach(duration => {
        const text = duration.textContent.trim();
        if (text && !text.includes(':') && parseInt(text) < 60) {
          const container = duration.closest('ytd-rich-item-renderer, ytd-video-renderer, ytd-rich-grid-media, ytd-compact-video-renderer');
          if (container) container.style.display = 'none';
        }
      });

      // Method 3: Hide Shorts sections
      document.querySelectorAll('ytd-reel-shelf-renderer, ytd-rich-shelf-renderer, [is-shorts], [aria-label*="Shorts"]').forEach(shelf => {
        shelf.style.display = 'none';
      });

      // Method 4: Hide sidebar Shorts
      document.querySelectorAll('a[href="/shorts"], a[href*="shorts"]').forEach(item => {
        const wrapper = item.closest('ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer');
        if (wrapper) wrapper.style.display = 'none';
      });

      // Method 5: Enhanced search page Shorts detection
      document.querySelectorAll('ytd-video-renderer').forEach(video => {
        // Check for Shorts badge/label
        const shortsLabel = video.querySelector('[aria-label*="Shorts"], [title*="Shorts"], .badge-style-type-simple[aria-label*="Short"]');
        if (shortsLabel) {
          video.style.display = 'none';
          return;
        }

        // Check for vertical aspect ratio thumbnails (typical for Shorts)
        const thumbnail = video.querySelector('img');
        if (thumbnail) {
          const aspectRatio = thumbnail.naturalWidth / thumbnail.naturalHeight;
          if (aspectRatio < 0.8) {
            video.style.display = 'none';
            return;
          }
        }

        // Check for #Shorts hashtag in title or description
        const titleElement = video.querySelector('#video-title');
        const descElement = video.querySelector('#description-text, .metadata-snippet-text');
        const titleText = titleElement?.textContent?.toLowerCase() || '';
        const descText = descElement?.textContent?.toLowerCase() || '';

        if (titleText.includes('#shorts') || descText.includes('#shorts') ||
            titleText.includes('#short') || descText.includes('#short')) {
          video.style.display = 'none';
        }
      });

      // Method 6: Hide Shorts in grid layout
      document.querySelectorAll('ytd-rich-item-renderer').forEach(item => {
        const link = item.querySelector('a[href*="/shorts/"]');
        if (link) {
          item.style.display = 'none';
        }
      });
    }
  });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'refreshBlocking') {
    hideUnwantedVideos();
    sendResponse({status: 'refreshed'});
  }
});

hideUnwantedVideos();
setInterval(hideUnwantedVideos, 800);

let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    // Reset modal tracking when navigating to different pages or different channels
    const isNewChannel = url.includes('/channel/') || url.includes('/@');
    const isNewSearch = url.includes('/results?search_query=');

    if (isNewChannel || isNewSearch || (!url.includes('/results?search_query=') && !url.includes('/channel/') && !url.includes('/@'))) {
      shownModals.clear();
    }
    setTimeout(hideUnwantedVideos, 300);
  }
}).observe(document, { subtree: true, childList: true });



