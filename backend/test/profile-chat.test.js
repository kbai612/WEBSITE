import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const script = await readFile(new URL('../../assets/js/profile-chat.js', import.meta.url), 'utf8');
const endpoint = 'https://worker.example/chat';
const conversationId = '12345678-1234-4123-8123-123456789abc';
const sessionKey = 'kevin-profile-chat-v1';

class Element {
  children = [];
  listeners = {};
  dataset = {};
  style = {};
  attributes = {};
  value = '';
  disabled = false;
  open = false;
  classList = { add() {}, remove() {} };
  appendChild(child) { child.parent = this; this.children.push(child); }
  setAttribute(name, value) { this.attributes[name] = value; }
  addEventListener(name, callback) { (this.listeners[name] ??= []).push(callback); }
  dispatch(name, event = {}) { for (const callback of this.listeners[name] ?? []) callback(event); }
  querySelectorAll(selector) {
    return this.children.filter((child) => child.className?.includes(selector.slice(1)));
  }
  set innerHTML(value) { this.children = []; }
  remove() { this.parent.children = this.parent.children.filter((child) => child !== this); }
  show() { this.open = true; }
  close() { this.open = false; this.dispatch('close'); }
  focus() {}
  contains() { return false; }
}

function loadPage(storage, fetcher) {
  const selectors = ['form', 'input', 'send', 'messages', 'starters', 'status', 'contact', 'new', 'close', 'availability'];
  const elements = Object.fromEntries(selectors.map((name) => [name, new Element()]));
  elements.messages.appendChild(new Element()); // Initial greeting from the shared HTML.
  const root = new Element();
  root.dataset.endpoint = endpoint;
  root.querySelector = (selector) => elements[selector.slice('[data-chat-'.length, -1)];
  const opener = new Element();
  elements.form.reset = () => { elements.input.value = ''; };
  const document = {
    querySelector: () => root,
    querySelectorAll: () => [opener],
    createElement: () => new Element()
  };
  const requests = [];
  const lifecycle = new Element();
  vm.runInNewContext(script, {
    document, AbortController, DOMException,
    window: {
      sessionStorage: storage,
      crypto: globalThis.crypto,
      setTimeout, clearTimeout,
      addEventListener: (name, callback) => lifecycle.addEventListener(name, callback),
      matchMedia: () => ({ matches: true })
    },
    fetch: async (_url, options) => {
      const body = JSON.parse(options.body);
      requests.push(body);
      return fetcher(body);
    }
  });
  return {
    ...elements, root, opener, requests, lifecycle,
    submit(message) {
      elements.input.value = message;
      elements.form.dispatch('submit', { preventDefault() {} });
    },
    text() { return elements.messages.children.map((article) => article.children[1]?.textContent); }
  };
}

function storage(initial) {
  const values = new Map(initial ? [[sessionKey, initial]] : []);
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}

const answer = (text = 'Kevin has analytics experience.') => Response.json({ conversationId, answer: text });
const settle = () => new Promise((resolve) => setImmediate(resolve));

test('page navigation restores messages, draft, open state, and conversation ID for follow-ups', async () => {
  const saved = storage();
  const first = loadPage(saved, () => answer());
  first.opener.dispatch('click');
  first.submit('What has Kevin done?');
  await settle();
  first.input.value = 'Tell me more';
  first.input.dispatch('input');

  const next = loadPage(saved, () => answer('He also builds projects.'));
  assert.equal(next.root.open, true);
  assert.equal(next.opener.attributes['aria-expanded'], 'true');
  assert.equal(next.input.value, 'Tell me more');
  assert.deepEqual(next.text(), ['What has Kevin done?', 'Kevin has analytics experience.']);
  assert.equal(next.starters.hidden, true);
  next.submit('And his projects?');
  await settle();
  assert.equal(next.requests[0].conversationId, conversationId);
  assert.equal(next.text().at(-1), 'He also builds projects.');
});

test('navigation during generation resumes the same request without duplicating the question', async () => {
  const saved = storage();
  let finish;
  const first = loadPage(saved, () => new Promise((resolve) => { finish = resolve; }));
  first.submit('Tell me about Kevin');
  const next = loadPage(saved, () => answer());
  await settle();
  assert.deepEqual(next.requests[0], first.requests[0]);
  assert.deepEqual(next.text(), ['Tell me about Kevin', 'Kevin has analytics experience.']);
  assert.equal(JSON.parse(saved.getItem(sessionKey)).pendingRequest, null);
  finish(answer());
  await settle();
});

test('closing persists dismissal and new chat resets the stored conversation', async () => {
  const saved = storage();
  const first = loadPage(saved, () => answer());
  first.opener.dispatch('click');
  first.submit('Experience?');
  await settle();
  first.close.dispatch('click');
  const next = loadPage(saved, () => answer());
  assert.equal(next.root.open, false);
  assert.deepEqual(next.text(), ['Experience?', 'Kevin has analytics experience.']);
  next.new.dispatch('click');
  const reset = JSON.parse(saved.getItem(sessionKey));
  assert.equal(reset.conversationId, null);
  assert.equal(reset.pendingRequest, null);
  assert.equal(reset.messages.length, 1);
  assert.equal(reset.messages[0].kind, 'assistant');
  const fresh = loadPage(saved, () => answer());
  fresh.submit('Skills?');
  await settle();
  assert.equal(fresh.requests[0].conversationId, undefined);
});

test('unavailable storage and malformed or unrelated sessions leave chat usable', async () => {
  const cases = [
    { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } },
    storage('{invalid'),
    storage(JSON.stringify({ endpoint: 'https://other.example/chat', messages: [] })),
    storage(JSON.stringify({ endpoint, conversationId, messages: [{ kind: 'html', text: '<script>' }] }))
  ];
  for (const saved of cases) {
    const page = loadPage(saved, () => answer());
    page.submit('Skills?');
    await settle();
    assert.equal(page.requests[0].conversationId, undefined);
    assert.equal(page.text().at(-1), 'Kevin has analytics experience.');
  }
});

test('terminal request errors are not resubmitted automatically after navigation', async () => {
  const saved = storage();
  const first = loadPage(saved, () => Response.json({ error: { code: 'PROVIDER_ERROR', message: 'Try again.' } }, { status: 502 }));
  first.submit('Experience?');
  await settle();
  assert.equal(JSON.parse(saved.getItem(sessionKey)).pendingRequest, null);
  const next = loadPage(saved, () => answer());
  await settle();
  assert.equal(next.requests.length, 0);
  assert.deepEqual(next.text(), ['Experience?']);
});

test('browser back restores the latest transcript rather than duplicating an older page history', async () => {
  const saved = storage();
  const first = loadPage(saved, () => answer());
  first.submit('Experience?');
  await settle();
  first.lifecycle.dispatch('pagehide');
  const next = loadPage(saved, () => answer('Kevin also builds projects.'));
  next.submit('Projects?');
  await settle();
  next.lifecycle.dispatch('pagehide');
  first.lifecycle.dispatch('pageshow', { persisted: true });
  assert.deepEqual(first.text(), ['Experience?', 'Kevin has analytics experience.', 'Projects?', 'Kevin also builds projects.']);
  assert.equal(JSON.parse(saved.getItem(sessionKey)).messages.length, 4);
});
