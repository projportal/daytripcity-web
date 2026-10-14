# Daytrip City website

Buildless HTML/CSS/JavaScript lives in `dist/`. V13 keeps a film opening and “Spend the day your way.” below it.

Preview: `python3 -m http.server 4177 --bind 127.0.0.1 --directory dist`.

- Headline: “Your own San Diego.” Subline: “Explore a living city. Shape it with your AI agent.” Only the name is highlighted; the period sits outside the highlight. The yellow highlighted name rotates AI agent → ChatGPT → Claude every 2.6 seconds, with fixed width and a subtle transition. Existing animation controls pause it; reduced motion keeps AI agent static, and offscreen/hidden/dialog states suspend rotation. Screen readers get one stable sentence.
- The 21-second hero runs Belmont’s hotdog character (6 s), Coronado Bridge (6 s), then Little Italy from day into night (9 s). Desktop and phone have separate crops.
- Three individual 8-second videos: Make it yours (a real agent request and wedding result), Watch it grow (two real residents reaching a food stand), Follow your curiosity (player walking at La Jolla).
- One preview plays at a time. Hover or keyboard focus selects a desktop card; visibility selects on phones. Pause/play controls affect previews. Hidden tabs and open dialogs pause previews. Reduced motion shows posters until the visitor requests playback. Each card and Take a look opens a controlled video dialog with Escape/backdrop/close dismissal and focus return.
- Equal compact raised Download / Take a look buttons use a 6 px gap, tightly framed SVG icons, and centered icon–label groups. Download appears in the hero, below the cards, and inside the dialog. All three use the published 1014v1 Apple-silicon downloader (1.37 MB), with “Windows and more agents coming soon.” beneath the download details. Direct HTML links also work without JavaScript; `dist/links.json` keeps the runtime download URL and display metadata, with legacy `tryNow` support. Update both the static HTML fallback links and configuration when changing releases.
- Footage is actual game source `1115793b3735b00b5311c404cf4ec2443b725bbd`, package `202610101648`. The wedding request was partly fulfilled; the clip does not promise every requested guest/prop. The resident clip shows daily activity, not new buildings or agent learning. No generated imagery. Provenance: `dist/assets/image-credits.json` and the game repository’s V11 portfolio package.
- Rubik fonts (included SIL OFL), ivory/amber/navy colors, skyline wordmark and raised buttons carry through. Footer: https://portal-interactive.com/.

Source repository: https://github.com/projportal/daytripcity-web (public), branch `main`. This repository contains only the standalone website. Serve `dist/` with any static host; no build step or runtime secrets are required. The installer stays in Google Cloud Storage and is linked from the page.

## Hosting

`.github/workflows/deploy-site.yml` publishes `dist/` to GitHub Pages on pushes to `main`. It uses the repository token and GitHub OIDC; no saved deployment credential is required. Official actions are pinned to exact commits. The workflow supports a manual run for the first deployment after Pages is enabled.

This repository was prepared on October 14, 2026. The custom-domain migration is pending the organization administrator and owner’s coordinated cutover. Creating this repository and pushing its initial commit do not move the live domain.

1. An organization owner allows public Pages creation in organization Settings → Member privileges → Pages creation → Public.
2. In [repository Pages settings](https://github.com/projportal/daytripcity-web/settings/pages), select **GitHub Actions** as the publishing source. Run the existing workflow and verify https://projportal.github.io/daytripcity-web/ before domain cutover.
3. The administrator and domain owner coordinate the domain verification and transfer. Completing organization verification can release an existing Pages binding; do this in the agreed cutover window. Follow the separately reviewed operator runbook.
4. After the prior binding is released, set `daytripcity.com` as this repository’s custom domain. The owner changes `www` CNAME to `projportal.github.io`; retain the existing GitHub Pages apex A records and unrelated DNS records.
5. Once DNS and the certificate are ready, enable **Enforce HTTPS** and verify the domain, media and installer download. Only then retire the previous Pages deployment.

Canonical and sharing URLs remain `https://daytripcity.com/`. The published game footage, font license and provenance are retained; no game build, private game source, licensed asset library or API keys are included. This repository begins with one fresh root commit using `Daytrip City <noreply@daytripcity.com>` rather than importing the previous hosting history.
