# Code Review Checklist

Use this checklist during code reviews to ensure thoroughness and consistency.

## 1. Correctness & Robustness
- [ ] Are null, undefined, or missing values handled safely?
- [ ] Are error boundaries and exceptions caught and logged or propagated properly?
- [ ] Are array/collection bounds checked?
- [ ] Are async operations handled properly with `await` or promise chains?

## 2. Security
- [ ] Are user inputs properly validated and sanitized?
- [ ] Are credentials, API keys, or secrets excluded from version control?
- [ ] Are external process executions or queries immune to injection?

## 3. Architecture & Clean Code
- [ ] Does each function/module have a single, well-defined responsibility?
- [ ] Are variables and functions descriptively named without abbreviations?
- [ ] Is dead code or unused commented-out code removed?

## 4. Tests
- [ ] Are new features covered by corresponding unit or integration tests?
- [ ] Are edge cases and failure paths tested?
