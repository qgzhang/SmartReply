// payload.js

// Function to extract chat content
function extractChatContent() {
    // Try to detect if this is a Microsoft Teams chat
    const teamsChatContainer = document.querySelector('div[data-tid="message-pane-list-runway"]');
    if (teamsChatContainer) {
        return extractTeamsChat(teamsChatContainer);
    }

    // Try to detect if this is a Telegram chat
    const telegramChatContainer = document.querySelector('div.message');
    if (telegramChatContainer) {
        return extractTelegramChat();
    }

    console.warn("This does not appear to be a recognized chat window");
    return [];
}

function extractTeamsChat(chatContainer) {
    const chatItems = chatContainer.querySelectorAll('div[data-tid="chat-pane-item"]');
    const chatHistory = [];

    chatItems.forEach((chatItem) => {
        const senderElement = chatItem.querySelector('span[data-tid="message-author-name"]');
        const sender = senderElement ? senderElement.innerText : "Unknown Sender";

        const timestampElement = chatItem.querySelector('time');
        const timestamp = timestampElement ? timestampElement.getAttribute('aria-label') : "Unknown Time";

        const messageContentElement = chatItem.querySelector('div[data-tid="chat-pane-message"]');
        let messageContent = messageContentElement ? extractTextWithSpans(messageContentElement).trim() : "No Content";

        if (sender !== "Unknown Sender" || timestamp !== "Unknown Time" || messageContent !== "No Content") {
            chatHistory.push({ sender, timestamp, content: messageContent });
        }
    });

    return chatHistory;
}

function extractTelegramChat() {
    const chatItems = document.querySelectorAll('div.message.spoilers-container');
    const chatHistory = [];

    chatItems.forEach((chatItem) => {
        let messageContent = "";
        const translatableMessage = chatItem.querySelector('span.translatable-message');
        if (translatableMessage) {
            messageContent = translatableMessage.innerText.trim();
        } else {
            messageContent = chatItem.childNodes[0]?.nodeValue?.trim() || "No Content";
        }

        const timestampElement = chatItem.querySelector('span.i18n');
        const timestamp = timestampElement ? timestampElement.innerText.trim() : "Unknown Time";

        const sender = translatableMessage ? "Peer" : "Myself";

        if (messageContent !== "No Content") {
            chatHistory.push({ sender, timestamp, content: messageContent });
        }
    });

    return chatHistory;
}

// Helper function to extract text from an element, handling spans with 'title' attributes
function extractTextWithSpans(element) {
    let text = '';

    element.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            // Regular text node
            text += node.textContent;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName.toLowerCase() === 'span' && node.getAttribute('title')) {
                // Span element with a 'title' attribute (e.g., an emoji)
                text += node.getAttribute('title');
            } else if (node.tagName.toLowerCase() === 'img' && node.getAttribute('alt')) {
                // Image element with an 'alt' attribute
                text += node.getAttribute('alt');
            } else {
                // Recursively extract text from child elements
                text += extractTextWithSpans(node);
            }
        }
    });

    return text;
}

// Send the chat content as a Chrome message
chrome.runtime.sendMessage({ type: 'chatHistory', data: extractChatContent() });
