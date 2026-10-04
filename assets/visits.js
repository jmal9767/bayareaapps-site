'use strict';
const businessPreview = window.pawsBusinessPreview === true;
let serviceArea = null, requestLocation = null, currentVersion = null;
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
  if (businessPreview || !requestForm.reportValidity()) return;
  const submit = document.getElementById('request-send');
  if (submit.disabled) return;
  submit.disabled = true; status(requestStatus, 'Sending your visit request…');
  try {
    const input = Object.fromEntries(new FormData(requestForm));
    input.token = requestReference; input.clientAccess = clientAccess; input.acceptedPrivacy = requestForm.elements.acceptedPrivacy.checked;
    if (requestLocation && document.getElementById('request-location-confirm').checked) { input.location = requestLocation; input.locationConfirmed = true; }
    input.preferredAt = new Date(input.preferredAt).toISOString();
    const result = await api('/petassist/requests', 'POST', input);
    if (!result.clientLink) throw new Error('The request could not be confirmed. Please contact info@bayareaapps.com.');
    const url = new URL(result.clientLink);
    if (url.origin !== 'https://bayareaapps.com' || url.pathname !== '/petassist-local/' || url.search || !/^#visit=[a-f0-9]{32}\.[a-f0-9]{64}$/.test(url.hash)) throw new Error('Your private visit link could not be verified. Contact info@bayareaapps.com.');
    location.hash = url.hash;
    requestForm.reset(); requestLocation = null; document.getElementById('request-location-remove').hidden = true; document.getElementById('request-location-status').textContent = '';
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
  currentVersion = visit.version;
  document.getElementById('visit-address').textContent = 'Your visit address: ' + visit.address;
  document.getElementById('visit-area').textContent = visit.serviceArea ? 'Our public service area: ' + visit.serviceArea.label : 'Ask us about availability for your address. Our service area has not been published yet.';
  document.getElementById('visit-distance').textContent = visit.distanceMiles != null ? 'Approximately ' + visit.distanceMiles.toFixed(1) + ' miles from our service area (straight-line).' : 'Distance is available once both our service area and your visit location are known.';
  const addressMap = document.getElementById('visit-map'); addressMap.href = mapURL(visit.location ? visit.location.latitude + ',' + visit.location.longitude : visit.address); addressMap.textContent = visit.location ? 'View visit location in Maps' : 'View visit address in Maps'; addressMap.hidden = !visit.address;
  setAreaMap(document.getElementById('visit-area-map'), visit.serviceArea);
  document.getElementById('portal-location-remove').hidden = !visit.location;

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
  if (businessPreview || !text || text.length > 2000 || button.disabled || !currentVisit || !currentAccess) return;
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

function mapURL(query) { const url = new URL('https://maps.apple.com/'); url.searchParams.set('q',query); return url.href; }
function setAreaMap(link, area) { link.hidden = !area; if (area) link.href = mapURL(area.latitude + ',' + area.longitude); }
function approximateMiles(a,b) {
  const rad = value => value * Math.PI / 180;
  const h = Math.sin(rad(b.latitude-a.latitude)/2)**2 + Math.cos(rad(a.latitude))*Math.cos(rad(b.latitude))*Math.sin(rad(b.longitude-a.longitude)/2)**2;
  return 3958.7613 * 2 * Math.asin(Math.sqrt(Math.min(1,Math.max(0,h))));
}
async function loadServiceArea() {
  const text = document.getElementById('public-service-area');
  try {
    serviceArea = await api('/petassist/service-area');
    text.textContent = serviceArea ? 'Our public service area: ' + serviceArea.label : 'Contact info@bayareaapps.com to check availability in your area. We confirm every visit before payment.';
    setAreaMap(document.getElementById('public-service-map'),serviceArea);
  } catch { text.textContent = 'Our service area could not load. Contact info@bayareaapps.com to check your address.'; }
}
function oneVisitLocation() {
  return new Promise((resolve,reject) => {
    if (!navigator.geolocation) { reject(new Error('Location is unavailable in this browser. You can still use your visit address.')); return; }
    navigator.geolocation.getCurrentPosition(position => {
      if (position.coords.accuracy > 1000) { reject(new Error('This location is too imprecise. Try again near the visit address or use your address without location sharing.')); return; }
      resolve({latitude:position.coords.latitude,longitude:position.coords.longitude});
    }, () => reject(new Error('Location could not be shared. Check browser permission or continue with your visit address.')), {enableHighAccuracy:true,timeout:15000,maximumAge:0});
  });
}
for (const kind of ['request','portal']) {
  const button = document.getElementById(kind + '-location-share'), remove = document.getElementById(kind + '-location-remove'), message = document.getElementById(kind === 'request' ? 'request-location-status' : 'location-status'), consent = document.getElementById(kind + '-location-confirm');
  consent.addEventListener('change',() => { if (kind === 'request' && !consent.checked) { requestLocation = null; remove.hidden = true; status(message,'Location will not be included with your request.'); } });
  button.addEventListener('click',async () => {
    if (businessPreview || button.disabled) return;
    if (!consent.checked) { status(message,'Confirm that you are at the visit address before sharing location.',true); return; }
    button.disabled = true; status(message,'Finding the visit location…');
    try {
      const location = await oneVisitLocation();
      if (!consent.checked) { status(message,'Location was not shared.'); return; }
      if (kind === 'request') {
        requestLocation = location; remove.hidden = false;
        status(message,(serviceArea ? 'Approximately ' + approximateMiles(serviceArea,location).toFixed(1) + ' miles from our service area (straight-line). ' : '') + 'This location will be included when you send your request.');
      } else {
        render(await api('/petassist/client/visits/' + currentVisit + '/location','PATCH',{location,locationConfirmed:true,expectedVersion:currentVersion},currentAccess));
        status(message,'Visit location shared with our business. No live tracking is enabled.');
      }
    } catch (error) { status(message,error.message,true); }
    finally { button.disabled = false; }
  });
  remove.addEventListener('click',async () => {
    if (businessPreview || remove.disabled) return;
    remove.disabled = true;
    try {
      if (kind === 'request') { requestLocation = null; remove.hidden = true; }
      else render(await api('/petassist/client/visits/' + currentVisit + '/location','PATCH',{location:null,expectedVersion:currentVersion},currentAccess));
      consent.checked = false; status(message,'Shared coordinates removed. The visit address remains for arranging your visit.');
    } catch (error) { status(message,error.message,true); }
    finally { remove.disabled = false; }
  });
}
if (businessPreview) {
  document.querySelectorAll('form input, form select, form textarea, form button, .location-confirm input, [id$="-location-share"], [id$="-location-remove"]').forEach(element => { element.disabled = true; });
  document.querySelectorAll('form').forEach(form => form.addEventListener('submit',event => event.preventDefault()));
  document.getElementById('visit-pay').addEventListener('click',event => event.preventDefault());
}
loadServiceArea();
