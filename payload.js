// payload.js

// Function to extract chat content using registered platform modules
function extractChatContent() {
    if (!window.platformModules) {
        console.warn('No platform modules registered');
        return [];
    }

    for (const mod of window.platformModules) {
        try {
            if (typeof mod.isActivePage === 'function' && mod.isActivePage()) {
                if (typeof mod.extractChatHistory === 'function') {
                    return mod.extractChatHistory();
                }
            }
        } catch (e) {
            console.error('Error detecting platform', e);
        }
    }

    console.warn('This does not appear to be a recognized chat window');
    return [];
}

// Send the chat content as a Chrome message
chrome.runtime.sendMessage({ type: 'chatHistory', data: extractChatContent() });
