'use strict';
const visitsAPI = 'https://vet-helpline-development.dkjmmz6whh.workers.dev';
const menu = document.querySelector('.menu'), links = document.querySelector('#main-links');
menu.addEventListener('click', () => menu.setAttribute('aria-expanded', String(links.classList.toggle('open'))));
links.addEventListener('click', event => { if (event.target.closest('a')) { links.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); } });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && links.classList.contains('open')) { links.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.focus(); } });
const requestForm = document.getElementById('request-form');
let requestReference = crypto.randomUUID().replaceAll('-', '');
let clientAccess = crypto.randomUUID().replaceAll('-', '') + crypto.randomUUID().replaceAll('-', '');
let currentVisit = null, currentAccess = null, loading = false;
const requestStatus = document.getElementById('request-status'), portalStatus = document.getElementById('portal-status');
function status(element, message, error = false) { element.textContent = message; element.className = 'form-status ' + (error ? 'error' : 'success'); }
async function api(path, method = 'GET', body = null, access = null) {
  const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 30000);
  try {
    const headers = {};
    if (body) headers['Content-Type'] = 'application/json';
    if (access) headers.Authorization = 'Bearer ' + access;
    const response = await fetch(visitsAPI + path, { method, headers, body: body ? JSON.stringify(body) : undefined, signal: controller.signal, credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store' });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'This request could not be completed. Please try again.');
    return result;
  } catch (error) {
    if (error.name === 'AbortError' || error instanceof TypeError) throw new Error('The connection was interrupted. Please retry; your message stays here.');
    throw error;
  } finally { clearTimeout(timer); }
}
requestForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (!requestForm.reportValidity()) return;
  const submit = document.getElementById('request-send');
  if (submit.disabled) return;
  submit.disabled = true; status(requestStatus, 'Sending your visit request…');
  try {
    const input = Object.fromEntries(new FormData(requestForm));
    input.token = requestReference; input.clientAccess = clientAccess; input.acceptedPrivacy = requestForm.elements.acceptedPrivacy.checked;
    input.preferredAt = new Date(input.preferredAt).toISOString();
    const result = await api('/petassist/requests', 'POST', input);
    if (!result.clientLink) throw new Error('The request could not be confirmed. Please contact info@bayareaapps.com.');
    const url = new URL(result.clientLink);
    if (url.origin !== 'https://bayareaapps.com' || url.pathname !== '/petassist-local/' || url.search || !/^#visit=[a-f0-9]{32}\.[a-f0-9]{64}$/.test(url.hash)) throw new Error('Your private visit link could not be verified. Contact info@bayareaapps.com.');
    location.hash = url.hash;
    requestForm.reset();
    requestReference = crypto.randomUUID().replaceAll('-', '');
    clientAccess = crypto.randomUUID().replaceAll('-', '') + crypto.randomUUID().replaceAll('-', '');
    status(portalStatus, 'Request received. Save or bookmark this private link. We will confirm your appointment here before payment.');
  } catch (error) { status(requestStatus, error.message, true); }
  finally { submit.disabled = false; }
});
function safeCheckout(value, token) {
  try {
    const url = new URL(value);
    return url.origin === visitsAPI && url.pathname === '/petassist/pay' && url.search === '?token=' + token && !url.hash && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}
function render(visit) {
  const summary = document.getElementById('visit-summary'); summary.replaceChildren();
  for (const value of [visit.petName + ' · ' + visit.service, visit.visitStatus.replaceAll('-', ' '), (visit.scheduledAt ? 'Confirmed: ' : 'Preferred: ') + new Date(visit.scheduledAt || visit.preferredAt).toLocaleString(), visit.amount + ' · ' + visit.status]) {
    const item = document.createElement('span'); item.textContent = value; summary.append(item);
  }
  const pay = document.getElementById('visit-pay'), link = safeCheckout(visit.checkoutURL, currentVisit);
  pay.hidden = !(['accepted', 'en-route', 'in-progress', 'completed'].includes(visit.visitStatus) && visit.status === 'Payment requested' && link);
  if (link) pay.href = link;
  document.getElementById('visit-payment-note').textContent = visit.visitStatus === 'cancelled' ? 'Your visit is cancelled. Contact us about any payment or refund questions.' : visit.visitStatus === 'requested' ? 'Your preferred time is awaiting confirmation. Payment will become available after we confirm your visit.' : visit.status === 'Paid' ? 'Payment received. Thank you! Keep this page for visit updates.' : ['Refunded', 'Partially refunded'].includes(visit.status) ? 'Payment status: ' + visit.status + '. Contact us for any refund questions.' : 'Your appointment is confirmed. Review your service and price before payment.';
  const list = document.getElementById('visit-messages'); list.replaceChildren();
  for (const message of visit.messages) {
    const item = document.createElement('li'), sender = document.createElement('strong'), text = document.createElement('p'), time = document.createElement('time');
    item.className = message.sender === 'business' ? 'business' : 'client';
    sender.textContent = message.sender === 'business' ? 'Paws & Whiskers Visits' : 'You';
    text.textContent = message.text; time.textContent = new Date(message.createdAt).toLocaleString(); time.dateTime = message.createdAt;
    item.append(sender, text, time); list.append(item);
  }
  if (!visit.messages.length) { const item = document.createElement('li'); item.textContent = 'No messages yet. You can ask about your visit here.'; list.append(item); }
}
async function refresh(showSuccess = false) {
  if (!currentVisit || !currentAccess || loading || document.hidden) return;
  loading = true;
  try { render(await api('/petassist/client/visits/' + currentVisit, 'GET', null, currentAccess)); if (showSuccess || portalStatus.textContent === 'Loading your visit…' || portalStatus.classList.contains('error')) status(portalStatus, 'Visit updates refreshed. Save or bookmark this private link.'); }
  catch (error) { status(portalStatus, error.message, true); }
  finally { loading = false; }
}
function openPrivatePage() {
  const match = location.hash.match(/^#visit=([a-f0-9]{32})\.([a-f0-9]{64})$/);
  currentVisit = match ? match[1] : null; currentAccess = match ? match[2] : null;
  document.getElementById('visit-portal').hidden = !match;
  document.getElementById('visit-landing').hidden = !!match;
  if (match) { status(portalStatus, 'Loading your visit…'); refresh(); window.scrollTo(0, 0); }
}
document.getElementById('message-form').addEventListener('submit', async event => {
  event.preventDefault();
  const input = document.getElementById('visit-message'), button = document.getElementById('message-send'), text = input.value.trim();
  if (!text || text.length > 2000 || button.disabled || !currentVisit || !currentAccess) return;
  button.disabled = true; status(portalStatus, 'Sending your message…');
  try { render(await api('/petassist/client/visits/' + currentVisit + '/messages', 'POST', { text }, currentAccess)); input.value = ''; status(portalStatus, 'Message sent to Paws & Whiskers Visits.'); }
  catch (error) { status(portalStatus, error.message, true); }
  finally { button.disabled = false; }
});
document.getElementById('visit-refresh').addEventListener('click', () => refresh(true));
document.getElementById('visit-copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(location.href); status(portalStatus, 'Private link copied. Keep it safe.'); }
  catch { status(portalStatus, 'Copy the address from your browser to save this private link.', true); }
});
window.addEventListener('hashchange', openPrivatePage);
document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
setInterval(() => refresh(), 30000);
openPrivatePage();
