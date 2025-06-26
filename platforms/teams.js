(function() {
    function extractTextWithSpans(element) {
        let text = '';
        element.childNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                text += node.textContent;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.tagName.toLowerCase() === 'span' && node.getAttribute('title')) {
                    text += node.getAttribute('title');
                } else if (node.tagName.toLowerCase() === 'img' && node.getAttribute('alt')) {
                    text += node.getAttribute('alt');
                } else {
                    text += extractTextWithSpans(node);
                }
            }
        });
        return text;
    }

    const module = {
        isActivePage() {
            return !!document.querySelector('div[data-tid="message-pane-list-runway"]');
        },
        extractChatHistory() {
            const chatContainer = document.querySelector('div[data-tid="message-pane-list-runway"]');
            if (!chatContainer) return [];
            const chatItems = chatContainer.querySelectorAll('div[data-tid="chat-pane-item"]');
            const chatHistory = [];
            chatItems.forEach((chatItem) => {
                const senderElement = chatItem.querySelector('span[data-tid="message-author-name"]');
                const sender = senderElement ? senderElement.innerText : 'Unknown Sender';
                const timestampElement = chatItem.querySelector('time');
                const timestamp = timestampElement ? timestampElement.getAttribute('aria-label') : 'Unknown Time';
                const messageContentElement = chatItem.querySelector('div[data-tid="chat-pane-message"]');
                let messageContent = messageContentElement ? extractTextWithSpans(messageContentElement).trim() : 'No Content';
                if (sender !== 'Unknown Sender' || timestamp !== 'Unknown Time' || messageContent !== 'No Content') {
                    chatHistory.push({ sender, timestamp, content: messageContent });
                }
            });
            return chatHistory;
        },
        getInputText() {
            const textarea = document.querySelector('[data-tid="ckeditor"][contenteditable="true"]');
            return textarea ? textarea.textContent.trim() : null;
        },
        setInputText(newText) {
            const textarea = document.querySelector('[data-tid="ckeditor"][contenteditable="true"]');
            if (textarea) {
                const editorInstance = textarea.ckeditorInstance || textarea.ckeditor || textarea.dataset.ckeditorInstance;
                if (editorInstance && editorInstance.setData) {
                    editorInstance.setData(newText);
                } else {
                    textarea.textContent = newText;
                }
            }
        }
    };

    window.platformModules = window.platformModules || [];
    window.platformModules.push(module);
})();
