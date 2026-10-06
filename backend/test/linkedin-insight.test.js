import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const script = await readFile(new URL('../../assets/js/linkedin-insight.js', import.meta.url), 'utf8');
const partnerId = '1234567';
const key = 'linkedin-consent-v1-' + partnerId;

function setup({ choice, age = 0, blockedStorage = false, gpc = false, origin = 'https://kevin-bai.com', id = partnerId } = {}) {
  const values = new Map();
  if (choice) values.set(key, JSON.stringify({ choice, savedAt: Date.now() - age }));
  function element() {
    return {
      hidden: true, listeners: {}, dataset: {},
      addEventListener(event, handler) { this.listeners[event] = handler; },
      click() { this.listeners.click(); },
      focus() { this.focused = true; }
    };
  }
  const accept = element();
  const reject = element();
  const settings = element();
  const paragraph = element();
  const notice = element();
  notice.dataset = { partnerId: id, siteOrigin: 'https://kevin-bai.com' };
  notice.querySelector = (selector) => ({ '[data-tracking-accept]': accept, '[data-tracking-reject]': reject, p: paragraph })[selector];
  const scripts = [];
  const events = {};
  let reloads = 0;
  const window = {
    location: { origin, reload() { reloads += 1; } },
    localStorage: {
      getItem(name) { if (blockedStorage) throw new Error('blocked'); return values.get(name) ?? null; },
      setItem(name, value) { if (blockedStorage) throw new Error('blocked'); values.set(name, value); }
    },
    addEventListener(event, handler) { events[event] = handler; }
  };
  const document = {
    querySelector: (selector) => selector === '[data-linkedin-consent]' ? notice : settings,
    createElement: () => ({}),
    head: { appendChild(node) { scripts.push(node); } }
  };
  vm.runInNewContext(script, { window, document, navigator: { globalPrivacyControl: gpc }, URL });
  return { notice, accept, reject, settings, paragraph, scripts, values, events, window, reloads: () => reloads };
}

test('LinkedIn receives nothing before acceptance and loads only once afterward', () => {
  const page = setup();
  assert.equal(page.notice.hidden, false);
  assert.equal(page.settings.hidden, false);
  assert.equal(page.scripts.length, 0);
  assert.equal(page.window.lintrk, undefined);
  page.accept.click();
  assert.equal(page.notice.hidden, true);
  assert.equal(page.scripts.length, 1);
  assert.equal(page.scripts[0].src, 'https://snap.licdn.com/li.lms-analytics/insight.min.js');
  assert.equal(page.scripts[0].async, true);
  assert.deepEqual(Array.from(page.window._linkedin_data_partner_ids), [partnerId]);
  assert.equal(JSON.parse(page.values.get(key)).choice, 'accepted');
  page.settings.click();
  page.accept.click();
  assert.equal(page.scripts.length, 1);
});

test('saved acceptance persists across pages; decline and expired choices do not load the tag', () => {
  assert.equal(setup({ choice: 'accepted' }).scripts.length, 1);
  const declined = setup({ choice: 'declined' });
  assert.equal(declined.scripts.length, 0);
  assert.equal(declined.notice.hidden, true);
  const expired = setup({ choice: 'accepted', age: 181 * 86400000 });
  assert.equal(expired.scripts.length, 0);
  assert.equal(expired.notice.hidden, false);
  const fresh = setup();
  fresh.reject.click();
  assert.equal(fresh.scripts.length, 0);
  assert.equal(JSON.parse(fresh.values.get(key)).choice, 'declined');
});

test('withdrawing consent reloads the page and disables tracking on subsequent pages', () => {
  const page = setup({ choice: 'accepted' });
  page.settings.click();
  assert.equal(page.notice.hidden, false);
  assert.equal(page.reject.focused, true);
  page.reject.click();
  assert.equal(page.reloads(), 1);
  assert.equal(page.settings.focused, true);
  assert.equal(setup({ choice: JSON.parse(page.values.get(key)).choice }).scripts.length, 0);
});

test('Global Privacy Control overrides acceptance, and preview origins or invalid IDs stay disabled', () => {
  const page = setup({ choice: 'accepted', gpc: true });
  assert.equal(page.scripts.length, 0);
  assert.equal(page.accept.disabled, true);
  page.accept.click();
  assert.equal(page.scripts.length, 0);
  for (const options of [{ origin: 'http://localhost:4000', choice: 'accepted' }, { id: '' }, { id: 'not-an-id' }]) {
    const disabled = setup(options);
    assert.equal(disabled.scripts.length, 0);
    assert.equal(disabled.settings.hidden, true);
    assert.equal(disabled.notice.hidden, true);
  }
});

test('blocked browser storage still requires acceptance on every page', () => {
  const page = setup({ blockedStorage: true });
  assert.equal(page.scripts.length, 0);
  assert.equal(page.notice.hidden, false);
  page.accept.click();
  assert.equal(page.scripts.length, 1);
  assert.equal(setup({ blockedStorage: true }).scripts.length, 0);
});

test('consent withdrawal propagates to other tabs and pages restored with browser back', () => {
  const tab = setup({ choice: 'accepted' });
  tab.values.set(key, JSON.stringify({ choice: 'declined', savedAt: Date.now() }));
  tab.events.storage({ key });
  assert.equal(tab.reloads(), 1);
  const cachedPage = setup({ choice: 'accepted' });
  cachedPage.values.clear();
  cachedPage.events.pageshow({ persisted: true });
  assert.equal(cachedPage.reloads(), 1);
});
