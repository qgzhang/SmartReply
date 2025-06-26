const test = require('node:test');
const assert = require('node:assert');
const { openai_generateVariations } = require('../openai.js');

function setupChrome(apiKey, userName) {
  global.chrome = {
    storage: {
      local: {
        get: (_keys, cb) => cb({ openaiApiKey: apiKey, teamsUserName: userName })
      }
    },
    runtime: {}
  };
}

test('openai_generateVariations rejects without credentials', async () => {
  setupChrome(undefined, undefined);
  await assert.rejects(() => openai_generateVariations('', ''), /Teams display name not found/);
});

test('openai_generateVariations rejects on http error', async () => {
  setupChrome('key', 'Alice');
  global.fetch = async () => ({ ok: false, statusText: 'Bad Request' });
  await assert.rejects(() => openai_generateVariations('h', 't'), /Bad Request/);
});

test('openai_generateVariations returns variations', async () => {
  setupChrome('key', 'Alice');
  global.fetch = async () => ({
    ok: true,
    json: async () => ({ choices: [
      { message: { content: 'A' } },
      { message: { content: 'B' } },
      { message: { content: 'C' } }
    ]})
  });
  const vars = await openai_generateVariations('history', 'text');
  assert.deepStrictEqual(vars, ['A','B','C']);
});
