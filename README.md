idle-guy-life-sim

## Collect Earnings System

### How It Works

The Collect Earnings screen allows players to claim accumulated money based on their hourly income. This system has two main components:

#### 1. Daily Limit
- **Equals your hourly income** (e.g., if hourly income = 1000, daily limit = 1000)
- When you reach the daily limit, an **8-hour lock** activates
- Resets every day at UTC midnight

#### 2. Accumulated Money
- **Maximum accumulation**: Half of your hourly income in 60 minutes
- Example: If hourly income = 1000 → max accumulated = 500 in 60 minutes
- Accumulation rate: (hourly_income / 2) / 60 per minute

### Claiming Money

#### Normal Claim
- Adds accumulated money to your total
- Adds accumulated money to daily claimed total
- Example: 500 accumulated → +500 total money, +500 daily claimed

#### Claim x3 (Ad Reward)
- **Bonus**: Adds 3x accumulated money to your total
- **Important**: Only adds original amount to daily claimed total (this is your reward for watching ads)
- Example: 500 accumulated → +1500 total money, +500 daily claimed

### Daily Limit & Lock System

1. **Tracking**: The system tracks how much you've claimed today in `daily_claimed_total`
2. **Limit Check**: If `daily_claimed_total + accumulated >= hourly_income`, you've reached your limit
3. **8-Hour Lock**: When limit is reached, you must wait 8 hours before claiming again
4. **Daily Reset**: At UTC midnight:
   - `daily_claimed_total` resets to 0
   - `claim_locked_until` clears
   - You can start claiming again

### Example Scenarios

**Scenario 1: Normal Claim**
- Hourly income: 1000
- Accumulated: 500 (60 minutes passed)
- Daily claimed: 0
- Result: +500 total money, daily claimed = 500, no lock

**Scenario 2: x3 Claim (Ad Reward)**
- Hourly income: 1000
- Accumulated: 500
- Daily claimed: 400
- Result: +1500 total money (3x bonus!), daily claimed = 900, no lock

**Scenario 3: Reaching Daily Limit**
- Hourly income: 1000
- Accumulated: 600
- Daily claimed: 600
- Check: 600 + 600 = 1200 >= 1000 (limit reached!)
- Result: +600 total money, daily claimed = 1200, **8-hour lock activated**

**Scenario 4: Partial Claim at Limit**
- Hourly income: 1000
- Accumulated: 500
- Daily claimed: 800
- Remaining: 1000 - 800 = 200
- Result: Only 200 can be claimed, +200 total money, daily claimed = 1000, **8-hour lock activated**

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
