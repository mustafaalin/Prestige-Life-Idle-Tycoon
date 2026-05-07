import type {
  BusinessWithPlayerData,
  Car,
  GameStats,
  InvestmentWithPlayerData,
  Job,
  PlayerJob,
  PlayerOutfit,
  PlayerProfile,
  QuestChapterDefinition,
  QuestDefinition,
  QuestProgress,
} from '../../types/game';
import { LOCAL_HOUSES } from './houses';
import { LOCAL_JOBS } from './jobs';
import { getCarProgressionLevel } from './cars';

export const TOTAL_QUEST_CHAPTERS = 10;

export const QUEST_CHAPTERS: QuestChapterDefinition[] = [
  { id: 'chapter-1',  title: 'Starting Out',      reward_prestige_points: 3,  reward_gems: 3  },
  { id: 'chapter-2',  title: 'Getting Started',   reward_prestige_points: 5,  reward_gems: 5  },
  { id: 'chapter-3',  title: 'Building Momentum', reward_prestige_points: 8,  reward_gems: 8  },
  { id: 'chapter-4',  title: 'Growing Empire',    reward_prestige_points: 12, reward_gems: 10 },
  { id: 'chapter-5',  title: 'Passive Income',    reward_prestige_points: 16, reward_gems: 12 },
  { id: 'chapter-6',  title: 'Style & Commerce',  reward_prestige_points: 22, reward_gems: 15 },
  { id: 'chapter-7',  title: 'Real Estate',       reward_prestige_points: 30, reward_gems: 18 },
  { id: 'chapter-8',  title: 'Industrial Scale',  reward_prestige_points: 40, reward_gems: 20 },
  { id: 'chapter-9',  title: 'Elite Status',      reward_prestige_points: 55, reward_gems: 22 },
  { id: 'chapter-10', title: 'Idle Legend',       reward_prestige_points: 75, reward_gems: 25 },
];

const STATIC_QUESTS_RAW: QuestDefinition[] = [
  {
    id: 'quest-1-start-first-job',
    title: 'Start Your First Job',
    description: 'Get moving and begin your first job.',
    reward_money: 100,
    reward_gems: 0,
    target_screen: 'job',
    condition: { type: 'start_job' },
  },
  {
    id: 'quest-2-claim-daily-reward',
    title: 'Claim Your Daily Reward',
    description: 'Pick up today\'s daily bonus from the shop panel.',
    reward_money: 150,
    reward_gems: 0,
    target_screen: 'shop',
    condition: { type: 'daily_reward_claimed' },
  },
  {
    id: 'quest-3-work-three-minutes',
    title: 'Work 2 Minutes',
    description: 'Spend at least 2 minutes on your first job.',
    reward_money: 250,
    reward_gems: 0,
    target_screen: 'job',
    condition: { type: 'job_time_seconds', jobLevel: 1, seconds: 120 },
  },
  {
    id: 'quest-4-switch-second-job',
    title: 'Move To Job Level 2',
    description: 'Advance into your second job.',
    reward_money: 300,
    reward_gems: 0,
    target_screen: 'job',
    condition: { type: 'active_job_level', level: 2 },
  },
  {
    id: 'quest-5-buy-first-car',
    title: 'Buy Your First Vehicle',
    description: 'Purchase your first vehicle upgrade.',
    reward_money: 400,
    reward_gems: 1,
    target_screen: 'stuff',
    condition: { type: 'owned_car_count', count: 1 },
  },
  {
    id: 'quest-6-upgrade-home-level-2',
    title: 'Move Somewhere Better',
    description: 'Upgrade into a level 2 home.',
    reward_money: 500,
    reward_gems: 0,
    target_screen: 'stuff',
    condition: { type: 'selected_house_level', level: 2 },
  },
  {
    id: 'quest-7-buy-first-outfit',
    title: 'Buy Your First Outfit',
    description: 'Buy Outfit 2 from the shop.',
    reward_money: 500,
    reward_gems: 0,
    target_screen: 'shop',
    condition: { type: 'owned_outfit_count', count: 2 },
  },
  {
    id: 'quest-9-buy-first-business',
    title: 'Buy Your First Business',
    description: 'Start building passive income with a business.',
    reward_money: 750,
    reward_gems: 0,
    target_screen: 'business',
    condition: { type: 'owned_business_count', count: 1 },
  },
  {
    id: 'quest-10-upgrade-first-business',
    title: 'Upgrade A Business',
    description: 'Push one of your businesses to level 2.',
    reward_money: 900,
    reward_gems: 0,
    target_screen: 'business',
    condition: { type: 'business_level_at_least', level: 2 },
  },
  {
    id: 'quest-11-first-claim',
    title: 'Claim Accumulated Money',
    description: 'Use the accumulated money claim once.',
    reward_money: 1000,
    reward_gems: 0,
    target_screen: 'shop',
    condition: { type: 'accumulated_money_claimed_once' },
  },
  {
    id: 'quest-12-switch-third-job',
    title: 'Move To Job Level 3',
    description: 'Advance into your third job.',
    reward_money: 1100,
    reward_gems: 0,
    target_screen: 'job',
    condition: { type: 'active_job_level', level: 3 },
  },
  {
    id: 'quest-13-claim-earnings-two-times',
    title: 'Claim Earnings 2 Times',
    description: 'Use the earnings claim two times in total.',
    reward_money: 0,
    reward_gems: 3,
    target_screen: 'shop',
    condition: { type: 'accumulated_money_claim_count', count: 2 },
  },
  {
    id: 'quest-14-buy-second-business',
    title: 'Buy A Second Business',
    description: 'Expand into your second business.',
    reward_money: 1250,
    reward_gems: 0,
    target_screen: 'business',
    condition: { type: 'owned_business_count', count: 2 },
  },
  {
    id: 'quest-15-upgrade-home-level-3',
    title: 'Move To A Level 3 Home',
    description: 'Upgrade your home again.',
    reward_money: 1400,
    reward_gems: 0,
    target_screen: 'stuff',
    condition: { type: 'selected_house_level', level: 3 },
  },
  {
    id: 'quest-16-buy-second-outfit',
    title: 'Buy Outfit 3',
    description: 'Purchase Outfit 3 from the shop.',
    reward_money: 1500,
    reward_gems: 0,
    target_screen: 'shop',
    condition: { type: 'owned_outfit_count', count: 3 },
  },
  {
    id: 'quest-17-buy-first-investment',
    title: 'Buy Your First Property',
    description: 'Pick up your first real estate investment.',
    reward_money: 1750,
    reward_gems: 2,
    target_screen: 'investments',
    condition: { type: 'owned_investment_count', count: 1 },
  },
  {
    id: 'quest-18-upgrade-first-investment',
    title: 'Upgrade A Property',
    description: 'Apply your first property upgrade.',
    reward_money: 2000,
    reward_gems: 0,
    target_screen: 'investments',
    condition: { type: 'investment_level_at_least', level: 2 },
  },
  {
    id: 'quest-19-switch-fourth-job',
    title: 'Move To Job Level 4',
    description: 'Advance into your fourth job.',
    reward_money: 2200,
    reward_gems: 0,
    target_screen: 'job',
    condition: { type: 'active_job_level', level: 4 },
  },
  {
    id: 'quest-20-make-three-business-upgrades',
    title: 'Make 3 Business Upgrades',
    description: 'Accumulate three total business upgrades.',
    reward_money: 0,
    reward_gems: 5,
    target_screen: 'business',
    condition: { type: 'business_total_upgrade_count', count: 3 },
  },
  {
    id: 'quest-21-buy-third-business',
    title: 'Buy A Third Business',
    description: 'Keep growing your passive income network.',
    reward_money: 2500,
    reward_gems: 0,
    target_screen: 'business',
    condition: { type: 'owned_business_count', count: 3 },
  },
  {
    id: 'quest-22-business-level-3',
    title: 'Push A Business To Level 3',
    description: 'Upgrade one of your businesses to level 3.',
    reward_money: 2750,
    reward_gems: 0,
    target_screen: 'business',
    condition: { type: 'business_level_at_least', level: 3 },
  },
  {
    id: 'quest-23-upgrade-home-level-4',
    title: 'Move To A Level 4 Home',
    description: 'Upgrade to an even better home.',
    reward_money: 3000,
    reward_gems: 0,
    target_screen: 'stuff',
    condition: { type: 'selected_house_level', level: 4 },
  },
  {
    id: 'quest-24-buy-second-car',
    title: 'Buy A Second Vehicle',
    description: 'Upgrade your ride once more.',
    reward_money: 3250,
    reward_gems: 0,
    target_screen: 'stuff',
    condition: { type: 'owned_car_count', count: 2 },
  },
  {
    id: 'quest-25-own-level-four-vehicle',
    title: 'Own A Level 4 Vehicle',
    description: 'Upgrade your garage with a level 4 vehicle or better.',
    reward_money: 0,
    reward_gems: 7,
    target_screen: 'stuff',
    condition: { type: 'owned_car_level_at_least', level: 4 },
  },
  {
    id: 'quest-26-switch-fifth-job',
    title: 'Move To Job Level 5',
    description: 'Advance into your fifth job.',
    reward_money: 3500,
    reward_gems: 0,
    target_screen: 'job',
    condition: { type: 'active_job_level', level: 5 },
  },
  {
    id: 'quest-27-buy-fourth-business',
    title: 'Buy A Fourth Business',
    description: 'Expand your business lineup again.',
    reward_money: 3750,
    reward_gems: 0,
    target_screen: 'business',
    condition: { type: 'owned_business_count', count: 4 },
  },
  {
    id: 'quest-28-buy-second-investment',
    title: 'Own 2 Properties',
    description: 'Purchase a second real estate property.',
    reward_money: 4000,
    reward_gems: 0,
    target_screen: 'investments',
    condition: { type: 'owned_investment_count', count: 2 },
  },
  {
    id: 'quest-29-upgrade-home-level-5',
    title: 'Move To A Level 5 Home',
    description: 'Reach a premium home tier.',
    reward_money: 4250,
    reward_gems: 0,
    target_screen: 'stuff',
    condition: { type: 'selected_house_level', level: 5 },
  },
  {
    id: 'quest-30-two-level-two-properties',
    title: 'Own 2 Level 2 Properties',
    description: 'Get two properties upgraded to level 2 or higher.',
    reward_money: 0,
    reward_gems: 10,
    target_screen: 'investments',
    condition: { type: 'investment_level_at_least_count', level: 2, count: 2 },
  },
  {
    id: 'quest-31-switch-sixth-job',
    title: 'Move To Job Level 6',
    description: 'Advance into your sixth job.',
    reward_money: 4500,
    reward_gems: 0,
    target_screen: 'job',
    condition: { type: 'active_job_level', level: 6 },
  },
  {
    id: 'quest-32-claim-earnings-three-times',
    title: 'Claim Earnings 3 Times',
    description: 'Use the earnings claim three times in total.',
    reward_money: 4750,
    reward_gems: 0,
    target_screen: 'shop',
    condition: { type: 'accumulated_money_claim_count', count: 3 },
  },
  {
    id: 'quest-33-buy-fifth-business',
    title: 'Buy A Fifth Business',
    description: 'Expand into your fifth business.',
    reward_money: 5000,
    reward_gems: 0,
    target_screen: 'business',
    condition: { type: 'owned_business_count', count: 5 },
  },
  {
    id: 'quest-34-business-level-4',
    title: 'Push A Business To Level 4',
    description: 'Upgrade one of your businesses to level 4.',
    reward_money: 5500,
    reward_gems: 0,
    target_screen: 'business',
    condition: { type: 'business_level_at_least', level: 4 },
  },
  {
    id: 'quest-35-buy-third-outfit',
    title: 'Buy Outfit 4',
    description: 'Purchase Outfit 4 from the shop.',
    reward_money: 6000,
    reward_gems: 0,
    target_screen: 'shop',
    condition: { type: 'owned_outfit_count', count: 4 },
  },
  {
    id: 'quest-36-buy-third-investment',
    title: 'Own 3 Properties',
    description: 'Purchase a third real estate property.',
    reward_money: 6500,
    reward_gems: 0,
    target_screen: 'investments',
    condition: { type: 'owned_investment_count', count: 3 },
  },
  {
    id: 'quest-37-investment-level-3',
    title: 'Push A Property To Level 3',
    description: 'Upgrade any property to level 3.',
    reward_money: 7000,
    reward_gems: 0,
    target_screen: 'investments',
    condition: { type: 'investment_level_at_least', level: 3 },
  },
  {
    id: 'quest-38-two-level-four-businesses',
    title: 'Own 2 Level 4 Businesses',
    description: 'Have two businesses at level 4 or higher.',
    reward_money: 0,
    reward_gems: 12,
    target_screen: 'business',
    condition: { type: 'business_level_at_least_count', level: 4, count: 2 },
  },
  {
    id: 'quest-39-buy-third-car',
    title: 'Buy A Third Vehicle',
    description: 'Expand your garage with another vehicle.',
    reward_money: 8000,
    reward_gems: 0,
    target_screen: 'stuff',
    condition: { type: 'owned_car_count', count: 3 },
  },
  {
    id: 'quest-40-upgrade-home-level-6',
    title: 'Move To A Level 6 Home',
    description: 'Reach the next premium home tier.',
    reward_money: 9000,
    reward_gems: 0,
    target_screen: 'stuff',
    condition: { type: 'selected_house_level', level: 6 },
  },
  {
    id: 'quest-41-switch-seventh-job',
    title: 'Move To Job Level 7',
    description: 'Advance into your seventh job.',
    reward_money: 10000,
    reward_gems: 0,
    target_screen: 'job',
    condition: { type: 'active_job_level', level: 7 },
  },
  {
    id: 'quest-42-buy-sixth-business',
    title: 'Buy A Sixth Business',
    description: 'Expand into your sixth business.',
    reward_money: 11000,
    reward_gems: 0,
    target_screen: 'business',
    condition: { type: 'owned_business_count', count: 6 },
  },
  {
    id: 'quest-44-total-five-business-upgrades',
    title: 'Make 5 Business Upgrades',
    description: 'Accumulate five total business upgrades.',
    reward_money: 13000,
    reward_gems: 0,
    target_screen: 'business',
    condition: { type: 'business_total_upgrade_count', count: 5 },
  },
  {
    id: 'quest-45-buy-fourth-investment',
    title: 'Own 4 Properties',
    description: 'Purchase a fourth real estate property.',
    reward_money: 14500,
    reward_gems: 0,
    target_screen: 'investments',
    condition: { type: 'owned_investment_count', count: 4 },
  },
  {
    id: 'quest-46-investment-level-4',
    title: 'Push A Property To Level 4',
    description: 'Upgrade any property to level 4.',
    reward_money: 16000,
    reward_gems: 0,
    target_screen: 'investments',
    condition: { type: 'investment_level_at_least', level: 4 },
  },
  {
    id: 'quest-47-make-six-property-upgrades',
    title: 'Make 6 Property Upgrades',
    description: 'Accumulate six total property upgrades.',
    reward_money: 0,
    reward_gems: 14,
    target_screen: 'investments',
    condition: { type: 'investment_total_upgrade_count', count: 6 },
  },
  {
    id: 'quest-48-buy-fourth-outfit',
    title: 'Buy Outfit 5',
    description: 'Purchase Outfit 5 from the shop.',
    reward_money: 18000,
    reward_gems: 0,
    target_screen: 'shop',
    condition: { type: 'owned_outfit_count', count: 5 },
  },
  {
    id: 'quest-49-buy-fourth-car',
    title: 'Buy A Fourth Vehicle',
    description: 'Add another vehicle to your collection.',
    reward_money: 20000,
    reward_gems: 0,
    target_screen: 'stuff',
    condition: { type: 'owned_car_count', count: 4 },
  },
  {
    id: 'quest-50-upgrade-home-level-7',
    title: 'Move To A Level 7 Home',
    description: 'Reach the next luxury home tier.',
    reward_money: 22000,
    reward_gems: 0,
    target_screen: 'stuff',
    condition: { type: 'selected_house_level', level: 7 },
  },
  {
    id: 'quest-51-switch-eighth-job',
    title: 'Move To Job Level 8',
    description: 'Advance into your eighth job.',
    reward_money: 24000,
    reward_gems: 0,
    target_screen: 'job',
    condition: { type: 'active_job_level', level: 8 },
  },
  {
    id: 'quest-52-buy-sixth-investment',
    title: 'Own 6 Properties',
    description: 'Purchase six real estate properties in total.',
    reward_money: 26000,
    reward_gems: 0,
    target_screen: 'investments',
    condition: { type: 'owned_investment_count', count: 6 },
  },
  {
    id: 'quest-53-buy-seventh-business',
    title: 'Buy A Seventh Business',
    description: 'Expand into your seventh business.',
    reward_money: 28000,
    reward_gems: 0,
    target_screen: 'business',
    condition: { type: 'owned_business_count', count: 7 },
  },
  {
    id: 'quest-54-max-one-business',
    title: 'Max Out A Business',
    description: 'Upgrade one business to its max level.',
    reward_money: 32000,
    reward_gems: 0,
    target_screen: 'business',
    condition: { type: 'business_level_at_least', level: 6 },
  },
  {
    id: 'quest-55-luxury-home-band',
    title: 'Move Into Luxury Housing',
    description: 'Reach a clearly luxury home tier.',
    reward_money: 36000,
    reward_gems: 0,
    target_screen: 'stuff',
    condition: { type: 'selected_house_level', level: 8 },
  },
  {
    id: 'quest-57-buy-fifth-outfit',
    title: 'Buy Outfit 6',
    description: 'Purchase Outfit 6 from the shop.',
    reward_money: 40000,
    reward_gems: 0,
    target_screen: 'shop',
    condition: { type: 'owned_outfit_count', count: 6 },
  },
  {
    id: 'quest-59-daily-streak-seven',
    title: 'Reach A 7 Day Streak',
    description: 'Build your daily reward streak to 7.',
    reward_money: 50000,
    reward_gems: 0,
    target_screen: 'shop',
    condition: { type: 'daily_streak_at_least', count: 7 },
  },
  {
    id: 'quest-60-buy-fifth-car',
    title: 'Buy A Fifth Vehicle',
    description: 'Add a fifth vehicle to your collection.',
    reward_money: 55000,
    reward_gems: 0,
    target_screen: 'stuff',
    condition: { type: 'owned_car_count', count: 5 },
  },
  {
    id: 'quest-61-switch-ninth-job',
    title: 'Move To Job Level 9',
    description: 'Advance into your ninth job.',
    reward_money: 60000,
    reward_gems: 0,
    target_screen: 'job',
    condition: { type: 'active_job_level', level: 9 },
  },
  {
    id: 'quest-62-buy-eight-investments',
    title: 'Own 8 Properties',
    description: 'Purchase eight real estate properties in total.',
    reward_money: 65000,
    reward_gems: 0,
    target_screen: 'investments',
    condition: { type: 'owned_investment_count', count: 8 },
  },
  {
    id: 'quest-63-buy-eighth-business',
    title: 'Buy An Eighth Business',
    description: 'Expand into your eighth business.',
    reward_money: 70000,
    reward_gems: 0,
    target_screen: 'business',
    condition: { type: 'owned_business_count', count: 8 },
  },
  {
    id: 'quest-64-make-ten-business-upgrades',
    title: 'Make 10 Business Upgrades',
    description: 'Accumulate ten total business upgrades.',
    reward_money: 0,
    reward_gems: 18,
    target_screen: 'business',
    condition: { type: 'business_total_upgrade_count', count: 10 },
  },
  {
    id: 'quest-65-full-upgrade-one-property',
    title: 'Fully Upgrade A Property',
    description: 'Finish all upgrades on one property.',
    reward_money: 80000,
    reward_gems: 0,
    target_screen: 'investments',
    condition: { type: 'full_upgraded_property_count', count: 1 },
  },
  {
    id: 'quest-66-two-properties-level-3',
    title: 'Own 2 Level 3 Properties',
    description: 'Have two properties at level 3 or higher.',
    reward_money: 90000,
    reward_gems: 0,
    target_screen: 'investments',
    condition: { type: 'investment_level_at_least_count', level: 3, count: 2 },
  },
  {
    id: 'quest-68-buy-sixth-outfit',
    title: 'Buy Outfit 7',
    description: 'Purchase Outfit 7 from the shop.',
    reward_money: 110000,
    reward_gems: 0,
    target_screen: 'shop',
    condition: { type: 'owned_outfit_count', count: 7 },
  },
  {
    id: 'quest-69-claim-earnings-five-times',
    title: 'Claim Earnings 5 Times',
    description: 'Use the earnings claim five times in total.',
    reward_money: 120000,
    reward_gems: 0,
    target_screen: 'shop',
    condition: { type: 'accumulated_money_claim_count', count: 5 },
  },
  {
    id: 'quest-70-buy-sixth-car',
    title: 'Buy A Sixth Vehicle',
    description: 'Add a sixth vehicle to your collection.',
    reward_money: 130000,
    reward_gems: 0,
    target_screen: 'stuff',
    condition: { type: 'owned_car_count', count: 6 },
  },
  {
    id: 'quest-71-switch-tenth-job',
    title: 'Move To Job Level 10',
    description: 'Advance into your tenth job.',
    reward_money: 140000,
    reward_gems: 0,
    target_screen: 'job',
    condition: { type: 'active_job_level', level: 10 },
  },
  {
    id: 'quest-72-buy-ten-investments',
    title: 'Own 10 Properties',
    description: 'Purchase ten real estate properties in total.',
    reward_money: 155000,
    reward_gems: 0,
    target_screen: 'investments',
    condition: { type: 'owned_investment_count', count: 10 },
  },
  {
    id: 'quest-73-buy-ninth-business',
    title: 'Buy A Ninth Business',
    description: 'Expand into your ninth business.',
    reward_money: 170000,
    reward_gems: 0,
    target_screen: 'business',
    condition: { type: 'owned_business_count', count: 9 },
  },
  {
    id: 'quest-75-three-businesses-level-4',
    title: 'Own 3 Level 4 Businesses',
    description: 'Have three businesses at level 4 or higher.',
    reward_money: 190000,
    reward_gems: 0,
    target_screen: 'business',
    condition: { type: 'business_level_at_least_count', level: 4, count: 3 },
  },
  {
    id: 'quest-76-two-full-properties',
    title: 'Fully Upgrade 2 Properties',
    description: 'Finish all upgrades on two properties.',
    reward_money: 210000,
    reward_gems: 0,
    target_screen: 'investments',
    condition: { type: 'full_upgraded_property_count', count: 2 },
  },
  {
    id: 'quest-77-upgrade-home-level-9',
    title: 'Move To A Level 9 Home',
    description: 'Reach a top-tier home level.',
    reward_money: 230000,
    reward_gems: 0,
    target_screen: 'stuff',
    condition: { type: 'selected_house_level', level: 9 },
  },
  {
    id: 'quest-78-buy-seventh-outfit',
    title: 'Buy Outfit 8',
    description: 'Purchase Outfit 8 from the shop.',
    reward_money: 250000,
    reward_gems: 0,
    target_screen: 'shop',
    condition: { type: 'owned_outfit_count', count: 8 },
  },
  {
    id: 'quest-79-buy-seventh-car',
    title: 'Buy A Seventh Vehicle',
    description: 'Add a seventh vehicle to your collection.',
    reward_money: 275000,
    reward_gems: 0,
    target_screen: 'stuff',
    condition: { type: 'owned_car_count', count: 7 },
  },
  {
    id: 'quest-80-daily-streak-fifteen',
    title: 'Reach A 15 Day Streak',
    description: 'Build your daily reward streak to 15.',
    reward_money: 300000,
    reward_gems: 0,
    target_screen: 'shop',
    condition: { type: 'daily_streak_at_least', count: 15 },
  },
  {
    id: 'quest-81-switch-eleventh-job',
    title: 'Move To Job Level 11',
    description: 'Advance into your eleventh job.',
    reward_money: 325000,
    reward_gems: 0,
    target_screen: 'job',
    condition: { type: 'active_job_level', level: 11 },
  },
  {
    id: 'quest-82-buy-twelve-investments',
    title: 'Own 12 Properties',
    description: 'Purchase twelve real estate properties in total.',
    reward_money: 350000,
    reward_gems: 0,
    target_screen: 'investments',
    condition: { type: 'owned_investment_count', count: 12 },
  },
  {
    id: 'quest-83-buy-tenth-business',
    title: 'Buy A Tenth Business',
    description: 'Expand into your tenth business.',
    reward_money: 375000,
    reward_gems: 0,
    target_screen: 'business',
    condition: { type: 'owned_business_count', count: 10 },
  },
  {
    id: 'quest-84-four-level-four-businesses',
    title: 'Own 4 Level 4 Businesses',
    description: 'Have four businesses at level 4 or higher.',
    reward_money: 0,
    reward_gems: 22,
    target_screen: 'business',
    condition: { type: 'business_level_at_least_count', level: 4, count: 4 },
  },
  {
    id: 'quest-86-three-full-properties',
    title: 'Fully Upgrade 3 Properties',
    description: 'Finish all upgrades on three properties.',
    reward_money: 475000,
    reward_gems: 0,
    target_screen: 'investments',
    condition: { type: 'full_upgraded_property_count', count: 3 },
  },
  {
    id: 'quest-87-upgrade-home-level-10',
    title: 'Move To A Level 10 Home',
    description: 'Reach level 10 housing or higher.',
    reward_money: 525000,
    reward_gems: 0,
    target_screen: 'stuff',
    condition: { type: 'selected_house_level', level: 10 },
  },
  {
    id: 'quest-88-buy-eighth-outfit',
    title: 'Buy Outfit 9',
    description: 'Purchase Outfit 9 from the shop.',
    reward_money: 575000,
    reward_gems: 0,
    target_screen: 'shop',
    condition: { type: 'owned_outfit_count', count: 9 },
  },
  {
    id: 'quest-89-buy-eighth-car',
    title: 'Buy An Eighth Vehicle',
    description: 'Reach eight owned vehicles in total.',
    reward_money: 650000,
    reward_gems: 0,
    target_screen: 'stuff',
    condition: { type: 'owned_car_count', count: 8 },
  },
  {
    id: 'quest-90-investment-income-100k',
    title: 'Reach 20K Rental Income',
    description: 'Push your total rental income to at least 20K per hour.',
    reward_money: 725000,
    reward_gems: 0,
    target_screen: 'investments',
    condition: { type: 'investment_income_at_least', amount: 20000 },
  },
  {
    id: 'quest-91-switch-twelfth-job',
    title: 'Move To Job Level 12',
    description: 'Advance into your twelfth job.',
    reward_money: 800000,
    reward_gems: 0,
    target_screen: 'job',
    condition: { type: 'active_job_level', level: 12 },
  },
  {
    id: 'quest-92-buy-fifteen-investments',
    title: 'Own 15 Properties',
    description: 'Purchase fifteen real estate properties in total.',
    reward_money: 900000,
    reward_gems: 0,
    target_screen: 'investments',
    condition: { type: 'owned_investment_count', count: 15 },
  },
  {
    id: 'quest-93-own-twelve-businesses',
    title: 'Own 12 Businesses',
    description: 'Reach twelve owned businesses in total.',
    reward_money: 1000000,
    reward_gems: 0,
    target_screen: 'business',
    condition: { type: 'owned_business_count', count: 12 },
  },
  {
    id: 'quest-95-own-ten-cars',
    title: 'Own 10 Vehicles',
    description: 'Reach ten owned vehicles in total.',
    reward_money: 1150000,
    reward_gems: 0,
    target_screen: 'stuff',
    condition: { type: 'owned_car_count', count: 10 },
  },
  {
    id: 'quest-96-own-ten-outfits',
    title: 'Buy Outfit 10',
    description: 'Purchase Outfit 10 from the shop.',
    reward_money: 1300000,
    reward_gems: 0,
    target_screen: 'shop',
    condition: { type: 'owned_outfit_count', count: 10 },
  },
  {
    id: 'quest-97-five-full-properties',
    title: 'Fully Upgrade 5 Properties',
    description: 'Finish all upgrades on five properties.',
    reward_money: 1450000,
    reward_gems: 0,
    target_screen: 'investments',
    condition: { type: 'full_upgraded_property_count', count: 5 },
  },
  {
    id: 'quest-98-upgrade-home-level-12',
    title: 'Move To A Level 12 Home',
    description: 'Reach a very high-tier home band.',
    reward_money: 1600000,
    reward_gems: 0,
    target_screen: 'stuff',
    condition: { type: 'selected_house_level', level: 12 },
  },
  {
    id: 'quest-100-idle-guy-elite',
    title: 'Become Idle Guy Elite',
    description: 'Own 20 real estate properties and reach elite status.',
    reward_money: 2000000,
    reward_gems: 50,
    target_screen: 'investments',
    condition: { type: 'owned_investment_count', count: 20 },
  },
];

const LEGACY_ACTIVE_JOB_QUEST_IDS = new Set(
  STATIC_QUESTS_RAW.filter((quest) => quest.condition.type === 'active_job_level').map((quest) => quest.id)
);

// Explicit chapter assignment for every static quest.
// Chapter indices: 0=Starting Out, 1=Getting Started, 2=Building Momentum,
// 3=Growing Empire, 4=Passive Income, 5=Style & Commerce,
// 6=Real Estate, 7=Industrial Scale, 8=Elite Status, 9=Idle Legend
const STATIC_QUEST_CHAPTER_OVERRIDES: Partial<Record<string, number>> = {
  // Chapter 0 — Starting Out (8 quests)
  'quest-1-start-first-job':           0,
  'quest-2-claim-daily-reward':        0,
  'quest-3-work-three-minutes':        0,
  'quest-5-buy-first-car':             0,
  'quest-6-upgrade-home-level-2':      0,
  'quest-7-buy-first-outfit':          0,
  'quest-9-buy-first-business':        0,
  'quest-11-first-claim':              0,
  // Chapter 1 — Getting Started (8 quests)
  'quest-10-upgrade-first-business':   1,
  'quest-13-claim-earnings-two-times': 1,
  'quest-14-buy-second-business':      1,
  'quest-15-upgrade-home-level-3':     1,
  'quest-16-buy-second-outfit':        1,
  'quest-17-buy-first-investment':     1,
  'quest-18-upgrade-first-investment': 1,
  'quest-28-buy-second-investment':    1,
  // Chapter 2 — Building Momentum (8 quests)
  'quest-20-make-three-business-upgrades': 2,
  'quest-21-buy-third-business':       2,
  'quest-22-business-level-3':         2,
  'quest-23-upgrade-home-level-4':     2,
  'quest-24-buy-second-car':           2,
  'quest-25-own-level-four-vehicle':   2,
  'quest-37-investment-level-3':       2,
  'quest-46-investment-level-4':       2,
  // Chapter 3 — Growing Empire (8 quests)
  'quest-27-buy-fourth-business':      3,
  'quest-29-upgrade-home-level-5':     3,
  'quest-30-two-level-two-properties': 3,
  'quest-32-claim-earnings-three-times': 3,
  'quest-33-buy-fifth-business':       3,
  'quest-34-business-level-4':         3,
  'quest-35-buy-third-outfit':         3,
  'quest-36-buy-third-investment':     3,
  // Chapter 4 — Passive Income (7 quests)
  'quest-38-two-level-four-businesses': 4,
  'quest-39-buy-third-car':            4,
  'quest-40-upgrade-home-level-6':     4,
  'quest-42-buy-sixth-business':       4,
  'quest-44-total-five-business-upgrades': 4,
  'quest-45-buy-fourth-investment':    4,
  'quest-47-make-six-property-upgrades': 4,
  // Chapter 5 — Style & Commerce (8 quests)
  'quest-48-buy-fourth-outfit':        5,
  'quest-49-buy-fourth-car':           5,
  'quest-50-upgrade-home-level-7':     5,
  'quest-52-buy-sixth-investment':     5,
  'quest-53-buy-seventh-business':     5,
  'quest-54-max-one-business':         5,
  'quest-55-luxury-home-band':         5,
  'quest-57-buy-fifth-outfit':         5,
  // Chapter 6 — Real Estate (9 quests)
  'quest-59-daily-streak-seven':       6,
  'quest-60-buy-fifth-car':            6,
  'quest-62-buy-eight-investments':    6,
  'quest-63-buy-eighth-business':      6,
  'quest-64-make-ten-business-upgrades': 6,
  'quest-65-full-upgrade-one-property': 6,
  'quest-66-two-properties-level-3':   6,
  'quest-68-buy-sixth-outfit':         6,
  'quest-69-claim-earnings-five-times': 6,
  // Chapter 7 — Industrial Scale (8 quests)
  'quest-70-buy-sixth-car':            7,
  'quest-72-buy-ten-investments':      7,
  'quest-73-buy-ninth-business':       7,
  'quest-75-three-businesses-level-4': 7,
  'quest-76-two-full-properties':      7,
  'quest-77-upgrade-home-level-9':     7,
  'quest-78-buy-seventh-outfit':       7,
  'quest-79-buy-seventh-car':          7,
  // Chapter 8 — Elite Status (9 quests)
  'quest-80-daily-streak-fifteen':     8,
  'quest-82-buy-twelve-investments':   8,
  'quest-83-buy-tenth-business':       8,
  'quest-84-four-level-four-businesses': 8,
  'quest-86-three-full-properties':    8,
  'quest-87-upgrade-home-level-10':    8,
  'quest-88-buy-eighth-outfit':        8,
  'quest-89-buy-eighth-car':           8,
  'quest-90-investment-income-100k':   8,
  // Chapter 9 — Idle Legend (7 quests)
  'quest-92-buy-fifteen-investments':  9,
  'quest-93-own-twelve-businesses':    9,
  'quest-95-own-ten-cars':             9,
  'quest-96-own-ten-outfits':          9,
  'quest-97-five-full-properties':     9,
  'quest-98-upgrade-home-level-12':    9,
  'quest-100-idle-guy-elite':          9,
};

const MAX_JOB_LEVEL = LOCAL_JOBS.reduce((maxLevel, job) => Math.max(maxLevel, Number(job.level || 0)), 0);

function getJobQuestChapterIndex(level: number) {
  if (level <= 9) {
    return Math.floor((level - 1) / 3);
  }

  const earlyJobLevels = 9;
  const remainingChapterCount = Math.max(1, TOTAL_QUEST_CHAPTERS - 3);
  const remainingLevels = Math.max(0, MAX_JOB_LEVEL - earlyJobLevels);
  const baseLevelsPerChapter = Math.floor(remainingLevels / remainingChapterCount);
  const remainderLevels = remainingLevels % remainingChapterCount;

  let threshold = earlyJobLevels + 1;
  for (let chapterOffset = 0; chapterOffset < remainingChapterCount; chapterOffset += 1) {
    const chapterSize = baseLevelsPerChapter + (chapterOffset < remainderLevels ? 1 : 0);
    const endLevel = threshold + chapterSize - 1;
    if (level <= endLevel) {
      return 3 + chapterOffset;
    }
    threshold = endLevel + 1;
  }

  return TOTAL_QUEST_CHAPTERS - 1;
}

function getJobQuestRewardMoney(level: number) {
  return 300 + level * 350 + Math.floor(level / 5) * 250;
}

const GENERATED_JOB_LEVEL_QUESTS: QuestDefinition[] = Array.from({ length: MAX_JOB_LEVEL - 1 }, (_, index) => {
  const level = index + 2;

  return {
    id: `quest-job-level-${level}`,
    title: `Move To Job Level ${level}`,
    description: `Advance into job level ${level}.`,
    reward_money: getJobQuestRewardMoney(level),
    reward_gems: 0,
    target_screen: 'job',
    condition: { type: 'active_job_level', level },
  };
});

interface QuestCatalogEntry {
  quest: QuestDefinition;
  chapterIndex: number;
  chapterOrder: number;
}

const STATIC_QUEST_ENTRIES: QuestCatalogEntry[] = STATIC_QUESTS_RAW
  .map((quest, index) => ({
    quest,
    chapterIndex: STATIC_QUEST_CHAPTER_OVERRIDES[quest.id] ?? 0,
    chapterOrder: index,
  }))
  .filter((entry) => !LEGACY_ACTIVE_JOB_QUEST_IDS.has(entry.quest.id));

const GENERATED_JOB_QUEST_ENTRIES: QuestCatalogEntry[] = GENERATED_JOB_LEVEL_QUESTS.map((quest, index) => ({
  quest,
  chapterIndex: getJobQuestChapterIndex(index + 2),
  chapterOrder: 10_000 + index,
}));

const QUEST_CATALOG: QuestCatalogEntry[] = [...STATIC_QUEST_ENTRIES, ...GENERATED_JOB_QUEST_ENTRIES].sort(
  (left, right) => left.chapterIndex - right.chapterIndex || left.chapterOrder - right.chapterOrder
);

export const LOCAL_QUESTS: QuestDefinition[] = QUEST_CATALOG.map((entry) => entry.quest);

const QUEST_ID_TO_CHAPTER_INDEX = new Map(
  QUEST_CATALOG.map((entry) => [entry.quest.id, entry.chapterIndex] as const)
);

export function createInitialQuestProgress(): QuestProgress {
  return {
    unlockedChapterIndex: 0,
    completedQuestIds: [],
    claimedQuestIds: [],
    claimableQuestIds: [],
    claimableChapterRewardId: null,
    claimedChapterRewardIds: [],
    totalClaimedMoney: 0,
    totalClaimedGems: 0,
    accumulatedMoneyClaimCount: 0,
  };
}

export function normalizeQuestProgress(progress: QuestProgress | null | undefined): QuestProgress {
  if (!progress) {
    return createInitialQuestProgress();
  }

  const legacyClaimableQuestIds =
    (progress as QuestProgress & { claimableQuestId?: string | null }).claimableQuestId
      ? [(progress as QuestProgress & { claimableQuestId?: string | null }).claimableQuestId as string]
      : [];

  return {
    ...createInitialQuestProgress(),
    ...progress,
    unlockedChapterIndex:
      typeof progress.unlockedChapterIndex === 'number'
        ? progress.unlockedChapterIndex
        : 0,
    claimedQuestIds: progress.claimedQuestIds ?? progress.completedQuestIds ?? [],
    claimableQuestIds: progress.claimableQuestIds ?? legacyClaimableQuestIds,
    claimableChapterRewardId: progress.claimableChapterRewardId ?? null,
    claimedChapterRewardIds: progress.claimedChapterRewardIds ?? [],
  };
}

interface QuestSnapshot {
  profile: PlayerProfile;
  questProgress: QuestProgress;
  gameStats: GameStats | null;
  cars: Car[];
  jobs: Job[];
  playerJobs: PlayerJob[];
  unsavedJobWorkSeconds: number;
  ownedCars: string[];
  playerOutfits: PlayerOutfit[];
  businesses: BusinessWithPlayerData[];
  investments: InvestmentWithPlayerData[];
}

export function getQuestByIndex(index: number): QuestDefinition | null {
  return LOCAL_QUESTS[index] || null;
}

export function getQuestChapterIndexByQuestIndex(index: number) {
  const quest = LOCAL_QUESTS[index];
  return quest ? QUEST_ID_TO_CHAPTER_INDEX.get(quest.id) ?? -1 : -1;
}

export function getQuestChapterIndex(questId: string) {
  const questIndex = LOCAL_QUESTS.findIndex((quest) => quest.id === questId);
  return questIndex >= 0 ? getQuestChapterIndexByQuestIndex(questIndex) : -1;
}

export function getQuestsForChapter(chapterIndex: number) {
  return QUEST_CATALOG
    .filter((entry) => entry.chapterIndex === chapterIndex)
    .map((entry) => entry.quest);
}

export function getQuestChapterByIndex(chapterIndex: number) {
  return QUEST_CHAPTERS[chapterIndex] || null;
}

export function calculatePrestigeFromQuestProgress(progress: QuestProgress): number {
  const claimedQuestPrestige = new Set(progress.claimedQuestIds).size;
  const chapterPrestige = QUEST_CHAPTERS.filter((chapter) =>
    progress.claimedChapterRewardIds.includes(chapter.id)
  ).reduce((sum, chapter) => sum + Number(chapter.reward_prestige_points || 0), 0);

  return claimedQuestPrestige + chapterPrestige;
}

export function isQuestCompleted(quest: QuestDefinition, snapshot: QuestSnapshot): boolean {
  switch (quest.condition.type) {
    case 'start_job':
      return snapshot.playerJobs.some((job) => job.is_active || job.is_completed || job.total_time_worked_seconds > 0);
    case 'daily_reward_claimed':
      return Boolean(snapshot.gameStats?.last_claim_date);
    case 'job_time_seconds': {
      const condition = quest.condition;
      const targetJob = snapshot.jobs.find((job) => job.level === condition.jobLevel);
      if (!targetJob) return false;
      const totalWorked = snapshot.playerJobs
        .filter((job) => job.job_id === targetJob.id)
        .reduce((sum, job) => sum + Number(job.total_time_worked_seconds || 0), 0);
      const activeUnsavedSeconds = snapshot.playerJobs.some(
        (job) => job.job_id === targetJob.id && job.is_active
      )
        ? snapshot.unsavedJobWorkSeconds
        : 0;
      return totalWorked + activeUnsavedSeconds >= condition.seconds;
    }
    case 'active_job_level': {
      const condition = quest.condition;
      const activeJobId = snapshot.profile.current_job_id;
      const activeJob = snapshot.jobs.find((job) => job.id === activeJobId);
      return Number(activeJob?.level || 0) >= condition.level;
    }
    case 'owned_car_count':
      return snapshot.ownedCars.length >= quest.condition.count;
    case 'owned_car_level_at_least': {
      const ownedMaxCarLevel = snapshot.cars
        .filter((car) => snapshot.ownedCars.includes(car.id))
        .reduce((maxLevel, car) => Math.max(maxLevel, getCarProgressionLevel(car)), 0);
      return ownedMaxCarLevel >= quest.condition.level;
    }
    case 'selected_house_level': {
      const condition = quest.condition;
      const selectedHouse = LOCAL_HOUSES.find((house) => house.id === snapshot.profile.selected_house_id);
      return Number(selectedHouse?.level || 0) >= condition.level;
    }
    case 'owned_outfit_count':
      return snapshot.playerOutfits.filter((outfit) => outfit.is_owned).length >= quest.condition.count;
    case 'prestige_at_least':
      return Number(snapshot.profile.prestige_points || 0) >= quest.condition.amount;
    case 'owned_business_count':
      return snapshot.businesses.filter((business) => business.is_owned).length >= quest.condition.count;
    case 'business_level_at_least': {
      const condition = quest.condition;
      return snapshot.businesses.some((business) => Number(business.current_level || 0) >= condition.level);
    }
    case 'business_level_at_least_count': {
      const condition = quest.condition;
      return (
        snapshot.businesses.filter((business) => Number(business.current_level || 0) >= condition.level)
          .length >= condition.count
      );
    }
    case 'business_total_upgrade_count':
      return (
        snapshot.businesses.reduce(
          (sum, business) => sum + Math.max(0, Number(business.current_level || 1) - 1),
          0
        ) >= quest.condition.count
      );
    case 'accumulated_money_claimed_once':
      return snapshot.questProgress.accumulatedMoneyClaimCount > 0;
    case 'accumulated_money_claim_count':
      return snapshot.questProgress.accumulatedMoneyClaimCount >= quest.condition.count;
    case 'claimed_quest_count':
      return snapshot.questProgress.claimedQuestIds.length >= quest.condition.count;
    case 'daily_streak_at_least':
      return Number(snapshot.gameStats?.daily_login_streak || 0) >= quest.condition.count;
    case 'owned_investment_count':
      return snapshot.investments.filter((investment) => investment.is_owned).length >= quest.condition.count;
    case 'investment_level_at_least': {
      const condition = quest.condition;
      return snapshot.investments.some((investment) => Number(investment.current_level || 0) >= condition.level);
    }
    case 'investment_level_at_least_count': {
      const condition = quest.condition;
      return (
        snapshot.investments.filter((investment) => Number(investment.current_level || 0) >= condition.level)
          .length >= condition.count
      );
    }
    case 'investment_total_upgrade_count':
      return (
        snapshot.investments.reduce(
          (sum, investment) => sum + Math.max(0, Number(investment.current_level || 1) - 1),
          0
        ) >= quest.condition.count
      );
    case 'full_upgraded_property_count':
      return (
        snapshot.investments.filter((investment) => Number(investment.current_level || 0) >= 6).length >=
        quest.condition.count
      );
    case 'investment_income_at_least':
      return Number(snapshot.profile.investment_income || 0) >= quest.condition.amount;
    default:
      return false;
  }
}
