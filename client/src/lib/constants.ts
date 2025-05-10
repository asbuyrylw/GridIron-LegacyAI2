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