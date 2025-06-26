const test = require('node:test');
const assert = require('node:assert');

function loadTeamsModule() {
  const messageContent = {
    childNodes: [
      { nodeType: 3, textContent: 'Hello ' },
      { nodeType: 1, tagName: 'span', getAttribute: attr => attr === 'title' ? 'World' : null }
    ]
  };

  const chatItem = {
    querySelector(selector) {
      if (selector === 'span[data-tid="message-author-name"]') {
        return { innerText: 'Alice' };
      }
      if (selector === 'time') {
        return { getAttribute: () => '1:00 PM' };
      }
      if (selector === 'div[data-tid="chat-pane-message"]') {
        return messageContent;
      }
      return null;
    }
  };

  const chatContainer = {
    querySelectorAll(selector) {
      if (selector === 'div[data-tid="chat-pane-item"]') {
        return [chatItem];
      }
      return [];
    }
  };

  global.window = { platformModules: [] };
  global.Node = { TEXT_NODE: 3, ELEMENT_NODE: 1 };
  global.document = {
    querySelector(selector) {
      if (selector === 'div[data-tid="message-pane-list-runway"]') {
        return chatContainer;
      }
      return null;
    }
  };

  delete require.cache[require.resolve('../platforms/teams.js')];
  require('../platforms/teams.js');
  return global.window.platformModules[0];
}

function loadTelegramModule() {
  const chatItem = {
    querySelector(selector) {
      if (selector === 'span.translatable-message') {
        return { innerText: 'Hi' };
      }
      if (selector === 'span.i18n') {
        return { innerText: '1:01 PM' };
      }
      return null;
    },
    childNodes: []
  };

  global.window = { platformModules: [] };
  global.Node = { TEXT_NODE: 3, ELEMENT_NODE: 1 };
  global.document = {
    querySelector(selector) {
      if (selector === 'div.input-message-input') {
        return {};
      }
      return null;
    },
    querySelectorAll(selector) {
      if (selector === 'div.message.spoilers-container') {
        return [chatItem];
      }
      return [];
    }
  };

  delete require.cache[require.resolve('../platforms/telegram.js')];
  require('../platforms/telegram.js');
  return global.window.platformModules[0];
}

function loadSlackModule() {
  const messageNode = {
    querySelector(selector) {
      if (selector === 'a.c-message__sender_link') {
        return { innerText: 'Bob' };
      }
      if (selector === 'a.c-timestamp, span.c-timestamp') {
        return { getAttribute: () => '1:02 PM', innerText: '1:02 PM' };
      }
      if (selector === '[data-qa="message-text"], span.c-message__body') {
        return { innerText: 'Slack message' };
      }
      return null;
    }
  };

  global.window = { platformModules: [] };
  global.Node = { TEXT_NODE: 3, ELEMENT_NODE: 1 };
  global.document = {
    querySelector(selector) {
      if (selector === 'div.p-workspace') return {};
      if (selector === 'div[role="textbox"]') return {};
      return null;
    },
    querySelectorAll(selector) {
      if (selector === '[data-qa="message_container"]') {
        return [messageNode];
      }
      return [];
    }
  };

  delete require.cache[require.resolve('../platforms/slack.js')];
  require('../platforms/slack.js');
  return global.window.platformModules[0];
}

test('Teams chat extraction', () => {
  const teams = loadTeamsModule();
  assert.strictEqual(teams.isActivePage(), true);
  const history = teams.extractChatHistory();
  assert.deepStrictEqual(history, [
    { sender: 'Alice', timestamp: '1:00 PM', content: 'Hello World' }
  ]);
});

test('Telegram chat extraction', () => {
  const telegram = loadTelegramModule();
  assert.strictEqual(telegram.isActivePage(), true);
  const history = telegram.extractChatHistory();
  assert.deepStrictEqual(history, [
    { sender: 'Peer', timestamp: '1:01 PM', content: 'Hi' }
  ]);
});

test('Slack chat extraction', () => {
  const slack = loadSlackModule();
  assert.strictEqual(slack.isActivePage(), true);
  const history = slack.extractChatHistory();
  assert.deepStrictEqual(history, [
    { sender: 'Bob', timestamp: '1:02 PM', content: 'Slack message' }
  ]);
});
