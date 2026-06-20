(function () {
  // Configuration
  // Find current script tag to extract options if any
  var currentScript = document.currentScript || (function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  var apiHost = currentScript ? currentScript.getAttribute('data-host') : null;
  if (!apiHost) {
    apiHost = 'http://localhost:5000';
  }

  // Ensure trailing slash is removed
  apiHost = apiHost.replace(/\/$/, '');

  // 1. Generate & Store Session ID
  var SESSION_KEY = 'ua_session_id';
  
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      var v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function getSessionId() {
    var sessionId = localStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = generateUUID();
      localStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
  }

  var sessionId = getSessionId();

  // 2. Event Sender
  function sendEvent(eventType, details) {
    var payload = {
      sessionId: sessionId,
      eventType: eventType,
      pageUrl: window.location.pathname + window.location.search + window.location.hash,
      timestamp: new Date().toISOString()
    };

    if (details) {
      Object.assign(payload, details);
    }

    var url = apiHost + '/api/events';

    if (navigator.sendBeacon) {
      var blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      var success = navigator.sendBeacon(url, blob);
      if (success) return;
    }

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      mode: 'cors'
    }).catch(function (err) {
      console.warn('User Analytics Tracker: Failed to send event', err);
    });
  }

  // 3. Track Page Views
  var lastUrl = window.location.href;
  
  function trackPageView() {
    sendEvent('page_view');
  }

  function checkUrlChange() {
    var currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      trackPageView();
    }
  }

  var originalPushState = history.pushState;
  if (originalPushState) {
    history.pushState = function () {
      originalPushState.apply(this, arguments);
      checkUrlChange();
    };
  }

  var originalReplaceState = history.replaceState;
  if (originalReplaceState) {
    history.replaceState = function () {
      originalReplaceState.apply(this, arguments);
      checkUrlChange();
    };
  }

  window.addEventListener('popstate', checkUrlChange);
  window.addEventListener('hashchange', checkUrlChange);

  if (document.readyState === 'complete') {
    trackPageView();
  } else {
    window.addEventListener('load', trackPageView);
  }

  // 4. Track Clicks
  window.addEventListener('click', function (event) {
    var x = event.pageX;
    var y = event.pageY;

    var element = event.target;
    var selector = element.tagName.toLowerCase();
    if (element.id) {
      selector += '#' + element.id;
    } else if (element.className && typeof element.className === 'string') {
      var classes = element.className.trim().split(/\s+/).join('.');
      if (classes) {
        selector += '.' + classes.substring(0, 50);
      }
    }
    
    var textContent = (element.innerText || element.value || '').trim().substring(0, 30);
    var elementIdentifier = selector + (textContent ? ' ("' + textContent + '")' : '');

    sendEvent('click', {
      x: x,
      y: y,
      vw: window.innerWidth,
      vh: window.innerHeight,
      element: elementIdentifier
    });
  }, true);

  console.log('User Analytics Tracker initialized. Session ID:', sessionId);
})();
