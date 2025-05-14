// Football positions
export const OFFENSE_POSITIONS = [
  { value: "qb", label: "Quarterback (QB)" },
  { value: "rb", label: "Running Back (RB)" },
  { value: "fb", label: "Fullback (FB)" },
  { value: "wr", label: "Wide Receiver (WR)" },
  { value: "te", label: "Tight End (TE)" },
  { value: "lt", label: "Left Tackle (LT)" },
  { value: "lg", label: "Left Guard (LG)" },
  { value: "c", label: "Center (C)" },
  { value: "rg", label: "Right Guard (RG)" },
  { value: "rt", label: "Right Tackle (RT)" },
];

export const DEFENSE_POSITIONS = [
  { value: "de", label: "Defensive End (DE)" },
  { value: "dt", label: "Defensive Tackle (DT)" },
  { value: "nt", label: "Nose Tackle (NT)" },
  { value: "olb", label: "Outside Linebacker (OLB)" },
  { value: "mlb", label: "Middle Linebacker (MLB)" },
  { value: "ilb", label: "Inside Linebacker (ILB)" },
  { value: "cb", label: "Cornerback (CB)" },
  { value: "fs", label: "Free Safety (FS)" },
  { value: "ss", label: "Strong Safety (SS)" },
  { value: "db", label: "Defensive Back (DB)" },
];

export const SPECIAL_TEAMS_POSITIONS = [
  { value: "k", label: "Kicker (K)" },
  { value: "p", label: "Punter (P)" },
  { value: "ls", label: "Long Snapper (LS)" },
  { value: "kr", label: "Kick Returner (KR)" },
  { value: "pr", label: "Punt Returner (PR)" },
];

// Combined positions list for selection dropdowns
export const POSITIONS = [
  ...OFFENSE_POSITIONS,
  ...DEFENSE_POSITIONS,
  ...SPECIAL_TEAMS_POSITIONS,
];

// Simple string list of football positions for filtering
export const footballPositions = [
  "Quarterback (QB)",
  "Running Back (RB)",
  "Fullback (FB)",
  "Wide Receiver (WR)",
  "Tight End (TE)",
  "Offensive Line (OL)",
  "Defensive Line (DL)",
  "Linebacker (LB)",
  "Cornerback (CB)",
  "Safety (S)",
  "Kicker (K)",
  "Punter (P)",
  "Long Snapper (LS)",
];

// Competition levels
export const COMPETITION_LEVELS = [
  { value: "varsity", label: "Varsity" },
  { value: "jv", label: "Junior Varsity" },
  { value: "freshman", label: "Freshman" },
  { value: "club", label: "Club" },
];

// Team levels (alias for COMPETITION_LEVELS for backwards compatibility)
export const TEAM_LEVELS = COMPETITION_LEVELS;

// High school graduation years (current year + 5 years)
const currentYear = new Date().getFullYear();
export const GRADUATION_YEARS = Array.from({ length: 6 }, (_, i) => {
  const year = currentYear + i;
  return { value: year.toString(), label: year.toString() };
});

// Recruiting related
export const DIVISION_OPTIONS = [
  { value: "d1fbs", label: "NCAA Division I FBS" },
  { value: "d1fcs", label: "NCAA Division I FCS" },
  { value: "d2", label: "NCAA Division II" },
  { value: "d3", label: "NCAA Division III" },
  { value: "naia", label: "NAIA" },
  { value: "juco", label: "Junior College" },
];

// Nutrition preferences
export const DIET_PREFERENCES = [
  { value: "no_restrictions", label: "No Special Requirements" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten_free", label: "Gluten Free" },
  { value: "dairy_free", label: "Dairy Free" },
  { value: "keto", label: "Ketogenic" },
  { value: "paleo", label: "Paleo" },
];

export const FOOD_ALLERGIES = [
  { value: "none", label: "No Allergies" },
  { value: "dairy", label: "Dairy" },
  { value: "eggs", label: "Eggs" },
  { value: "peanuts", label: "Peanuts" },
  { value: "tree_nuts", label: "Tree Nuts" },
  { value: "fish", label: "Fish" },
  { value: "shellfish", label: "Shellfish" },
  { value: "soy", label: "Soy" },
  { value: "wheat", label: "Wheat" },
  { value: "gluten", label: "Gluten" },
];

export const NUTRITION_GOALS = [
  { value: "weight_gain", label: "Weight Gain" },
  { value: "weight_loss", label: "Weight Loss" },
  { value: "maintenance", label: "Maintenance" },
  { value: "performance", label: "Performance Optimization" },
  { value: "recovery", label: "Recovery Enhancement" },
];

// Breakfast options
export const BREAKFAST_OPTIONS = [
  { value: "full_breakfast", label: "Full breakfast (eggs, protein, carbs)" },
  { value: "protein_shake", label: "Protein shake or smoothie" },
  { value: "cereal", label: "Cereal or oatmeal" },
  { value: "fruit_yogurt", label: "Fruit and yogurt" },
  { value: "protein_bar", label: "Protein/energy bar" },
  { value: "skip", label: "Usually skip breakfast" },
  { value: "varies", label: "Varies day to day" },
];

// Cooking access options
export const COOKING_ACCESS_OPTIONS = [
  { value: "full_kitchen", label: "Full kitchen access" },
  { value: "limited_kitchen", label: "Limited kitchen access" },
  { value: "microwave", label: "Microwave only" },
  { value: "refrigerator", label: "Refrigerator access" },
  { value: "meal_plan", label: "School meal plan" },
  { value: "parents_cook", label: "Parents/family cook" },
];

// Training focus options
export const TRAINING_FOCUS_OPTIONS = [
  { value: "strength", label: "Strength" },
  { value: "power", label: "Power" },
  { value: "speed", label: "Speed" },
  { value: "agility", label: "Agility" },
  { value: "endurance", label: "Endurance" },
  { value: "flexibility", label: "Flexibility" },
  { value: "sport_specific", label: "Sport-specific" },
];

// Areas to improve
export const AREAS_TO_IMPROVE_OPTIONS = [
  { value: "speed", label: "Speed" },
  { value: "power", label: "Power" },
  { value: "strength", label: "Overall strength" },
  { value: "upper_body", label: "Upper body strength" },
  { value: "lower_body", label: "Lower body strength" },
  { value: "core", label: "Core strength" },
  { value: "endurance", label: "Endurance" },
  { value: "mobility", label: "Mobility/flexibility" },
  { value: "agility", label: "Agility/quickness" },
  { value: "conditioning", label: "Conditioning" },
  { value: "injury_prevention", label: "Injury prevention" },
];

// Gym access options
export const GYM_ACCESS_OPTIONS = [
  { value: "full_gym", label: "Full gym (weights, machines, cardio)" },
  { value: "school_gym", label: "School weight room" },
  { value: "home_gym", label: "Home gym setup" },
  { value: "minimal", label: "Minimal equipment (bands, dumbbells)" },
  { value: "bodyweight", label: "Bodyweight only" },
  { value: "none", label: "No regular access" },
];

// Recovery method options
export const RECOVERY_METHOD_OPTIONS = [
  { value: "stretching", label: "Stretching" },
  { value: "foam_rolling", label: "Foam rolling" },
  { value: "ice_bath", label: "Ice bath/cold therapy" },
  { value: "heat_therapy", label: "Heat therapy" },
  { value: "massage", label: "Massage" },
  { value: "compression", label: "Compression gear" },
  { value: "active_recovery", label: "Active recovery workouts" },
  { value: "nothing", label: "Nothing specific" },
];

// Days of week
export const DAYS_OF_WEEK = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

// Position strengths
export const POSITION_STRENGTHS = [
  { value: "arm_strength", label: "Arm Strength" },
  { value: "accuracy", label: "Accuracy" },
  { value: "route_running", label: "Route Running" },
  { value: "catching", label: "Catching Ability" },
  { value: "blocking", label: "Blocking" },
  { value: "footwork", label: "Footwork" },
  { value: "vision", label: "Field Vision" },
  { value: "tackling", label: "Tackling" },
  { value: "coverage", label: "Coverage" },
  { value: "playmaking", label: "Playmaking" },
  { value: "reading_defense", label: "Reading Defense" },
  { value: "reading_offense", label: "Reading Offense" },
  { value: "elusiveness", label: "Elusiveness" },
  { value: "physicality", label: "Physicality" },
  { value: "leadership", label: "Leadership" },
];

// Position weaknesses (using the same list for simplicity)
export const POSITION_WEAKNESSES = POSITION_STRENGTHS;

// Personal trainer options
export const PERSONAL_TRAINER_OPTIONS = [
  { value: "none", label: "No personal trainer/coach" },
  { value: "school_coach", label: "School strength coach" },
  { value: "private_trainer", label: "Private strength coach/trainer" },
  { value: "team_training", label: "Team training program" },
  { value: "online_program", label: "Online training program" },
];

// Growth spurt options
export const GROWTH_SPURT_OPTIONS = [
  { value: "no_spurt", label: "No recent growth spurt" },
  { value: "recent_spurt", label: "Had a growth spurt in the last year" },
  { value: "steady_growth", label: "Growing steadily" },
  { value: "early_growth", label: "Grew early, now stable" },
  { value: "late_growth", label: "Late bloomer, expecting more growth" },
];

// Recovery/energy levels
export const ENERGY_LEVEL_OPTIONS = [
  { value: "excellent", label: "Excellent - Full energy the next day" },
  { value: "good", label: "Good - Slightly tired but ready to go" },
  { value: "average", label: "Average - Some fatigue but manageable" },
  { value: "below_average", label: "Below Average - Significant fatigue" },
  { value: "poor", label: "Poor - Very fatigued, impacts next day performance" },
];

// Motivation factors
export const MOTIVATION_OPTIONS = [
  { value: "college_scholarship", label: "Earning a college scholarship" },
  { value: "playing_professionally", label: "Playing professionally" },
  { value: "team_success", label: "Team success/championships" },
  { value: "personal_improvement", label: "Personal improvement" },
  { value: "enjoyment", label: "Love of the game" },
  { value: "parental_expectations", label: "Living up to expectations" },
  { value: "proving_doubters", label: "Proving doubters wrong" },
  { value: "fitness", label: "Fitness and health" },
  { value: "social", label: "Social aspects/friendships" },
];

// Season goals
export const SEASON_GOAL_OPTIONS = [
  { value: "college_recruiting", label: "Get noticed by college recruiters" },
  { value: "starting_position", label: "Earn/maintain starting position" },
  { value: "stats_improvement", label: "Improve specific stats" },
  { value: "leadership_role", label: "Take on leadership role" },
  { value: "championship", label: "Win championship" },
  { value: "all_conference", label: "Make all-conference/all-region team" },
  { value: "technique", label: "Improve technique/skills" },
  { value: "athleticism", label: "Improve athleticism" },
  { value: "playing_time", label: "Increase playing time" },
];

// Workout frequency options
export const WORKOUT_FREQUENCY = [
  { value: "1_2", label: "1-2 days per week" },
  { value: "3_4", label: "3-4 days per week" },
  { value: "5_6", label: "5-6 days per week" },
  { value: "daily", label: "Daily" },
];

// Academic related
export const GPA_SCALE_OPTIONS = [
  { value: "4.0", label: "4.0 Scale" },
  { value: "5.0", label: "5.0 Scale (Weighted)" },
  { value: "100", label: "100 Point Scale" },
];

export const TEST_TYPES = [
  { value: "sat", label: "SAT" },
  { value: "act", label: "ACT" },
  { value: "psat", label: "PSAT" },
];

// State list for US states
export const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
  { value: "DC", label: "District of Columbia" },
];