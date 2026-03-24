/* 1883 Boutique Hotel Chatbot Widget v1.0 */
(function() {
  'use strict';

  var BASE_URL = (window.CHATBOT_CONFIG && window.CHATBOT_CONFIG.backendUrl) || '';
  var isOpen = false;
  var conversationHistory = [];

  var WELCOME_MSG = 'Welcome to Hotel 1883! ✨ I can help you check room availability, rates, get directions, or answer questions about our hotel. How can I assist you today?';
  var QUICK_REPLIES = ['Check availability', 'Room rates', 'How to get here', 'Hotel amenities', 'Contact us'];

  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function(k) {
      if (k === 'class') e.className = attrs[k];
      else if (k === 'style') e.style.cssText = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    if (children) {
      if (typeof children === 'string') e.innerHTML = children;
      else children.forEach(function(c) { if (c) e.appendChild(c); });
    }
    return e;
  }

  function buildWidget() {
    var container = el('div', { id: 'chatbot-1883' });

    var messagesDiv = el('div', { class: 'cb-messages' });
    
    var window_ = el('div', { class: 'cb-window' }, [
      el('div', { class: 'cb-header' }, [
        el('div', { class: 'cb-header-avatar' }, '🏨'),
        el('div', { class: 'cb-header-info' }, [
          el('h4', null, '1883 Boutique Hotel'),
          el('p', null, 'Concierge • Usually replies instantly')
        ])
      ]),
      messagesDiv,
      buildInputArea()
    ]);

    var toggleBtn = el('button', { class: 'cb-toggle', title: 'Chat with us' }, '🏨');
    toggleBtn.addEventListener('click', function() {
      toggle(window_, messagesDiv);
    });

    container.appendChild(window_);
    container.appendChild(toggleBtn);
    document.body.appendChild(container);

    // Show welcome message after short delay
    setTimeout(function() {
      addBotMessage(messagesDiv, WELCOME_MSG, QUICK_REPLIES);
    }, 600);
  }

  function buildInputArea() {
    var textarea = el('textarea', { class: 'cb-input', placeholder: 'Type a message...', rows: '1' });
    var sendBtn = el('button', { class: 'cb-send', title: 'Send' }, '→');

    textarea.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(textarea);
      }
    });
    sendBtn.addEventListener('click', function() {
      sendMessage(textarea);
    });

    return el('div', { class: 'cb-input-area' }, [textarea, sendBtn]);
  }

  function toggle(window_, messagesDiv) {
    isOpen = !isOpen;
    if (isOpen) {
      window_.classList.add('open');
      var inp = window_.querySelector('.cb-input');
      if (inp) inp.focus();
    } else {
      window_.classList.remove('open');
    }
  }

  function addBotMessage(container, text, quickReplies) {
    var msgEl = el('div', { class: 'cb-msg bot' }, escapeHtml(text).replace(/\n/g, '<br>'));
    container.appendChild(msgEl);

    if (quickReplies && quickReplies.length) {
      var qrDiv = el('div', { class: 'cb-quick-replies' });
      quickReplies.forEach(function(qr) {
        var btn = el('button', { class: 'cb-qr' }, qr);
        btn.addEventListener('click', function() {
          qrDiv.remove();
          var userMsg = el('div', { class: 'cb-msg user' }, qr);
          container.appendChild(userMsg);
          scrollToBottom(container);
          processUserInput(qr, container);
        });
        qrDiv.appendChild(btn);
      });
      container.appendChild(qrDiv);
    }

    scrollToBottom(container);
    return msgEl;
  }

  function addUserMessage(container, text) {
    var msgEl = el('div', { class: 'cb-msg user' }, escapeHtml(text));
    container.appendChild(msgEl);
    scrollToBottom(container);
    return msgEl;
  }

  function showTyping(container) {
    var typing = el('div', { class: 'cb-typing' }, [
      el('span'), el('span'), el('span')
    ]);
    container.appendChild(typing);
    scrollToBottom(container);
    return typing;
  }

  function sendMessage(textarea) {
    var text = textarea.value.trim();
    if (!text) return;
    textarea.value = '';

    var messagesDiv = document.querySelector('#chatbot-1883 .cb-messages');
    addUserMessage(messagesDiv, text);
    processUserInput(text, messagesDiv);
  }

  function processUserInput(text, container) {
    var lower = text.toLowerCase();

    // Check availability intent
    if (lower.includes('availab') || lower.includes('room') || lower.includes('book') || lower.includes('check in') || lower.includes('check-in')) {
      handleAvailabilityIntent(container);
      return;
    }

    // Rates intent
    if (lower.includes('rate') || lower.includes('price') || lower.includes('cost') || lower.includes('how much')) {
      handleRatesIntent(container);
      return;
    }

    // Directions intent
    if (lower.includes('direction') || lower.includes('get here') || lower.includes('location') || lower.includes('address') || lower.includes('distance') || lower.includes('airport')) {
      handleDirectionsIntent(container);
      return;
    }

    // Amenities intent
    if (lower.includes('amenit') || lower.includes('facilit') || lower.includes('service') || lower.includes('pool') || lower.includes('restaurant') || lower.includes('wifi') || lower.includes('spa') || lower.includes('gym')) {
      handleAmenitiesIntent(container);
      return;
    }

    // Contact intent
    if (lower.includes('contact') || lower.includes('phone') || lower.includes('email') || lower.includes('call')) {
      handleContactIntent(container);
      return;
    }

    // Default fallback
    handleFallback(container);
  }

  function handleAvailabilityIntent(container) {
    var typing = showTyping(container);
    setTimeout(function() {
      typing.remove();
      addBotMessage(container,
        'I\'d love to help you check availability! 📅\nPlease tell me:\n\u2022 Check-in date\n\u2022 Check-out date\n\u2022 Number of guests\n\nOr click below to open our booking engine directly:',
        ['Open booking engine', 'Check rates instead', 'Back to menu']
      );
    }, 1000);
  }

  function handleRatesIntent(container) {
    var typing = showTyping(container);
    fetch(BASE_URL + '/api/rates?' + new URLSearchParams({
      checkIn: getTomorrowDate(),
      checkOut: getDayAfterTomorrowDate(),
      adults: 2
    })).then(function(r) { return r.json(); }).then(function(data) {
      typing.remove();
      var msg = 'Here are our current starting rates: 💰\n\nRates vary by room type and season. For the best price, I recommend booking directly through our engine.';
      addBotMessage(container, msg, ['Open booking engine', 'Check specific dates', 'Back to menu']);
    }).catch(function() {
      typing.remove();
      addBotMessage(container,
        'Our current rates start from $80/night for standard rooms and $150/night for deluxe rooms. Prices vary by season and availability.\n\nClick below for exact pricing on your dates:',
        ['Open booking engine', 'Back to menu']
      );
    });
  }

  function handleDirectionsIntent(container) {
    var typing = showTyping(container);
    fetch(BASE_URL + '/api/maps/hotel').then(function(r) { return r.json(); }).then(function(data) {
      typing.remove();
      addBotMessage(container,
        '📍 Hotel 1883 is located in the heart of Baku, Azerbaijan.\n\nAddress: Baku Old City area\n\nFrom Heydar Aliyev International Airport: approximately 30-40 minutes by taxi.\n\nWould you like me to calculate the distance from a specific location?',
        ['Distance from airport', 'Open in Google Maps', 'Back to menu']
      );
    }).catch(function() {
      typing.remove();
      addBotMessage(container,
        '📍 We are located in the heart of Baku, Azerbaijan.\n\nFrom Heydar Aliyev Airport: ~30-40 min by taxi\n\nWould you like directions from a specific location?',
        ['Open in Google Maps', 'Back to menu']
      );
    });
  }

  function handleAmenitiesIntent(container) {
    var typing = showTyping(container);
    setTimeout(function() {
      typing.remove();
      addBotMessage(container,
        '🏨 Hotel 1883 amenities include:\n\n• Free high-speed WiFi\n• Restaurant & Bar\n• 24/7 Concierge service\n• Airport transfer (on request)\n• Fitness center\n• Room service\n• Dry cleaning service\n• Business center\n\nIs there anything specific you\'d like to know more about?',
        ['Check availability', 'Contact us', 'Back to menu']
      );
    }, 800);
  }

  function handleContactIntent(container) {
    var typing = showTyping(container);
    setTimeout(function() {
      typing.remove();
      addBotMessage(container,
        '📞 Contact Hotel 1883:\n\n• Phone: +994 XX XXX XX XX\n• Email: info@1883boutiquehotel.com\n• Website: www.1883boutiquehotel.com\n\nOur team is available 24/7 to assist you.',
        ['Check availability', 'Get directions', 'Back to menu']
      );
    }, 600);
  }

  function handleFallback(container) {
    var typing = showTyping(container);
    setTimeout(function() {
      typing.remove();
      addBotMessage(container,
        'I\'m here to help! 😊 Here\'s what I can do for you:',
        QUICK_REPLIES
      );
    }, 600);
  }

  function getTomorrowDate() {
    var d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }

  function getDayAfterTomorrowDate() {
    var d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function scrollToBottom(container) {
    container.scrollTop = container.scrollHeight;
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildWidget);
  } else {
    buildWidget();
  }
})();