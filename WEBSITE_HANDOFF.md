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
