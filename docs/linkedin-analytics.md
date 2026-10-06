# LinkedIn Insight Tag

The shared script include adds `_includes/linkedin-insight.html` across the site.
Tracking stays disabled until `_data/linkedin.yml` contains a numeric `partner_id`.
The ID is public, so it belongs in this tracked data file rather than a secret or
the ignored `_config.yml`.

## Activate

1. Create or open your LinkedIn Campaign Manager ad account.
2. Open **Measure → Signals manager → Insight Tag**. Create the tag if necessary.
3. Choose **I will use a tag manager** and copy the numeric partner ID.
4. Set `partner_id: "YOUR_NUMERIC_ID"` in `_data/linkedin.yml`.
5. Build and publish the Jekyll site. The tag runs only on the canonical origin
   configured in `site.url` and outside `JEKYLL_ENV=development`.

References: [partner ID instructions](https://www.linkedin.com/help/linkedin/answer/a417869)
and [installation and validation](https://business.linkedin.com/advertise/ads/insight-tag).

## Visitor choices

The LinkedIn script loads only after explicit acceptance. Decline and Accept have
equal prominence. The footer’s Tracking preferences control reopens the notice.
Changing from acceptance to decline reloads the page to stop the running tag.
Choices expire after 180 days and apply across site pages and browser tabs.
Global Privacy Control keeps tracking disabled even with saved acceptance.
No image-pixel fallback runs before consent. Pages with `analytics: false`, including
the privacy page, omit the tag entirely.

Disable **Website Actions** in LinkedIn’s account settings if enabled. The tag
provider can automatically collect clicks and form activity through that feature;
this site does not add custom conversion events or send chatbot message text.
Do not enable automatic collection on the chat form. The tag’s standard page-view
collection and LinkedIn’s use of that data are explained on `/privacy/`.

## Verify

Run `npm.cmd test` from `backend`. From the root, set the production environment
before building (PowerShell):

```powershell
$env:JEKYLL_ENV = 'production'
bundle exec jekyll build
```

Jekyll defaults to the development environment when none is set; that intentionally
omits this tracking integration. GitHub Pages production builds use production.
After publishing, visit a public page with a fresh browser storage state:

- Before acceptance and after decline, no request to `snap.licdn.com` should occur.
- Accept to load `li.lms-analytics/insight.min.js` once. Check the Network panel
  for LinkedIn collection requests and the correct partner ID.
- Navigate to another page: the tag should load with saved acceptance.
- Open Tracking preferences and decline: after reload, no tag should load.
- Visit `/privacy/`: it should never include the tracking script or notice.
- Check the Insight Tag status in Campaign Manager. LinkedIn says activation
  may take up to 24 hours, depending on traffic.

Local previews do not send LinkedIn data. Automated tests use a synthetic partner
ID and mock script insertion, with no requests to LinkedIn. Live activation must
be verified with the actual account after deployment.
