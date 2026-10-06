(function () {
  'use strict';

  var root = document.querySelector('[data-profile-chat]');
  if (!root) return;

  var endpoint = (root.dataset.endpoint || '').trim();
  var sourceOrigin = (root.dataset.sourceOrigin || window.location.origin).replace(/\/$/, '');
  var form = root.querySelector('[data-chat-form]');
  var input = root.querySelector('[data-chat-input]');
  var sendButton = root.querySelector('[data-chat-send]');
  var messages = root.querySelector('[data-chat-messages]');
  var starters = root.querySelector('[data-chat-starters]');
  var status = root.querySelector('[data-chat-status]');
  var contact = root.querySelector('[data-chat-contact]');
  var newChat = root.querySelector('[data-chat-new]');
  var closeChat = root.querySelector('[data-chat-close]');
  var availability = root.querySelector('[data-chat-availability]');
  var openButtons = document.querySelectorAll('[data-chat-open]');
  var opener = null;
  var closing = false;
  var closeTimer = null;

  openButtons.forEach(function (button) {
    button.hidden = false;
    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('click', function () {
      opener = button;
      window.clearTimeout(closeTimer);
      closing = false;
      root.classList.remove('profile-chat--closing');
      if (!root.open) root.show();
      openButtons.forEach(function (trigger) { trigger.setAttribute('aria-expanded', 'true'); });
      (input.disabled ? closeChat : input).focus({ preventScroll: true });
      scrollMessages();
    });
  });

  function finishClose() {
    window.clearTimeout(closeTimer);
    closeTimer = null;
    root.close();
  }

  function requestClose() {
    if (!root.open || closing) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finishClose();
      return;
    }
    closing = true;
    root.classList.add('profile-chat--closing');
    // Complete dismissal even if an animation is interrupted or disabled.
    closeTimer = window.setTimeout(finishClose, 250);
  }

  closeChat.addEventListener('click', requestClose);
  root.addEventListener('cancel', function (event) {
    event.preventDefault();
    requestClose();
  });
  root.addEventListener('animationend', function (event) {
    if (event.target === root && event.animationName === 'profile-chat-out' && closing) finishClose();
  });
  root.addEventListener('close', function () {
    window.clearTimeout(closeTimer);
    closeTimer = null;
    closing = false;
    root.classList.remove('profile-chat--closing');
    openButtons.forEach(function (button) { button.setAttribute('aria-expanded', 'false'); });
    if (opener) opener.focus({ preventScroll: true });
  });

  root.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      requestClose();
    }
  });
  var conversationId = null;
  var retryRequest = null;
  var activeController = null;
  var stateToken = 0;

  function uuid() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (char) {
      var random = Math.random() * 16 | 0;
      return (char === 'x' ? random : (random & 3 | 8)).toString(16);
    });
  }

  function scrollMessages() {
    messages.scrollTop = messages.scrollHeight;
  }

  function addMessage(speaker, text, kind) {
    var article = document.createElement('article');
    article.className = 'profile-chat__message profile-chat__message--' + kind;
    var label = document.createElement('span');
    label.className = 'profile-chat__speaker visually-hidden';
    label.textContent = speaker;
    var paragraph = document.createElement('p');
    paragraph.textContent = text;
    article.appendChild(label);
    article.appendChild(paragraph);
    messages.appendChild(article);
    scrollMessages();
    return article;
  }

  function addAnswer(answer, sources) {
    var article = addMessage('Kevin’s AI assistant', answer, 'assistant');
    var validSources = Array.isArray(sources) ? sources.filter(function (source) {
      if (!source || typeof source.title !== 'string' || typeof source.url !== 'string') return false;
      try {
        var site = new URL(sourceOrigin);
        var url = new URL(source.url, site.origin + '/');
        return url.protocol === 'https:' && url.origin === site.origin && !url.username && !url.password;
      } catch (_) {
        return false;
      }
    }).slice(0, 5) : [];

    if (validSources.length) {
      var list = document.createElement('ul');
      list.className = 'profile-chat__sources';
      var heading = document.createElement('p');
      heading.className = 'profile-chat__sources-label';
      heading.textContent = 'Read more';
      article.appendChild(heading);
      validSources.forEach(function (source) {
        var item = document.createElement('li');
        var link = document.createElement('a');
        link.href = new URL(source.url, sourceOrigin + '/').href;
        link.textContent = source.title.slice(0, 100);
        item.appendChild(link);
        list.appendChild(item);
      });
      article.appendChild(list);
      scrollMessages();
    }
  }

  function setBusy(busy) {
    sendButton.disabled = busy || !endpoint;
    input.disabled = !endpoint;
    input.readOnly = busy;
    newChat.disabled = busy;
    sendButton.setAttribute('aria-label', busy ? 'Sending question' : 'Send question');
    if (busy) status.textContent = 'Thinking…';
    root.querySelectorAll('.profile-chat__retry').forEach(function (button) { button.disabled = busy; });
  }

  function revealContact() {
    contact.hidden = false;
  }

  function retryControl(request, options) {
    var article = addMessage(options.title, options.message, 'error');
    if (!options.retry) return;
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'profile-chat__retry';
    button.textContent = options.newRequestId ? 'Try again' : 'Retry';
    button.addEventListener('click', function () {
      article.remove();
      var nextRequest = request;
      if (options.newRequestId) nextRequest = { body: Object.assign({}, request.body, { requestId: uuid() }) };
      sendRequest(nextRequest);
    });
    article.appendChild(button);
    scrollMessages();
  }

  function wait(ms, signal) {
    return new Promise(function (resolve, reject) {
      var timer = window.setTimeout(resolve, ms);
      signal.addEventListener('abort', function () {
        window.clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      }, { once: true });
    });
  }

  async function sendRequest(request) {
    if (!endpoint) {
      revealContact();
      availability.textContent = 'AI assistant · Offline';
      sendButton.disabled = true;
      return;
    }
    if (!request) return;

    retryRequest = request;
    setBusy(true);
    starters.hidden = true;
    var deadline = Date.now() + 35000;
    var token = stateToken;
    var controller = new AbortController();
    activeController = controller;

    try {
      while (Date.now() < deadline) {
        var remaining = deadline - Date.now();
        var timeout = window.setTimeout(function () { controller.abort(); }, remaining);
        var response;
        try {
          response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request.body),
            signal: controller.signal
          });
        } finally {
          window.clearTimeout(timeout);
        }

        if (response.status === 202) {
          await wait(Math.min(1100, Math.max(200, deadline - Date.now())), controller.signal);
          continue;
        }

        var data = await response.json().catch(function () { return null; });
        if (!response.ok) {
          var error = new Error(data && data.error && data.error.message || 'The chat service is temporarily unavailable.');
          error.code = data && data.error && data.error.code;
          error.status = response.status;
          throw error;
        }
        if (!data || typeof data.answer !== 'string' || !data.answer.trim()) throw new Error('The chat service returned an invalid answer.');
        if (typeof data.conversationId === 'string' && data.conversationId.length <= 256) conversationId = data.conversationId;
        if (token !== stateToken) return;
        addAnswer(data.answer.slice(0, 7000), data.sources);
        retryRequest = null;
        contact.hidden = true;
        status.textContent = '';
        form.reset();
        input.style.height = '';
        return;
      }
      throw new Error('The answer is taking longer than expected.');
    } catch (error) {
      if (token !== stateToken || (error.name === 'AbortError' && !retryRequest)) return;
      status.textContent = '';
      revealContact();
      var terminal = error.status >= 400;
      var quotaOrRateLimit = /quota|daily.limit|rate.limit|too.many.requests/i.test((error.code || '') + ' ' + error.message);
      retryControl(request, {
        title: terminal ? 'The assistant couldn’t answer' : 'Could not get an answer',
        message: error.message || 'Check your connection and try again.',
        retry: !quotaOrRateLimit,
        newRequestId: terminal
      });
    } finally {
      if (token === stateToken) {
        activeController = null;
        setBusy(false);
        if (root.open && !closing && root.contains(document.activeElement)) input.focus({ preventScroll: true });
      }
    }
  }

  function submitQuestion(value) {
    var message = (value || '').trim();
    if (!message || message.length > 2000 || sendButton.disabled) return;
    messages.querySelectorAll('.profile-chat__message--error').forEach(function (article) { article.remove(); });
    addMessage('You', message, 'user');
    form.reset();
    input.style.height = '';
    var body = { message: message, requestId: uuid() };
    if (conversationId) body.conversationId = conversationId;
    sendRequest({ body: body });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    submitQuestion(input.value);
  });

  input.addEventListener('input', function () {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 96) + 'px';
  });

  input.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  starters.addEventListener('click', function (event) {
    var button = event.target.closest('[data-chat-starter]');
    if (button) submitQuestion(button.dataset.chatStarter);
  });

  newChat.addEventListener('click', function () {
    stateToken += 1;
    if (activeController) activeController.abort();
    activeController = null;
    messages.innerHTML = '';
    addMessage('Kevin’s AI assistant', 'Hi! What would you like to know about Kevin?', 'assistant');
    conversationId = null;
    retryRequest = null;
    contact.hidden = Boolean(endpoint);
    status.textContent = '';
    starters.hidden = !endpoint;
    form.reset();
    input.style.height = '';
    setBusy(false);
    (input.disabled ? closeChat : input).focus({ preventScroll: true });
  });

  if (!endpoint) {
    revealContact();
    availability.textContent = 'AI assistant · Offline';
    starters.hidden = true;
    setBusy(false);
  }
}());
