const progressFill = document.querySelector('#progress-fill');
const answerToggle = document.querySelector('#toggle-answers');
const answerDetails = () => document.querySelectorAll('details.answer-reveal');
const sessionLinks = [...document.querySelectorAll('.session-link')];
const mobileSessionToggle = document.querySelector('#mobile-session-toggle');
const mobileNavBackdrop = document.querySelector('#mobile-nav-backdrop');
const sidebarToggle = document.querySelector('#sidebar-toggle');
const sessionSections = sessionLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

function updateReadingProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progressFill.style.width = `${Math.min(100, Math.max(0, progress))}%`;
}

function updateActiveSession() {
  if (sessionSections.length === 0) return;
  const marker = window.innerWidth <= 720 ? window.innerHeight * 0.45 : window.innerHeight * 0.3;
  let activeSection = sessionSections[0];

  for (const section of sessionSections) {
    if (section.getBoundingClientRect().top <= marker) activeSection = section;
    else break;
  }

  sessionLinks.forEach((link) => {
    if (link.getAttribute('href') === `#${activeSection.id}`) {
      link.setAttribute('aria-current', 'location');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function setSessionMenuOpen(isOpen) {
  document.body.classList.toggle('session-menu-open', isOpen);
  mobileSessionToggle.setAttribute('aria-expanded', String(isOpen));
  mobileSessionToggle.setAttribute('aria-label', isOpen ? 'Close session navigation' : 'Open session navigation');
  mobileSessionToggle.querySelector('span').textContent = isOpen ? '×' : '☰';
  mobileNavBackdrop.hidden = !isOpen;
}

function setSessionPanelCollapsed(isCollapsed) {
  document.body.classList.toggle('session-panel-collapsed', isCollapsed);
  sidebarToggle.setAttribute('aria-expanded', String(!isCollapsed));
  sidebarToggle.setAttribute('aria-label', isCollapsed ? 'Show session panel' : 'Hide session panel');
  sidebarToggle.querySelector('.sidebar-toggle-icon').textContent = isCollapsed ? '›' : '‹';
  sidebarToggle.querySelector('.sidebar-toggle-label').textContent = isCollapsed ? 'Show panel' : 'Hide panel';
}

window.addEventListener('scroll', updateReadingProgress, { passive: true });
window.addEventListener('scroll', updateActiveSession, { passive: true });
window.addEventListener('resize', updateReadingProgress);
window.addEventListener('resize', updateActiveSession);
updateReadingProgress();
updateActiveSession();

mobileSessionToggle.addEventListener('click', () => {
  setSessionMenuOpen(mobileSessionToggle.getAttribute('aria-expanded') !== 'true');
});
mobileNavBackdrop.addEventListener('click', () => setSessionMenuOpen(false));
sidebarToggle.addEventListener('click', () => {
  setSessionPanelCollapsed(!document.body.classList.contains('session-panel-collapsed'));
});
sessionLinks.forEach((link) => link.addEventListener('click', () => setSessionMenuOpen(false)));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && document.body.classList.contains('session-menu-open')) {
    setSessionMenuOpen(false);
  }
});
window.addEventListener('resize', () => {
  if (window.innerWidth > 720 && document.body.classList.contains('session-menu-open')) {
    setSessionMenuOpen(false);
  }
  if (window.innerWidth <= 720 && document.body.classList.contains('session-panel-collapsed')) {
    setSessionPanelCollapsed(false);
  }
});

document.querySelectorAll('.mcq').forEach((card, index) => {
  const answer = card.querySelector('.answer-reveal .answer');
  const fieldset = card.querySelector('.choices');
  const answerText = answer?.textContent ?? '';
  const match = answerText.match(/Answer:\s*([A-D])(?:\.|\b)/i);
  if (!answer || !fieldset || !match) return;

  const correct = match[1].toUpperCase();
  const explanation = answerText.replace(/^\s*Answer:\s*[A-D]\.\s*/i, '').trim();
  const feedback = document.createElement('p');
  feedback.id = `mcq-feedback-${index + 1}`;
  feedback.className = 'mcq-feedback';
  feedback.setAttribute('role', 'status');
  feedback.setAttribute('aria-live', 'polite');
  fieldset.setAttribute('aria-describedby', feedback.id);
  fieldset.insertAdjacentElement('afterend', feedback);

  fieldset.addEventListener('change', (event) => {
    const selected = event.target;
    if (!(selected instanceof HTMLInputElement) || selected.type !== 'radio') return;

    const isCorrect = selected.value.toUpperCase() === correct;
    fieldset.querySelectorAll('label').forEach((label) => {
      label.classList.remove('is-correct', 'is-incorrect');
    });

    const correctLabel = [...fieldset.querySelectorAll('label')].find((label) => {
      return label.querySelector('input')?.value.toUpperCase() === correct;
    });
    correctLabel?.classList.add('is-correct');
    if (!isCorrect) selected.closest('label')?.classList.add('is-incorrect');

    card.classList.toggle('is-correct', isCorrect);
    card.classList.toggle('is-incorrect', !isCorrect);
    feedback.className = `mcq-feedback ${isCorrect ? 'is-correct' : 'is-incorrect'}`;
    feedback.textContent = isCorrect
      ? `Correct — ${explanation}`
      : `Not quite. The correct answer is ${correct}. ${explanation}`;
  });
});

answerToggle.addEventListener('click', () => {
  const shouldOpen = answerToggle.getAttribute('aria-expanded') !== 'true';
  answerDetails().forEach((item) => {
    item.open = shouldOpen;
  });
  answerToggle.setAttribute('aria-expanded', String(shouldOpen));
  answerToggle.textContent = shouldOpen ? 'Hide all explanations' : 'Reveal all explanations';
});
