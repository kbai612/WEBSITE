(function () {
  'use strict';

  var notice = document.querySelector('[data-linkedin-consent]');
  if (!notice) return;
  var partnerId = notice.dataset.partnerId;
  if (!/^[1-9]\d*$/.test(partnerId)) return;
  try {
    if (window.location.origin !== new URL(notice.dataset.siteOrigin).origin) return;
  } catch (_) { return; }

  var settings = document.querySelector('[data-tracking-settings]');
  var accept = notice.querySelector('[data-tracking-accept]');
  var reject = notice.querySelector('[data-tracking-reject]');
  var storageKey = 'linkedin-consent-v1-' + partnerId;
  var maxAge = 180 * 24 * 60 * 60 * 1000;
  var loaded = false;
  var preferenceOpener = null;

  function readChoice() {
    try {
      var saved = JSON.parse(window.localStorage.getItem(storageKey));
      if (saved && (saved.choice === 'accepted' || saved.choice === 'declined') &&
          typeof saved.savedAt === 'number' && saved.savedAt <= Date.now() && Date.now() - saved.savedAt < maxAge) {
        return saved.choice;
      }
    } catch (_) { /* Ask again if browser storage is unavailable. */ }
    return null;
  }

  function loadTag() {
    if (loaded || navigator.globalPrivacyControl === true) return;
    loaded = true;
    window._linkedin_partner_id = partnerId;
    window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
    if (window._linkedin_data_partner_ids.indexOf(partnerId) === -1) window._linkedin_data_partner_ids.push(partnerId);
    if (!window.lintrk) {
      window.lintrk = function (a, b) { window.lintrk.q.push([a, b]); };
      window.lintrk.q = [];
    }
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
    document.head.appendChild(script);
  }

  function choose(choice) {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ choice: choice, savedAt: Date.now() }));
    } catch (_) { /* The visitor's choice still applies to this page. */ }
    notice.hidden = true;
    if (preferenceOpener) preferenceOpener.focus();
    if (choice === 'accepted') loadTag();
    // Reload to stop an already-loaded third-party script when consent is withdrawn.
    else if (loaded) window.location.reload();
  }

  accept.addEventListener('click', function () { choose('accepted'); });
  reject.addEventListener('click', function () { choose('declined'); });
  if (settings) {
    settings.hidden = false;
    settings.addEventListener('click', function () {
      preferenceOpener = settings;
      notice.hidden = false;
      reject.focus();
    });
  }

  if (navigator.globalPrivacyControl === true) {
    accept.disabled = true;
    notice.querySelector('p').textContent = 'Your browser’s privacy preference disables LinkedIn tracking on this site.';
  } else {
    var choice = readChoice();
    if (choice === 'accepted') loadTag();
    else if (!choice) notice.hidden = false;
  }

  window.addEventListener('storage', function (event) {
    if (event.key !== storageKey && event.key !== null) return;
    var choice = readChoice();
    if (loaded && choice !== 'accepted') window.location.reload();
    else if (choice === 'accepted') { notice.hidden = true; loadTag(); }
    else notice.hidden = choice === 'declined';
  });
  window.addEventListener('pageshow', function (event) {
    if (!event.persisted) return;
    var choice = readChoice();
    if (loaded && choice !== 'accepted') window.location.reload();
    else if (choice === 'accepted') loadTag();
    else if (!choice && navigator.globalPrivacyControl !== true) notice.hidden = false;
  });
}());
