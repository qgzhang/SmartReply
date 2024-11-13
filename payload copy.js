// Send the chat content as a chrome message
chrome.runtime.sendMessage(extractChatContent());

function extractChatContent() {
  const chatContainer = document.querySelector('div[data-tid="message-pane-list-runway"]');
  
  // Verify that the chat container exists
  if (!chatContainer) {
    window.alert("This does not appear to be a Microsoft Teams Chat window");
    return null;
  }

  let chatContent = document.createElement("span");

  // Select all chat items
  const chatItems = chatContainer.querySelectorAll('div[data-tid="chat-pane-item"]');
  
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
    const messageContent = messageContentElement ? messageContentElement.innerText.trim() : "No Content";

    // Construct a message string
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("chat-message");

    let messageHTML = `<b>${sender}</b> `;
    if (timestamp) {
      messageHTML += `${timestamp}<br>`;
    }
    messageHTML += `${messageContent}`;

    messageDiv.innerHTML = messageHTML;

    chatContent.appendChild(messageDiv);
  });

  return chatContent.innerHTML;
}

// Add button to enhance functionality
// window.addEventListener('load', function () {
//   const button = document.createElement('button');
//   button.innerText = 'Generate Text Variations';
//   button.style.margin = '10px';
//   document.body.appendChild(button);

//   button.addEventListener('click', () => {
//     const textarea = document.querySelector('#new-message-59aa4936-b1a9-44b5-b419-5bd98fd8892d');
//     if (!textarea) {
//       console.error("Textarea not found");
//       return;
//     }

//     const text = textarea.innerText.trim();

//     if (text) {
//       // Generate the new text variations
//       const new_text_1 = text.toUpperCase();
//       const new_text_2 = `000_${text}_111`;
//       const new_text_3 = `${text} ${text}`;

//       // Create clickable text elements for each new variation
//       const variationsContainer = document.createElement('div');
//       variationsContainer.style.marginTop = '10px';

//       const createTextElement = (newText) => {
//         const textElement = document.createElement('div');
//         textElement.innerText = newText;
//         textElement.style.cursor = 'pointer';
//         textElement.style.margin = '5px 0';
//         textElement.style.padding = '5px';
//         textElement.style.border = '1px solid #ccc';
//         textElement.style.borderRadius = '5px';
//         textElement.style.backgroundColor = '#f9f9f9';
//         textElement.addEventListener('click', () => {
//           textarea.innerText = newText;
//         });
//         return textElement;
//       };

//       variationsContainer.appendChild(createTextElement(new_text_1));
//       variationsContainer.appendChild(createTextElement(new_text_2));
//       variationsContainer.appendChild(createTextElement(new_text_3));

//       document.body.appendChild(variationsContainer);
//     }
//   });
// });