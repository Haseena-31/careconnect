/* =========================================================
   CareConnect — script.js
   Vanilla JS, no external dependencies.
   Sections:
   1. Navbar (mobile menu)
   2. FAQ knowledge base (shared by FAQ accordion + CareBot)
   3. Request form (validation, ID + priority, localStorage)
   4. Past requests list
   5. FAQ accordion
   6. CareBot chatbot
   7. Contact form (demo only)
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initRequestForm();
  renderPastRequests();
  initFaqAccordion();
  initCareBot();
  initContactForm();
});

/* ========================= 1. NAVBAR ========================= */
function initNavbar() {
  const toggle = document.getElementById('menuToggle');
  const links = document.getElementById('navLinks');

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close mobile menu after selecting a link
  links.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  document.getElementById('askCareBotBtn').addEventListener('click', () => {
    openCareBot();
  });
}

/* ========================= 2. FAQ KNOWLEDGE BASE =========================
   Shared between the static FAQ accordion and CareBot's keyword matcher.
   Each entry: id, question (display), keywords (for matching), answer.
*/
const FAQ_KB = [
  {
    id: 'request',
    question: 'How can I request support?',
    keywords: ['request', 'support', 'apply', 'submit', 'help', 'how do i ask'],
    answer: 'You can submit a healthcare support request using our Request Support form. Please provide your basic contact details and describe the type of assistance you need.'
  },
  {
    id: 'services',
    question: 'What services do you provide?',
    keywords: ['services', 'offer', 'provide', 'what do you do', 'assistance types'],
    answer: 'CareConnect provides support-request assistance for medical needs, medicine support, mental health support, and volunteer assistance.'
  },
  {
    id: 'volunteer',
    question: 'How can I become a volunteer?',
    keywords: ['volunteer', 'join', 'help out', 'sign up', 'volunteering'],
    answer: 'You can contact the CareConnect NGO team through the contact section to express your interest in volunteering.'
  },
  {
    id: 'emergency',
    question: 'Is this an emergency medical service?',
    keywords: ['emergency', 'urgent', '911', 'ambulance', 'life threatening'],
    answer: 'No. CareConnect is a support-request platform concept and does not replace emergency medical services. For emergencies, contact your local emergency service or healthcare provider.'
  },
  {
    id: 'cost',
    question: 'Is there a cost to use CareConnect?',
    keywords: ['cost', 'price', 'fee', 'free', 'pay', 'money'],
    answer: 'CareConnect is a concept-level demonstration platform. In a real NGO deployment, pricing and eligibility would be defined by the organization running it.'
  },
  {
    id: 'response-time',
    question: 'How long does it take to get a response?',
    keywords: ['response time', 'how long', 'wait', 'reply', 'when will'],
    answer: 'Response times depend on the priority level assigned to your request and volunteer availability. Emergency-flagged requests are always shown first to coordinators.'
  },
  {
    id: 'privacy',
    question: 'Is my information kept private?',
    keywords: ['privacy', 'data', 'secure', 'confidential', 'information safe'],
    answer: 'In this concept version, request data is stored only in your browser (localStorage). A production version would use a secured backend and database with proper access controls.'
  },
  {
    id: 'priority',
    question: 'How is my request priority decided?',
    keywords: ['priority', 'urgency', 'how determined', 'categorized', 'category'],
    answer: 'Priority is assigned automatically using simple rules based on your selected support type and description. It is a categorization concept only, not a medical diagnosis.'
  }
];

const FALLBACK_ANSWER = "I don't have an exact answer for that yet. Try asking about requesting support, our services, volunteering, response times, or emergencies — or use the Request Support form for anything specific.";

/* ========================= 3. REQUEST FORM ========================= */
const STORAGE_KEY = 'careconnect_requests';

function initRequestForm() {
  const form = document.getElementById('requestForm');
  const newRequestBtn = document.getElementById('newRequestBtn');

  const fields = ['fullName', 'age', 'email', 'phone', 'location', 'supportType', 'description', 'contactMethod'];

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    fields.forEach((name) => {
      if (!validateField(name)) isValid = false;
    });

    if (!isValid) {
      const firstError = form.querySelector('.invalid');
      if (firstError) firstError.focus();
      return;
    }

    const data = {
      id: generateRequestId(),
      fullName: form.fullName.value.trim(),
      age: form.age.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      location: form.location.value.trim(),
      supportType: form.supportType.value,
      description: form.description.value.trim(),
      contactMethod: form.contactMethod.value,
      priority: determinePriority(form.supportType.value, form.description.value),
      status: 'Received',
      createdAt: new Date().toISOString()
    };

    saveRequest(data);
    showSummary(data);
    renderPastRequests();
    form.reset();
  });

  fields.forEach((name) => {
    const el = form[name];
    el.addEventListener('blur', () => validateField(name));
  });

  newRequestBtn.addEventListener('click', () => {
    document.getElementById('summaryResult').classList.add('hidden');
    document.getElementById('summaryEmpty').classList.remove('hidden');
    form.fullName.focus();
  });

  function validateField(name) {
    const el = form[name];
    const errorEl = document.getElementById('err-' + name);
    let message = '';

    const value = el.value.trim();

    switch (name) {
      case 'fullName':
        if (!value) message = 'Full name is required.';
        else if (value.length < 2) message = 'Please enter a valid name.';
        break;
      case 'age':
        if (!value) message = 'Age is required.';
        else if (Number(value) < 0 || Number(value) > 120) message = 'Please enter a valid age.';
        break;
      case 'email':
        if (!value) message = 'Email is required.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = 'Please enter a valid email address.';
        break;
      case 'phone':
        if (!value) message = 'Phone number is required.';
        else if (!/^[+\d][\d\s\-()]{6,}$/.test(value)) message = 'Please enter a valid phone number.';
        break;
      case 'location':
        if (!value) message = 'Location is required.';
        break;
      case 'supportType':
        if (!value) message = 'Please select a support type.';
        break;
      case 'description':
        if (!value) message = 'Please describe the support needed.';
        else if (value.length < 10) message = 'Please provide a little more detail (10+ characters).';
        break;
      case 'contactMethod':
        if (!value) message = 'Please select a preferred contact method.';
        break;
    }

    if (message) {
      el.classList.add('invalid');
      errorEl.textContent = message;
      return false;
    } else {
      el.classList.remove('invalid');
      errorEl.textContent = '';
      return true;
    }
  }
}

function generateRequestId() {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `CC-${random}`;
}

/* Simple rule-based priority categorization (concept only, not medical advice) */
function determinePriority(supportType, description) {
  const text = (description || '').toLowerCase();
  const urgentKeywords = ['severe', 'urgent', 'emergency', 'unconscious', 'bleeding', 'can\'t breathe', 'cannot breathe', 'chest pain'];

  if (supportType === 'Emergency Assistance') return 'High';
  if (urgentKeywords.some((k) => text.includes(k))) return 'High';

  if (['Medical Assistance', 'Medicine Support', 'Mental Health Support'].includes(supportType)) {
    return 'Medium';
  }

  return 'Low';
}

function saveRequest(data) {
  const all = getRequests();
  all.unshift(data);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

function getRequests() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function showSummary(data) {
  document.getElementById('summaryEmpty').classList.add('hidden');
  const result = document.getElementById('summaryResult');
  result.classList.remove('hidden');

  document.getElementById('sumId').textContent = data.id;
  document.getElementById('sumName').textContent = data.fullName;
  document.getElementById('sumType').textContent = data.supportType;
  document.getElementById('sumLocation').textContent = data.location;
  document.getElementById('sumStatus').textContent = data.status;

  const priorityEl = document.getElementById('sumPriority');
  priorityEl.textContent = data.priority;
  priorityEl.className = '';
  priorityEl.classList.add('priority-' + data.priority.toLowerCase());

  result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ========================= 4. PAST REQUESTS LIST ========================= */
function renderPastRequests() {
  const all = getRequests();
  const wrap = document.getElementById('pastRequestsWrap');
  const list = document.getElementById('pastRequestsList');

  if (all.length === 0) {
    wrap.hidden = true;
    list.innerHTML = '';
    return;
  }

  wrap.hidden = false;
  list.innerHTML = all.slice(0, 5).map((r) => `
    <div class="past-request-item">
      <span class="pr-id">${escapeHtml(r.id)}</span>
      <span>${escapeHtml(r.supportType)}</span>
      <span>${escapeHtml(r.location)}</span>
      <span class="pr-badge priority-${r.priority.toLowerCase()}">${escapeHtml(r.priority)} Priority</span>
      <span>${new Date(r.createdAt).toLocaleDateString()}</span>
    </div>
  `).join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ========================= 5. FAQ ACCORDION ========================= */
function initFaqAccordion() {
  const container = document.getElementById('faqAccordion');

  container.innerHTML = FAQ_KB.map((faq, i) => `
    <div class="faq-item" id="faq-item-${i}">
      <button class="faq-question" aria-expanded="false" aria-controls="faq-answer-${i}">
        ${escapeHtml(faq.question)}
        <span class="chev" aria-hidden="true">⌄</span>
      </button>
      <div class="faq-answer" id="faq-answer-${i}">
        <p>${escapeHtml(faq.answer)}</p>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.faq-question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(isOpen));
    });
  });
}

/* ========================= 6. CAREBOT CHATBOT =========================
   Predefined FAQ knowledge base + simple keyword matching.
   This is an automated FAQ assistant concept — it does NOT call any
   external AI service (no ChatGPT / OpenAI API involved).
*/
function initCareBot() {
  const fab = document.getElementById('carebotFab');
  const win = document.getElementById('carebotWindow');
  const closeBtn = document.getElementById('carebotClose');
  const clearBtn = document.getElementById('carebotClear');
  const form = document.getElementById('carebotForm');
  const input = document.getElementById('carebotInput');
  const messages = document.getElementById('carebotMessages');
  const typing = document.getElementById('carebotTyping');

  fab.addEventListener('click', () => {
    win.classList.contains('hidden') ? openCareBot() : closeCareBot();
  });
  closeBtn.addEventListener('click', closeCareBot);

  clearBtn.addEventListener('click', () => {
    messages.innerHTML = '';
    localStorage.removeItem('careconnect_chat');
    addBotMessage(greetingMessage());
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addUserMessage(text);
    input.value = '';
    respondToUser(text);
  });

  // Restore prior chat or show greeting
  const saved = getSavedChat();
  if (saved.length > 0) {
    saved.forEach((m) => renderMessage(m.role, m.text, m.time, false));
  } else {
    addBotMessage(greetingMessage());
  }

  function greetingMessage() {
    return "Hi, I'm CareBot 🤖 — an automated FAQ assistant. Ask me about requesting support, our services, volunteering, or response times.";
  }

  function respondToUser(text) {
    typing.classList.remove('hidden');
    scrollToBottom();
    const delay = 500 + Math.random() * 500;
    setTimeout(() => {
      typing.classList.add('hidden');
      const answer = matchFaq(text);
      addBotMessage(answer);
    }, delay);
  }

  function matchFaq(userText) {
    const lower = userText.toLowerCase();
    let bestMatch = null;
    let bestScore = 0;

    FAQ_KB.forEach((faq) => {
      let score = 0;
      faq.keywords.forEach((kw) => {
        if (lower.includes(kw)) score += kw.split(' ').length; // longer phrase matches score higher
      });
      if (score > bestScore) {
        bestScore = score;
        bestMatch = faq;
      }
    });

    return bestMatch ? bestMatch.answer : FALLBACK_ANSWER;
  }

  function addUserMessage(text) {
    const time = nowTime();
    renderMessage('user', text, time, true);
  }

  function addBotMessage(text) {
    const time = nowTime();
    renderMessage('bot', text, time, true);
  }

  function renderMessage(role, text, time, persist) {
    const div = document.createElement('div');
    div.className = `msg msg-${role}`;
    div.innerHTML = `${escapeHtml(text)}<span class="msg-time">${time}</span>`;
    messages.appendChild(div);
    scrollToBottom();

    if (persist) {
      const all = getSavedChat();
      all.push({ role, text, time });
      localStorage.setItem('careconnect_chat', JSON.stringify(all.slice(-40)));
    }
  }

  function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
  }

  function nowTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function getSavedChat() {
    try {
      return JSON.parse(localStorage.getItem('careconnect_chat')) || [];
    } catch {
      return [];
    }
  }
}

function openCareBot() {
  const win = document.getElementById('carebotWindow');
  const fab = document.getElementById('carebotFab');
  win.classList.remove('hidden');
  fab.setAttribute('aria-expanded', 'true');
  document.getElementById('carebotInput').focus();
}

function closeCareBot() {
  const win = document.getElementById('carebotWindow');
  const fab = document.getElementById('carebotFab');
  win.classList.add('hidden');
  fab.setAttribute('aria-expanded', 'false');
}

/* ========================= 7. CONTACT FORM (demo only) ========================= */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('contactStatus');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      status.style.color = 'var(--danger)';
      status.textContent = 'Please fill in all fields with a valid email.';
      return;
    }
    status.style.color = 'var(--success)';
    status.textContent = 'Message sent (demo only — no email backend connected).';
    form.reset();
  });
}