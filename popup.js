// popup.js

let chatHistory = []; // Global variable to store chat history

// Listen to messages from the payload.js script and store chat history
chrome.runtime.onMessage.addListener(function (message) {
    if (message && message.type === 'chatHistory') {
        chatHistory = message.data; // Store the chat history array
        displayLatestChatMessages(); // Display the latest five messages
    }
});

// Function to display the latest five chat messages in the popup UI
function displayLatestChatMessages() {
    console.log("displayLatestChatMessages")
    const chatContainer = document.getElementById('chat-messages');
    if (!chatContainer) return;

    // Clear previous messages
    chatContainer.innerHTML = '';

    // Get the latest five messages
    const latestMessages = chatHistory.slice(-10);

    latestMessages.forEach((message) => {
        const messageElement = document.createElement('div');
        messageElement.style.marginBottom = '10px';
        messageElement.style.padding = '5px';
        messageElement.style.borderBottom = '1px solid #ccc';

        const senderElement = document.createElement('div');
        senderElement.style.fontWeight = 'bold';
        senderElement.innerText = `${message.sender} at ${message.timestamp}`;

        const contentElement = document.createElement('div');
        contentElement.innerText = message.content;

        messageElement.appendChild(senderElement);
        messageElement.appendChild(contentElement);

        chatContainer.appendChild(messageElement);
    });
	chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Inject the payload.js script into the current tab after the popup has loaded
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
        {
            target: { tabId: tabs[0].id },
            files: [
                // 'openai.js',
                'platforms/teams.js',
                'platforms/telegram.js',
                'platforms/slack.js',
                'payload.js'
            ]
        },
        () => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
            }
        }
    );
});

// Add button to enhance functionality when the popup loads
window.addEventListener('load', function () {
    // Create the button to generate text variations
    const button = document.createElement('button');
    button.innerText = 'Suggest Input';
    button.style.margin = '10px';
    document.body.appendChild(button);

    // Create container for variations to append generated text
    const variationsContainer = document.createElement('div');
    variationsContainer.style.marginTop = '10px';
    document.body.appendChild(variationsContainer);

    // Function to create clickable text elements
    const createTextElement = (newText) => {
        const textElement = document.createElement('div');
        textElement.innerText = newText;
        textElement.style.cursor = 'pointer';
        textElement.style.margin = '10px 0';
        textElement.style.padding = '10px';
        textElement.style.border = '2px solid #ccc';
        textElement.style.borderRadius = '5px';
        textElement.style.backgroundColor = '#f9f9f9';
        textElement.addEventListener('click', () => {
            // Update the text in the textarea of the active tab
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.scripting.executeScript(
                    {
                        target: { tabId: tabs[0].id },
                        func: updateTextareaText,
                        args: [newText],
                    },
                    () => {
                        if (chrome.runtime.lastError) {
                            console.error(chrome.runtime.lastError);
                        }
                    }
                );
            });
        });
        return textElement;
    };

    // Function to generate text variations and append them to the popup UI
    async function generateTextVariations(chat_history, input_text) {
        // console.log("popup.js, generateTextVariations(), input_text=")
        // console.log(input_text)
        // Clear previous variations
        variationsContainer.innerHTML = '';
		// Unpack chatHistory array into a single string
		let formattedChatHistory = chat_history.map((message) => `${message.sender} at ${message.timestamp}:\n${message.content}`).join('\n\n');

		try {
			const variations = await openai_generateVariations(formattedChatHistory, input_text);
			// For each variation, create a text element
			variations.forEach((variation) => {
				variationsContainer.appendChild(createTextElement(variation));
			});
		} catch (error) {
            console.error("Error in generateTextVariations:", error);
            const errorElement = document.createElement('div');
            errorElement.innerText = 'Error generating text variations: ' + (error?.message || String(error));
            variationsContainer.appendChild(errorElement);
        }

    }

    // Button click event
    button.addEventListener('click', () => {
        // Inject script into the active tab to extract the text
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript(
                {
                    target: { tabId: tabs[0].id },
                    func: extractTextFromTextarea,
                },
                async (results) => {
					
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError);
                        return;
                    }

					extractedText = ""
                    if (results && results[0] && results[0].result) {
                        extractedText = results[0].result;
						console.log(extractedText);
                    } 
					// Now call generateTextVariations with chatHistory and extractedText
					await generateTextVariations(chatHistory, extractedText);
					console.log("generateTextVariations called");
                }
            );
        });
    });
});

// Function to be injected into the page to extract the text from the textarea
function extractTextFromTextarea() {
    if (!window.platformModules) return null;
    for (const mod of window.platformModules) {
        try {
            if (mod.isActivePage && mod.isActivePage() && mod.getInputText) {
                return mod.getInputText();
            }
        } catch (e) {
            console.error(e);
        }
    }
    return null;
}

// Function to be injected into the page to update the text in the textarea
function updateTextareaText(newText) {
    if (!window.platformModules) return;
    for (const mod of window.platformModules) {
        try {
            if (mod.isActivePage && mod.isActivePage() && mod.setInputText) {
                mod.setInputText(newText);
                return;
            }
        } catch (e) {
            console.error(e);
        }
    }
    console.warn('textarea div not found.');
}
