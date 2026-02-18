idle-guy-life-sim

## Prestige Points System

### Prestige Calculation Rules

Only the currently selected/active items contribute to prestige for these categories:

- **Car**: Add prestige points only from the selected car (`selected_car_id` → `cars.prestige_points`). Do NOT sum all owned cars.
- **House**: Add prestige points only from the currently occupied/selected house (`selected_house_id` → `houses.prestige_points`). Do NOT sum all owned houses.
- **Outfit**: Add prestige points only from the selected/active outfit (`selected_outfit_id` → `character_outfits.prestige_points`). Do NOT sum all unlocked outfits.
- **Job**: Add prestige points only from the active job (`current_job_id` or `player_jobs.is_active = true` → `jobs.prestige_points`). Do NOT sum all owned/unlocked jobs.

### Businesses are different (sum all owned)

- **Businesses**: Sum prestige points for ALL owned businesses.
  - For each owned business, take its prestige based on its current level:
    `player_businesses.current_level` → `business_prestige_points.level{level}_points`
  - Then sum across all owned businesses.

### Formula

```
prestige_total =
  selected_car_prestige
+ selected_house_prestige
+ selected_outfit_prestige
+ selected_job_prestige
+ SUM(owned_business_prestige_by_level)
```
