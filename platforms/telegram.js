(function() {
    const module = {
        isActivePage() {
            return !!document.querySelector('div.input-message-input');
        },
        extractChatHistory() {
            const chatItems = document.querySelectorAll('div.message.spoilers-container');
            const chatHistory = [];
            chatItems.forEach((chatItem) => {
                let messageContent = '';
                const translatableMessage = chatItem.querySelector('span.translatable-message');
                if (translatableMessage) {
                    messageContent = translatableMessage.innerText.trim();
                } else {
                    messageContent = chatItem.childNodes[0]?.nodeValue?.trim() || 'No Content';
                }
                const timestampElement = chatItem.querySelector('span.i18n');
                const timestamp = timestampElement ? timestampElement.innerText.trim() : 'Unknown Time';
                const sender = translatableMessage ? 'Peer' : 'Myself';
                if (messageContent !== 'No Content') {
                    chatHistory.push({ sender, timestamp, content: messageContent });
                }
            });
            return chatHistory;
        },
        getInputText() {
            const textarea = document.querySelector('div.input-message-input');
            return textarea ? textarea.textContent.trim() : null;
        },
        setInputText(newText) {
            const textarea = document.querySelector('div.input-message-input');
            if (textarea) {
                textarea.textContent = newText;
            }
        }
    };

    window.platformModules = window.platformModules || [];
    window.platformModules.push(module);
})();
