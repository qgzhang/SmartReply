(function() {
    const module = {
        isActivePage() {
            console.log("Telegram isActivePage")
            return !!document.querySelector('div.input-message-input');
        },
        extractChatHistory() {
            console.log("Telegram extractChatHistory")
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
            console.log("Telegram get input")
            const textarea = document.querySelector('div.input-message-input');
            console.log("Telegram Input:",textarea.textContent.trim())
            return textarea ? textarea.textContent.trim() : null;
        },
        setInputText(newText) {
            console.log("Telegram set input")
            const textarea = document.querySelector('div.input-message-input');
            if (textarea) {
                textarea.textContent = newText;
            }
        }
    };

    window.platformModules = window.platformModules || [];
    window.platformModules.push(module);
})();
