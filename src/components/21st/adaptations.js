// Native DOM/Sass adaptations of MIT-licensed components discovered on 21st.dev.
// Attribution and source links are in the adjacent README.md.
export function setupTwentyFirstComponents(getMotion) {
  const items = [...document.querySelectorAll('.faq-list details')];
  for (const item of items) {
    item.addEventListener('toggle', () => {
      item.dataset.state = item.open ? 'open' : 'closed';
      if (!item.open) return;
      for (const other of items) if (other !== item) other.open = false;
      if (getMotion()) item.querySelector('[data-slot="accordion-content"]').animate?.([{ opacity: .4, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 220, easing: 'ease-out' });
    });
  }
  document.querySelector('.faq-list').addEventListener('keydown', event => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    const triggers = items.map(item => item.querySelector('summary'));
    const current = triggers.indexOf(document.activeElement);
    if (current < 0) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? triggers.length - 1 : (current + (event.key === 'ArrowDown' ? 1 : -1) + triggers.length) % triggers.length;
    triggers[next].focus();
  });
}
