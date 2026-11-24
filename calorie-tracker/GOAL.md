# GOAL — Calorie & Water Tracker

Plan: see `~/.claude/plans/var-folders-w9-t86mzwwn1p99z45r918qdm3r-humble-beacon.md`.
Design reference: the mockup screenshot (greeting → Today card → Quick actions → Up next), mobile-first, warm orange gradient, rounded white cards.

## Loop rules (read every iteration)
1. Pick the **first unchecked** item below. Work on one item at a time.
2. Implement it **and** add or extend the test named in brackets.
3. Run `npm run check` (lint + unit + build + e2e). Everything must be green.
4. Hand GOAL.md, the check output and a 390×844 screenshot of `/` to a **fresh evaluator subagent**. Check off an item only when the evaluator confirms it passes.
5. Stop after 3 failed attempts on the same item and report the blocker. Stop when every box is checked.
6. Tech constraints: Next.js 15 App Router + TS + Tailwind v4. Storage uses `node:sqlite` (`DATABASE_PATH` env, default `data/app.db`), not an ORM. All icons come from `ICONS` in `lib/assets.ts` (no emoji characters for icons). Claude calls live in `lib/ai.ts` and return canned fixtures when `AI_MOCK=1`.

## 1. Scaffold & assets
- [x] Next.js + Tailwind app builds (`npm run build`)
- [x] 15 Fluent Emoji icons in `public/images/` with MIT license file [unit: assets.test.ts]
- [x] Vitest + Playwright configured; `npm run check` script exists
- [x] Every `<img>` on `/` loads with no 404s [e2e: assets.spec.ts]

## 2. Profile & targets
- [x] `lib/db.ts` creates tables on first use (profile, meal_log, water_log, burned_log, stock_item, planned_meal, grocery_item)
- [x] `lib/targets.ts`: Mifflin-St Jeor BMR × activity factor; tier offsets Cut −500 / Maintain 0 / Bulk +300 kcal; protein 1.6 (cut/maintain) or 2.0 (bulk) g/kg; water 35 ml/kg [unit: targets.test.ts, covers all 3 tiers]
- [x] `/onboarding` collects name, sex, age, height, weight, activity and tier. `/` redirects to it when no profile exists [e2e: onboarding.spec.ts]

## 3. Dashboard UI (matches mockup)
- [x] Header shows date ("Tuesday, 24. Nov"), time-based greeting ("Good afternoon, {name}") with `wave.png`, and an avatar initial
- [x] Banner shows `flame-mascot.png` + "Ready when you are! Log your first meal" when 0 meals are logged
- [x] Today card: gradient card with a ring showing "kcal left", Target / Eaten / Burned rows with icons, a protein bar "x / y g", and "N meals" and "Burned" pills [e2e: dashboard.spec.ts]
- [x] Quick actions: 4 tiles (Log meal, Scan bill, Plan week, Recipes) linking to their pages
- [x] Up next: today's planned meals with slot icon, slot label, name and kcal, plus a "Full week >" link to `/plan`

## 4. Meal logging
- [x] `/log`: search the built-in food DB (`lib/foods.ts`, ≥40 foods, kcal + protein per 100 g), set grams and slot, then save
- [x] Logging a 500 kcal meal reduces kcal-left by exactly 500 and raises Eaten and protein [e2e: log-meal.spec.ts]
- [x] Logged meals can be edited and deleted, and totals update

## 5. Water
- [x] Water card on the dashboard: `water.png`, +250 ml / +500 ml buttons, progress toward the daily goal, undo the last entry [e2e: water.spec.ts]
- [x] Totals are scoped to the local calendar day (a new day starts at 0) [unit]

## 6. Stock & receipt scan
- [x] `/stock`: add, edit and remove pantry items (name, qty, unit)
- [x] Scan bill: upload an image, `scanReceipt()` returns line items, the user confirms, and the items are upserted into stock [e2e with AI_MOCK]

## 7. Plan week + groceries
- [x] `/plan` generates 7 days × 4 slots. Each day's total is within ±10% of the kcal target [unit: plan.test.ts]
- [x] The grocery list is planned ingredients minus stock, grouped and checkable [unit: grocery diff]
- [x] Up next on `/` shows today's remaining planned meals. "Log as eaten" creates a meal_log

## 8. Recipes from stock
- [x] `/recipes` suggests ≥3 recipes. Each one uses ≥70% stock ingredients and shows kcal and protein [e2e with AI_MOCK]
- [x] Each recipe has "Add to plan" and "Log as eaten" buttons

## 9. AI photo logging
- [x] Log meal → photo upload → `analyzeMeal()` returns items with kcal and protein → user edits/confirms → saved [e2e with AI_MOCK]
- [x] Without `ANTHROPIC_API_KEY`, the photo option shows a clear message and manual logging still works

## 10. Polish
- [x] Empty states on every page. No console errors on any route [e2e: smoke.spec.ts visits all routes]
- [x] Mobile layout at 390×844 matches the mockup's structure and spacing. The evaluator compares the screenshot side by side with the mockup
