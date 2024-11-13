// Inject the payload.js script into the current tab after the popup has loaded
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
        {
            target: { tabId: tabs[0].id },
            files: ['payload.js']
        },
        () => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
            }
        }
    );
});

// Listen to messages from the payload.js script and write to popup.html
chrome.runtime.onMessage.addListener(function (message) {
    var chat = document.getElementById('chat');
    if (chat) {
        // chat.innerHTML = message;
    }
});

// Add button to enhance functionality when the popup loads
window.addEventListener('load', function () {
	// Create the button to generate text variations
	const button = document.createElement('button');
	button.innerText = 'Generate Text Variations';
	button.style.margin = '10px';
	document.body.appendChild(button);

	// Create container for variations to append generated text
	const variationsContainer = document.createElement('div');
	variationsContainer.style.marginTop = '10px';
	document.body.appendChild(variationsContainer);

	button.addEventListener('click', () => {
		// Inject script into the active tab to extract the text
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			chrome.scripting.executeScript(
				{
					target: { tabId: tabs[0].id },
					func: extractTextFromTextarea,
				},
				(results) => {
					if (chrome.runtime.lastError) {
						console.error(chrome.runtime.lastError);
						return;
					}

					// Assuming the script returns the extracted text
					if (results && results[0] && results[0].result) {
						const extractedText = results[0].result;
						generateTextVariations(extractedText);
					}
				}
			);
		});
	});

	// Function to generate text variations and append them to the popup UI
	function generateTextVariations(text) {
		// Clear previous variations
		variationsContainer.innerHTML = '';

		if (text) {
			// Generate the new text variations
			const new_text_1 = text.toUpperCase();
			const new_text_2 = `000_${text}_111`;
			const new_text_3 = `${text} ${text}`;

			// Create clickable text elements for each new variation
			const createTextElement = (newText) => {
				const textElement = document.createElement('div');
				textElement.innerText = newText;
				textElement.style.cursor = 'pointer';
				textElement.style.margin = '5px 0';
				textElement.style.padding = '5px';
				textElement.style.border = '1px solid #ccc';
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
								world: 'MAIN'
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

			variationsContainer.appendChild(createTextElement(new_text_1));
			variationsContainer.appendChild(createTextElement(new_text_2));
			variationsContainer.appendChild(createTextElement(new_text_3));
		}
	}
});

// Function to be injected into the page to extract the text from the textarea
function extractTextFromTextarea() {
	const textarea = document.querySelector('[data-tid="ckeditor"][contenteditable="true"]');
	if (textarea) {
		return textarea.textContent.trim();
	}
	return null;
}

// Function to be injected into the page to update the text in the textarea
function updateTextareaText(newText) {
    const textarea = document.querySelector('[data-tid="ckeditor"][contenteditable="true"]');
    if (textarea) {
		const editorInstance = textarea.ckeditorInstance || textarea.ckeditor || promptDiv.dataset.ckeditorInstance;
        if (editorInstance) {
            // Use CKEditor's setData method to update the content
            editorInstance.setData(newText);
        } else {
            console.warn('CKEditor instance not found on textarea.');
        }
    }
	else {
        console.warn('textarea div not found.');
    }
}