# Website update — October 3, 2026

Two public companion sites are hosted by the existing BayAreaApps GitHub Pages deployment:
- /paws-whiskers/ — Paws & Whiskers Care Line
- /petassist-local/ — PetAssist Local

Both sites link to each other and the BayAreaApps homepage. The homepage links to both. The older private ChatGPT companion site is preserved, but is no longer the public homepage destination.

Content sources:
- jmal9767/Vet-Assistant-Help-Line main: README.md, index.html, terms.html, privacy.html. Existing Cloudflare intake is linked, not copied or changed. Prices: $5 quick, $10 detailed, $20 phone, $0 Community Access.
- jmal9767/PetAssist-Local-App branch PetAssist-Local: XCODE_IOS_SETUP.md, WelcomeView.swift, MarketplaceModels.swift, and project tree. Do not use main for this app: it contains the separate CritterCare project.

PetAssist is explicitly in development; no provider verification, live booking, payment, availability, or App Store release is claimed. No new form stores data. Email links open the visitor’s mail app.

Future maintainers / Grok: update descriptions and launch status only when confirmed in the appropriate app branch. Preserve existing CNAME, app-ads files, and public care-line intake URL. These websites do not alter app code or deploy backend changes.

## AdSense — October 3, 2026

Added the user-supplied async AdSense loader for ca-pub-4065093972696595 once in the head of the homepage and each app companion page. Added root ads.txt; existing app-ads.txt already lists the same publisher and is preserved. Website privacy is at /privacy/ and linked from all three footers. The external care-line intake, payment forms, and apps were not modified. No ad unit IDs were supplied, so no manual ad units were invented. Auto ads placements, account/site approval, geographic consent messages, and ad formats must be configured in the publisher’s AdSense dashboard. Recommend disabling overlay/vignette/anchor formats to maintain the accessible layout. Verify Google consent-message requirements for the actual visitors before serving ads in affected regions. The code installation itself does not confirm approval, ad delivery, or earnings.

## Friendly redesign — October 3, 2026

Simplified all three public pages with a bright shared theme, rounded controls, shorter copy, and readable dark text. The user explicitly withdrew the picture request; no images are included or referenced. /assets/friendly.css is now shared by all three pages. App names, care-line prices, Community Access, existing intake links, and PetAssist development status remain accurate. Paws service is still for adults; the friendly visual style does not add services for children. AdSense loader remains once in each page head, and website privacy links remain in each footer.

The user clarified that friendly means playful and approachable for adults, rather than a children’s website. Adult-oriented wording retained alongside the lighter theme. No pictures.

## Distinct app themes and studio restoration — October 3, 2026

Restored BayAreaApps homepage exactly to the black/red/gold version at c0cd26b (including installed AdSense and privacy link). Paws now uses cream, forest green, terracotta, serif headlines and a curved pricing panel; PetAssist uses navy, lime, bold sans-serif headlines and a local-services layout. Both pages use separate CSS files, remain picture-free as requested, preserve pricing/status and cross-links, and retain AdSense and privacy links.
