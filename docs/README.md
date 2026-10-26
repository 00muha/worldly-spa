# Wordly Documentation

This directory is the central home for Wordly lab material, example code, and reviewed solutions. Keep materials grouped by topic and link each item here so they are easy to find.

## Repository map

- `labs/`: lab briefs, objectives, setup steps, and acceptance criteria.
- `examples/`: runnable examples and repeatable app checks.
- `solutions/`: reviewed solutions, paired with the corresponding lab or example.

When adding material, include its purpose, prerequisites, run instructions, expected result, and a last-reviewed date. Do not include credentials or private API data.

## Search regression checks

Run these checks after changing search, rendering, or API handling:

| Case | Input or fixture | Expected result |
| --- | --- | --- |
| Valid word | `serendipity` | Word, pronunciation, audio control, definitions, and available synonyms render; status clears. |
| Missing pronunciation and synonyms | A successful dictionary response with no phonetic text and empty synonym lists | Pronunciation and synonym fallback messages render; audio control stays hidden. |
| Invalid characters | `word!` | Validation message appears and no API request is sent. |
| Empty query | Empty input | “Enter a word to search.” appears and no API request is sent. |
| Unknown word | A dictionary 404 response | A spelling/not-found message appears without stale results. |
| Overlapping searches | Submit two valid words before the first response completes | Only the most recent search is displayed. |

## Review schedule

Review the application and this documentation on the first Monday of each month. In each review, verify the dictionary API behavior, run the regression checks above, check browser console errors and keyboard accessibility, and update examples or guidance that no longer match the app. Record notable changes in the pull request or release notes.