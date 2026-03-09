#!/usr/bin/env bash
# check-dns.sh — verify DNS A records and nameservers for civic-os-opensourcism.cloud
#
# Usage:
#   bash scripts/check-dns.sh           # interactive / CI
#   bash scripts/check-dns.sh --quiet   # suppress info lines; only print errors
#
# Exit codes:
#   0 — all checks passed
#   1 — one or more checks failed
#
# Required tools: dig (dnsutils / bind-utils package)
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────────────────
readonly EXPECTED_IP="72.61.96.166"
readonly DOMAINS=(
    "civic-os-opensourcism.cloud"
    "www.civic-os-opensourcism.cloud"
)
# Public resolvers to query (name:IP pairs for display)
readonly RESOLVERS=(
    "Google:8.8.8.8"
    "Cloudflare:1.1.1.1"
    "Quad9:9.9.9.9"
)
# Authoritative nameserver hint — Hostinger typically serves ns*.hostinger.com
readonly NS_PATTERN="hostinger"

# ── Helpers ───────────────────────────────────────────────────────────────────
QUIET=false
[[ "${1:-}" == "--quiet" ]] && QUIET=true

PASS=0
FAIL=0

_info()  { $QUIET || printf '  \033[0;34mINFO\033[0m  %s\n' "$*"; }
_ok()    { printf '  \033[0;32m PASS\033[0m  %s\n' "$*"; (( PASS++ )) || true; }
_fail()  { printf '  \033[0;31m FAIL\033[0m  %s\n' "$*"; (( FAIL++ )) || true; }
_head()  { printf '\n\033[1m%s\033[0m\n' "$*"; }

require_dig() {
    if ! command -v dig &>/dev/null; then
        printf '\033[0;31mERROR\033[0m  "dig" is not installed.\n'
        printf '       Install it with:  apt-get install -y dnsutils\n'
        exit 2
    fi
}

# ── Check A records ───────────────────────────────────────────────────────────
check_a_records() {
    _head "A record checks  (expected → ${EXPECTED_IP})"
    local all_pass=true

    for domain in "${DOMAINS[@]}"; do
        for entry in "${RESOLVERS[@]}"; do
            local resolver_name="${entry%%:*}"
            local resolver_ip="${entry##*:}"
            local result
            result=$(dig +short +time=5 +tries=2 @"${resolver_ip}" "${domain}" A 2>/dev/null | grep -E '^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$' | head -1 || true)

            if [[ -z "$result" ]]; then
                _fail "${domain}  via ${resolver_name} (${resolver_ip}) → no A record found"
                all_pass=false
            elif [[ "$result" == "$EXPECTED_IP" ]]; then
                _ok  "${domain}  via ${resolver_name} (${resolver_ip}) → ${result}"
            else
                _fail "${domain}  via ${resolver_name} (${resolver_ip}) → ${result}  (expected ${EXPECTED_IP})"
                all_pass=false
            fi
        done
    done

    $all_pass && return 0 || return 1
}

# ── Check NS records ──────────────────────────────────────────────────────────
check_ns_records() {
    _head "NS record checks  (nameservers for civic-os-opensourcism.cloud)"
    local root_domain="civic-os-opensourcism.cloud"
    local ns_records
    ns_records=$(dig +short +time=5 +tries=2 @8.8.8.8 "${root_domain}" NS 2>/dev/null || true)

    if [[ -z "$ns_records" ]]; then
        _fail "No NS records found for ${root_domain}"
        return 1
    fi

    _info "Nameservers returned:"
    while IFS= read -r ns; do
        _info "  ${ns}"
    done <<< "$ns_records"

    # Warn (but don't fail) if the nameservers don't look like Hostinger's
    if echo "$ns_records" | grep -qi "${NS_PATTERN}"; then
        _ok  "Nameservers contain '${NS_PATTERN}' — Hostinger DNS is authoritative"
    else
        # Could be Cloudflare or another delegated provider; treat as a warning
        printf '  \033[0;33m WARN\033[0m  Nameservers do not contain "%s".\n' "${NS_PATTERN}"
        printf '         If you have delegated to Cloudflare or another provider this is expected.\n'
        printf '         Ensure A records for %s resolve to %s at your provider.\n' "${root_domain}" "${EXPECTED_IP}"
    fi
    return 0
}

# ── Check reverse PTR (best-effort) ───────────────────────────────────────────
check_ptr_record() {
    _head "Reverse PTR check  (${EXPECTED_IP})"
    local ptr
    ptr=$(dig +short +time=5 +tries=2 @8.8.8.8 -x "${EXPECTED_IP}" 2>/dev/null | head -1 || true)

    if [[ -z "$ptr" ]]; then
        printf '  \033[0;33m WARN\033[0m  No PTR record found for %s — this is optional but useful for mail deliverability.\n' "${EXPECTED_IP}"
    else
        _ok "PTR record for ${EXPECTED_IP} → ${ptr}"
    fi
}

# ── Summary ───────────────────────────────────────────────────────────────────
print_summary() {
    printf '\n─────────────────────────────────────────────────────────\n'
    printf '  Results:  \033[0;32m%d passed\033[0m  /  \033[0;31m%d failed\033[0m\n' "$PASS" "$FAIL"
    printf '─────────────────────────────────────────────────────────\n\n'

    if (( FAIL > 0 )); then
        printf '\033[0;31mDNS is NOT fully configured.\033[0m\n'
        printf 'Set the following A records in Hostinger hPanel → Domains → DNS / Nameservers:\n\n'
        printf '  Type  Name                                Value\n'
        printf '  A     civic-os-opensourcism.cloud         %s\n' "${EXPECTED_IP}"
        printf '  A     www.civic-os-opensourcism.cloud     %s\n\n' "${EXPECTED_IP}"
        printf 'After saving, propagation typically completes in 5–15 minutes.\n'
        printf 'Re-run this script to confirm:  bash scripts/check-dns.sh\n\n'
    else
        printf '\033[0;32mDNS is correctly configured.\033[0m  Safe to proceed with deployment.\n\n'
    fi
}

# ── Main ──────────────────────────────────────────────────────────────────────
main() {
    printf '\033[1mCivic OS — DNS Configuration Check\033[0m\n'
    printf 'Domain : civic-os-opensourcism.cloud\n'
    printf 'Target : %s  (Hostinger KVM 1 VPS)\n' "${EXPECTED_IP}"
    printf 'Time   : %s UTC\n' "$(date -u '+%Y-%m-%d %H:%M:%S')"

    require_dig

    local exit_code=0
    check_a_records  || exit_code=1
    check_ns_records || exit_code=1
    check_ptr_record          # best-effort; never fails the script

    print_summary
    exit "$exit_code"
}

main "$@"
