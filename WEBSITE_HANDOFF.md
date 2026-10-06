# Website handoff — October 4, 2026

The three public pages share Bay Area Apps charcoal (#0e1014), red (#c81e30), and gold (#f2c65b), while preserving distinct layouts:
- / — Bay Area Apps studio and project grid.
- /paws-whiskers/ — Paws & Whiskers Care Line, pet illustrations, editorial support and curved pricing panels. Current prices: Quick $10, Detailed $15, Phone $25, Free Community Support.
- /petassist-local/ — Paws & Whiskers Visits, pet illustrations, appointment form, service pricing and a private client page. The legacy URL remains stable.

Clients use the website. The business owner uses the private iPhone app; no client installation or public provider marketplace is required. Visit requests enter the protected business inbox. Checkout opens after the owner confirms a visit. Client and business messages appear on the private client page. Appointment state and PayPal payment/refund state remain separate.

The Visits page uses fragment-based private access links and contains no advertising or analytics scripts. Keep third-party scripts off this private page. The studio and care-line pages retain the existing AdSense loader and publisher files; these do not confirm ad approval or earnings.

Payment processing uses the existing Cloudflare worker and business PayPal account. Apple Pay availability depends on the client browser and PayPal eligibility. No funds are directed to an Apple account email; payments are processed by the connected business PayPal merchant.

Preserve CNAME, app-ads.txt, ads.txt, privacy links and the existing care-line intake URL. Backend code is in Vet-Assistant-Help-Line/main; private Visits app code is in PetAssist-Local-App/PetAssist-Local (main is a separate app). No operator connection key belongs in website source or Git.

## October 4: text-only preference
The user requested removing all website images. Removed first-party raster artwork, inline SVG artwork, icons, and illustration videos from all three public pages, and removed their asset files. Pet branding uses names, copy, typography and the shared charcoal/red/gold palette. Request forms, private messages, checkout, service prices and navigation remain functional.

### Local distance and location
The Visits website reads its public service area from `/petassist/service-area`. The owner publishes its city/ZIP or public address through the native Business tab; no personal GPS location is automatically shared. Clients may optionally share a one-time browser location while at the visit address, with explicit confirmation; their private page permits removing it. The native app can resolve a written visit address using Apple. Private pages show that client's address/pin and the same server-calculated straight-line distance as the business app; public payment receipts never show those details. Distances are not driving estimates or live tracking. Apple Maps links open on user action; no image or map embed was added. The app embeds this website in a read-only client preview, disabling forms and checkout when its WebKit preview flag is set.

### Client visit progress
The Visits private page follows an Uber-style service flow adapted to a single pet-care business: request received, confirmed, on the way, caring for the pet, completed. Native appointment controls update these existing server statuses; the website refreshes every 30 seconds while visible. Cancellation hides the progress tracker and closes checkout. The current stage is accessible using aria-current and future stages are not shown as completed. Service cards select the request's service; the visit address comes first. “On the way” is a business status, not an ETA or live GPS tracking. Live location sharing requires a separate owner choice and is not implied by this design.

### General-area map
The client website now embeds an interactive OpenStreetMap map of the public service area on both the landing and private visit page. It has no exact-location marker. Only the public area coordinates are sent to the embed; never client pins, addresses or access links. This supersedes the earlier map-link-only description. CSP permits the OpenStreetMap frame and the native preview permits that exact embed as a subframe while keeping main navigation restricted to the business website. Privacy text explains the map provider. The site retains no decorative photos or imagery. The actual area must be chosen by the owner; no location has been guessed.

## October 5: ride-style Visits booking
The public Visits page at `/petassist-local/` is now a map-first booking screen in the shared charcoal, red, white, and gold palette. Clients enter a visit address, choose Nail Trim ($35), Medication Care ($45), Sample Collection ($55), or Wellness Check ($65), then send a request. The private visit page is the same bottom sheet: progress, messages, and PayPal or Apple Pay only after the business confirms. Payment still uses the Care Line worker checkout. No advertising or analytics was added. The OpenStreetMap frame still receives only the public service area.

## October 5: owner location stays private
Clients never receive the business service-area coordinates, label, map, or distance. The ride screen uses a decorative grid, not a live map. The business app still calculates distance for the owner only. Optional client location sharing still goes to the business and can be removed from the private page.
