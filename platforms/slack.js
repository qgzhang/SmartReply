(function () {
    const module = {
        isActivePage() {
            const editor = document.querySelector('div.ql-editor');
            const inputContainer = document.querySelector('[data-message-input="true"]');
            const hasMessages = document.querySelector('[data-qa="message_container"]');

            // Consider active if the input area exists, even if there are no messages yet
            return !!(editor && inputContainer);
        },


        extractChatHistory() {
            const messageNodes = document.querySelectorAll('[data-qa="message_container"]');
            const chatHistory = [];
            messageNodes.forEach((msg) => {
                const sender = msg.querySelector('.c-message_kit__sender')?.innerText || 'Unknown Sender';
                
                const timestampEl = msg.querySelector('a.c-timestamp');
                const timestamp = timestampEl?.getAttribute('aria-label') || 'Unknown Time';

                const contentElement = msg.querySelector('.c-message_kit__blocks');
                const content = contentElement ? contentElement.innerText.trim() : 'No Content';
                if (content !== 'No Content') {
                    chatHistory.push({ sender, timestamp, content });
                }
            });
            return chatHistory;
        },

        getInputText() {
            const textbox = document.querySelector('div.ql-editor[role="textbox"]');
            return textbox ? textbox.innerText.trim() : null;
        },

        setInputText(newText) {
            const textbox = document.querySelector('div.ql-editor[role="textbox"]');
            if (textbox) {
                textbox.innerHTML = `<p>${newText}</p>`;
                textbox.dispatchEvent(new InputEvent('input', { bubbles: true }));
            }
        }
    };

    window.platformModules = window.platformModules || [];
    window.platformModules.push(module);
})();



// (function() {
//     const module = {
//         isActivePage() {
//             return !!document.querySelector('div.p-workspace') && !!document.querySelector('div[role="textbox"]');
//         },
//         extractChatHistory() {
//             const messageNodes = document.querySelectorAll('[data-qa="message_container"]');
//             const chatHistory = [];
//             messageNodes.forEach((msg) => {
//                 const sender = msg.querySelector('a.c-message__sender_link')?.innerText || 'Unknown Sender';
//                 const timestampEl = msg.querySelector('a.c-timestamp, span.c-timestamp');
//                 const timestamp = timestampEl ? timestampEl.getAttribute('aria-label') || timestampEl.innerText : 'Unknown Time';
//                 const contentElement = msg.querySelector('[data-qa="message-text"], span.c-message__body');
//                 const content = contentElement ? contentElement.innerText.trim() : 'No Content';
//                 if (content !== 'No Content') {
//                     chatHistory.push({ sender, timestamp, content });
//                 }
//             });
//             return chatHistory;
//         },
//         getInputText() {
//             const textbox = document.querySelector('div[role="textbox"]');
//             return textbox ? textbox.textContent.trim() : null;
//         },
//         setInputText(newText) {
//             const textbox = document.querySelector('div[role="textbox"]');
//             if (textbox) {
//                 textbox.textContent = newText;
//             }
//         }
//     };

//     window.platformModules = window.platformModules || [];
//     window.platformModules.push(module);
// })();
