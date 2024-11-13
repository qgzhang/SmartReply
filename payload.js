// payload.js

// Function to extract chat content
function extractChatContent() {
    const chatContainer = document.querySelector('div[data-tid="message-pane-list-runway"]');

    // Verify that the chat container exists
    if (!chatContainer) {
        console.warn("This does not appear to be a Microsoft Teams Chat window");
        return [];
    }

    const chatItems = chatContainer.querySelectorAll('div[data-tid="chat-pane-item"]');
    const chatHistory = [];

    chatItems.forEach((chatItem) => {
        // Extract sender, timestamp, and message content from each chat item

        // Sender
        const senderElement = chatItem.querySelector('span[data-tid="message-author-name"]');
        const sender = senderElement ? senderElement.innerText : "Unknown Sender";

        // Timestamp
        const timestampElement = chatItem.querySelector('time');
        const timestamp = timestampElement ? timestampElement.getAttribute('aria-label') : "Unknown Time";

        // Message Content
        const messageContentElement = chatItem.querySelector('div[data-tid="chat-pane-message"]');

        let messageContent = '';
        if (messageContentElement) {
            messageContent = extractTextWithSpans(messageContentElement).trim();
        } else {
            messageContent = "No Content";
        }

        // Check if the entry is invalid and should be excluded
        if (sender === "Unknown Sender" && timestamp === "Unknown Time" && messageContent === "No Content") {
            // Skip this entry
            return;
        }

        // Construct a message object
        const message = {
            sender: sender,
            timestamp: timestamp,
            content: messageContent
        };

        chatHistory.push(message);
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
