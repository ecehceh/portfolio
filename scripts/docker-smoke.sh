#!/usr/bin/env bash
# Smoke-tests a running container: pages, routes, security headers and the
# non-root user. Used by CI after `docker compose up --wait`.
#   scripts/docker-smoke.sh [base-url]   (default http://localhost:3000)
set -uo pipefail
BASE=${1:-http://localhost:3000}
RESUME=/assets/Christopher_Evan_Wijaksana_CV.pdf
failures=0

body() { curl -fsS "$BASE$1"; }
headers() { curl -fsSI "$BASE$1" | tr -d '\r'; }
has_header() { headers "$1" | grep -qi "^$2:"; }

home_shows_name() { body / | grep -q 'Christopher Evan Wijaksana'; }
home_has_csp() { has_header / content-security-policy; }
# Fetch first, so an unreachable server fails instead of passing the negation.
home_hides_powered_by() { local h; h=$(headers /) && ! grep -qi '^x-powered-by:' <<<"$h"; }
robots_served() { body /robots.txt | grep -q '^Sitemap:'; }
sitemap_served() { body /sitemap.xml | grep -q '<urlset'; }
og_image_is_png() { headers /opengraph-image | grep -qi '^content-type: image/png'; }
resume_without_csp() {
  headers "$RESUME" | grep -qi '^content-type: application/pdf' && ! has_header "$RESUME" content-security-policy
}
static_bundle_served() {
  local bundle
  bundle=$(body / | grep -o '/_next/static/[^"]*\.js' | head -n 1)
  [ -n "$bundle" ] && curl -fsS "$BASE$bundle" >/dev/null
}
# A numeric, non-zero uid; an empty result (container not running) fails too.
runs_as_non_root() {
  local uid
  uid=$(docker compose exec -T web id -u) && [ "$uid" -gt 0 ]
}

check() { # check <description> <function>
  if "$2" >/dev/null 2>&1; then echo "ok   $1"; else echo "FAIL $1"; failures=$((failures + 1)); fi
}

check "home page renders the name" home_shows_name
check "home page sends a CSP" home_has_csp
check "home page hides x-powered-by" home_hides_powered_by
check "robots.txt points to the sitemap" robots_served
check "sitemap.xml" sitemap_served
check "Open Graph image is a PNG" og_image_is_png
check "resume PDF is served without a CSP" resume_without_csp
check "static JS bundles are served" static_bundle_served
command -v docker >/dev/null && check "container runs as a non-root user" runs_as_non_root

if [ "$failures" -gt 0 ]; then echo "$failures check(s) failed"; exit 1; fi
echo "all checks passed"
