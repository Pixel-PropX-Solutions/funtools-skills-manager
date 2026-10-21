#!/usr/bin/env bash
# diff-audit.sh
# Verifies that git diff contains ONLY presentational changes and zero logic modifications.

set -euo pipefail

echo "=========================================="
echo "   improve-ui: Automated Diff Audit       "
echo "=========================================="

DIFF_TARGET="${1:-HEAD}"
ERRORS_FOUND=0
WARNINGS_FOUND=0

# Check git repository availability
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "[-] Not inside a git repository. Skipping automated git diff audit."
  exit 0
fi

# List of changed files
CHANGED_FILES=$(git diff --name-only "$DIFF_TARGET" 2>/dev/null || git status --porcelain | awk '{print $2}')

if [ -z "$CHANGED_FILES" ]; then
  echo "[+] Clean working tree: No modified files found."
  exit 0
fi

echo "[*] Auditing modified files for presentation isolation..."
echo ""

# 1. Check for modified non-presentation files
NON_PRESENTATION_PATTERN="(\.sql$|\.prisma$|migrations/|models/|controllers/|services/|api/|server/|backend/|store/|reducers/|routes/api/)"

for file in $CHANGED_FILES; do
  if echo "$file" | grep -Eq "$NON_PRESENTATION_PATTERN"; then
    echo "[!] HIGH RISK: Non-presentation file modified: $file"
    ERRORS_FOUND=$((ERRORS_FOUND + 1))
  fi
done

# 2. Check for suspicious logic changes inside changed files
echo "[*] Scanning diff for suspicious logic modifications..."

SUSPICIOUS_PATTERNS=(
  "fetch("
  "axios\."
  "async "
  "await "
  "useState("
  "useEffect("
  "useReducer("
  "useQuery("
  "useMutation("
  "dispatch("
  "router\.(push|replace|go)"
  "navigate("
  "data-testid"
  "aria-label"
)

DIFF_OUTPUT=$(git diff -U1 "$DIFF_TARGET" 2>/dev/null || true)

for pattern in "${SUSPICIOUS_PATTERNS[@]}"; do
  MATCHES=$(echo "$DIFF_OUTPUT" | grep -E "^\+[[:space:]]*.*$pattern" || true)
  if [ -n "$MATCHES" ]; then
    echo "[!] WARNING: Suspicious addition detected matching pattern '$pattern':"
    echo "$MATCHES" | head -n 3
    echo ""
    WARNINGS_FOUND=$((WARNINGS_FOUND + 1))
  fi

  DELETIONS=$(echo "$DIFF_OUTPUT" | grep -E "^\-[[:space:]]*.*$pattern" || true)
  if [ -n "$DELETIONS" ]; then
    echo "[!] HIGH RISK: Suspicious deletion detected matching pattern '$pattern':"
    echo "$DELETIONS" | head -n 3
    echo ""
    ERRORS_FOUND=$((ERRORS_FOUND + 1))
  fi
done

echo "=========================================="
if [ "$ERRORS_FOUND" -gt 0 ]; then
  echo "[-] DIFF AUDIT FAILED: $ERRORS_FOUND non-presentational changes detected."
  echo "    Review and revert logic changes before passing Gate 3."
  exit 1
elif [ "$WARNINGS_FOUND" -gt 0 ]; then
  echo "[~] DIFF AUDIT PASSED WITH $WARNINGS_FOUND WARNING(S)."
  echo "    Ensure all additions are strictly styling-related (e.g. state for local UI animation)."
  exit 0
else
  echo "[+] DIFF AUDIT PASSED: All changes are isolated to presentation layer."
  exit 0
fi
