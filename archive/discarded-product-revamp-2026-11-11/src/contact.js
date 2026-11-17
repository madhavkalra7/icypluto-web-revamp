export function setupContact(){
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
// All calls to action work without a backend or hidden subscription.

const contactDialog = $('#contact-dialog'), resourceDialog = $('#resource-dialog');

let lastTrigger, contactIntent = 'Book a demo', resourceIntent;

function showDialog(dialog, trigger = document.activeElement) {

  const panel=trigger?.closest?.('.nav-panel');

  lastTrigger = panel ? document.querySelector(`[aria-controls="${panel.id}"]`) : trigger;

  dialog.showModal();

  document.body.classList.add('modal-open');

}

function openContact(intent, trigger) {

  contactIntent = intent;

  $('#contact-form').hidden = false;

  $('#contact-success').hidden = true;

  $('#contact-description').textContent = intent.includes('community') ? 'Connect with marketers working on AI visibility.' : intent.includes('Pricing') ? 'Ask the IcyPluto team about pricing for your brand or agency.' : 'Tell the IcyPluto team what you want to explore.';

  showDialog(contactDialog, trigger);

}

$$('[data-contact]').forEach(button => button.addEventListener('click', () => openContact(button.dataset.contact, button)));

$$('dialog').forEach(dialog => {

  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());

  dialog.addEventListener('click', event => {

    const rect = dialog.getBoundingClientRect();

    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();

  });

  dialog.addEventListener('close', () => {

    if (!$('dialog[open]')) document.body.classList.remove('modal-open');

    lastTrigger?.focus({ preventScroll: true });

  });

});

$('#contact-form').addEventListener('submit', event => {

  event.preventDefault();

  const data = new FormData(event.currentTarget);

  const subject = 'IcyPluto - ' + contactIntent;

  const body = 'Hi IcyPluto team,\n\nMy name is ' + data.get('name') + '. I would like to connect about: ' + contactIntent + '.\n\nBrand website: ' + data.get('website') + '\nWork email: ' + data.get('email') + '\n\nThanks!';

  $('#email-link').href = 'mailto:info@icypluto.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);

  $('#contact-form').hidden = true;

  $('#contact-success').hidden = false;

  $('#email-link').focus();

});

const resources = {

  podcast: { label: 'ITGAF / THE PODCAST', title: 'ITGAF podcast', description: 'Conversations about AI search, marketing, and how brands adapt.', details: ['AI visibility and the changing discovery journey', 'The decisions facing marketing teams', 'Episode details will be announced'], intent: 'ITGAF podcast updates' },

  summit: { label: 'AI VISIBILITY SUMMIT', title: 'AI Visibility Summit', description: 'Meet marketers exploring how brands earn a place in AI-generated answers.', details: ['Focused roundtables and strategy discussions', 'Shared experiences from marketers', 'Dates and speakers will be announced'], intent: 'AI Visibility Summit and roundtables' },

  academy: { label: 'AIO / GEO ACADEMY', title: 'AIO / GEO Academy', description: 'The planned learning program for AI visibility and generative engine optimization.', details: ['AIO and GEO foundations', 'The Content, Structure, Technical framework', 'Certification and curriculum details to be announced'], intent: 'AIO/GEO Academy launch updates' }

};

$$('[data-resource]').forEach(button => button.addEventListener('click', () => {

  const data = resources[button.dataset.resource];

  resourceIntent = data.intent;

  $('#resource-label').textContent = data.label;

  $('#resource-title').textContent = data.title;

  $('#resource-description').textContent = data.description;

  $('#resource-details').replaceChildren(...data.details.map(detail => { const p = document.createElement('p'); p.textContent = '→ ' + detail; return p; }));

  showDialog(resourceDialog, button);

}));

$('#resource-contact').addEventListener('click', () => {

  const trigger = lastTrigger;

  resourceDialog.close();

  openContact(resourceIntent, trigger);

});



return {openContact};
}
