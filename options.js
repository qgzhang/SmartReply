// options.js

// Function to save options to chrome.storage
function saveOptions() {
    const apiKey = document.getElementById('apiKey').value.trim();
    const userName = document.getElementById('userName').value.trim();

    chrome.storage.local.set({ openaiApiKey: apiKey, teamsUserName: userName }, () => {
        if (chrome.runtime.lastError) {
            console.error('Error saving options:', chrome.runtime.lastError);
            alert('Error saving options.');
        } else {
            alert('Options saved successfully!');
        }
    });
}

// Function to restore options from chrome.storage
function restoreOptions() {
    chrome.storage.local.get(['openaiApiKey', 'teamsUserName'], (result) => {
        if (chrome.runtime.lastError) {
            console.error('Error loading options:', chrome.runtime.lastError);
        } else {
            if (result.openaiApiKey) {
                document.getElementById('apiKey').value = result.openaiApiKey;
            }
            if (result.teamsUserName) {
                document.getElementById('userName').value = result.teamsUserName;
            }
        }
    });
}

// Event listeners
document.getElementById('save').addEventListener('click', saveOptions);
document.addEventListener('DOMContentLoaded', restoreOptions);

