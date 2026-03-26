// src/config.js
// Persistent config stored in ~/.config/@copypastegenius/cli/config.json
// Uses the `conf` package which handles cross-platform config paths correctly

const Conf = require('conf');

const store = new Conf({
  projectName: 'copypastegenius',
  schema: {
    apiKey:  { type: 'string' },
    apiUrl:  { type: 'string' },
    username:{ type: 'string' },
  },
});

const DEFAULT_URL = 'https://www.copypastegenius.com';

module.exports = {
  getApiKey:  () => store.get('apiKey'),
  setApiKey:  (key) => store.set('apiKey', key),
  clearApiKey:() => store.delete('apiKey'),

  getApiUrl:  () => store.get('apiUrl') || DEFAULT_URL,
  setApiUrl:  (url) => store.set('apiUrl', url),

  getUsername:  () => store.get('username'),
  setUsername:  (name) => store.set('username', name),
  clearUsername:() => store.delete('username'),

  isLoggedIn: () => !!store.get('apiKey'),
  configPath: () => store.path,
};
