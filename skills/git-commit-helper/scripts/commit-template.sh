#!/usr/bin/env bash
# Helper script to inspect current git status for commit preparation
echo "=== Git Status ==="
git status -s
echo ""
echo "=== Staged Diff Stat ==="
git diff --cached --stat
