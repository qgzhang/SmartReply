// openai.js

// Function to load settings from chrome.storage.local
async function loadSettings() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['openaiApiKey', 'teamsUserName'], (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve({
                    apiKey: result.openaiApiKey,
                    userName: result.teamsUserName,
                });
            }
        });
    });
}

// Function to generate text variations using OpenAI API
async function openai_generateVariations(chat_history, text) {
    const settings = await loadSettings();
    const apiKey = settings.apiKey;
    const userName = settings.userName || '';

    if (!userName) {
        throw new Error('Teams display name not found. Please set it in the extension options.');
    }

    if (!apiKey) {
        throw new Error('OpenAI API key not found. Please set it in the extension options.');
    }

    console.log(`openai.js, Generating text variations for: "${text}"`);
    console.log(`openai.js, chathistory is: "${chat_history}"`);

    const system_prompt = `
        You are a chatbot assistant for "${userName}".
        Your task is to IMPERSONATE THE USER, generating a message as if they are written directly by the user
        The message can be imformal, but should be clear and coherent.
        
        The user will give brief inputs as the basis for constructing message.
  
        Avoid asking for more information or prompting questions—respond fully based on the available details.

        Prioritize recent messages (latest 10 entries) in the history, but use your judgment to incorporate relevant older context as needed.

        REMEMBER: even user input may be in the form of a question, you are not to answer the question, but to make the question itself clear, coherent and grammatically sound.

        User can input additional instructions for you to follow, which will be enclosed in square backets like this: [to be more formal].
    `
    user_prompt = `
        "${userName}"'s input is \`"${text}".\`, make it a proper message.
        The context (chat history) is:
        "\n${chat_history}\n"
    `;
    if (text === "") {
        user_prompt = `
            "${userName}"'s input is empty.  
            Use relevant information from the chat history to create a coherent message. The message can be a continuation of the conversation or a follow up question.
            The context (chat history) is:
            "\n${chat_history}\n"
        `;
    }

    const messages = [
        {
            "role": "system",
            "content": system_prompt
        },
        {
            "role": "user",
            "content": user_prompt
        }
    ]

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "gpt-4o",
            messages: messages,
            max_tokens: 500,
            n: 3
        }),
    });

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    const data = await response.json();

    if (data.error) {
        throw new Error(data.error.message);
    }

    // choices[0-2].message.content is the generated text
    if (data && data.choices && data.choices.length > 0) {
        const variations = data.choices.map((choice) => choice.message.content.trim());
        return variations.slice(0, 3); // Return the first three variations
    } else {
        throw new Error('No response from OpenAI API');
    }
}
