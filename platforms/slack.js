(function() {
    const module = {
        isActivePage() {
            return !!document.querySelector('div.p-workspace') && !!document.querySelector('div[role="textbox"]');
        },
        extractChatHistory() {
            const messageNodes = document.querySelectorAll('[data-qa="message_container"]');
            const chatHistory = [];
            messageNodes.forEach((msg) => {
                const sender = msg.querySelector('a.c-message__sender_link')?.innerText || 'Unknown Sender';
                const timestampEl = msg.querySelector('a.c-timestamp, span.c-timestamp');
                const timestamp = timestampEl ? timestampEl.getAttribute('aria-label') || timestampEl.innerText : 'Unknown Time';
                const contentElement = msg.querySelector('[data-qa="message-text"], span.c-message__body');
                const content = contentElement ? contentElement.innerText.trim() : 'No Content';
                if (content !== 'No Content') {
                    chatHistory.push({ sender, timestamp, content });
                }
            });
            return chatHistory;
        },
        getInputText() {
            const textbox = document.querySelector('div[role="textbox"]');
            return textbox ? textbox.textContent.trim() : null;
        },
        setInputText(newText) {
            const textbox = document.querySelector('div[role="textbox"]');
            if (textbox) {
                textbox.textContent = newText;
            }
        }
    };

    window.platformModules = window.platformModules || [];
    window.platformModules.push(module);
})();
