import { InsertTrainingPlan, InsertExerciseLibrary } from "@shared/schema";

/**
 * Generate a basic training plan based on athlete data
 */
export function generateInitialTrainingPlan(
  athleteId: number, 
  position: string,
  focusAreas: string[] = []
): InsertTrainingPlan {
  const today = new Date();
  const date = today.toISOString().split('T')[0];
  
  // Determine training focus based on position
  let focus = "General";
  let title = "Foundation Builder";
  let difficultyLevel = "Beginner";
  
  const positionLower = position.toLowerCase();
  
  if (positionLower.includes("quarterback")) {
    focus = "Arm Strength & Accuracy";
    title = "Quarterback Foundation";
  } else if (positionLower.includes("running back") || positionLower.includes("wide receiver")) {
    focus = "Speed & Agility";
    title = "Speed Foundation";
  } else if (positionLower.includes("offensive line") || positionLower.includes("defensive line") || 
             positionLower.includes("tackle") || positionLower.includes("guard")) {
    focus = "Strength & Power";
    title = "Lineman Foundation";
  } else if (positionLower.includes("linebacker") || positionLower.includes("safety")) {
    focus = "Explosiveness & Coverage";
    title = "Defender Foundation";
  } else if (positionLower.includes("cornerback")) {
    focus = "Coverage & Quickness";
    title = "Corner Foundation";
  } else if (positionLower.includes("kicker") || positionLower.includes("punter")) {
    focus = "Leg Strength & Flexibility";
    title = "Specialist Foundation";
  }
  
  // Override focus if the athlete has specific focus areas
  if (focusAreas && focusAreas.length > 0) {
    // If focus areas include key training priorities, adjust the plan
    if (focusAreas.some(area => area.toLowerCase().includes("speed"))) {
      focus = "Speed & Acceleration";
      title = "Speed Development";
    } else if (focusAreas.some(area => area.toLowerCase().includes("strength"))) {
      focus = "Strength & Power";
      title = "Strength Builder";
    } else if (focusAreas.some(area => area.toLowerCase().includes("agility"))) {
      focus = "Agility & Quickness";
      title = "Agility Enhancement";
    }
  }
  
  // Generate exercises based on training focus
  const exercises = generateExercisesForFocus(focus, positionLower);
  
  // Create appropriate coach tip
  const coachTip = generateCoachTip(focus, position);
  
  return {
    athleteId,
    date,
    title,
    focus,
    exercises,
    completed: false,
    active: true,
    difficultyLevel,
    coachTip
  };
}

/**
 * Generate position-specific exercises based on focus area
 */
function generateExercisesForFocus(focus: string, position: string): any[] {
  const exercises = [];
  
  // Common warmup for all plans
  exercises.push({
    id: "warmup1",
    name: "Dynamic Warm-up Routine",
    sets: 1,
    reps: "5-10 minutes",
    restTime: 0,
    completed: false,
    category: "Warm-up"
  });
  
  // Focus-specific main exercises
  if (focus.includes("Speed")) {
    exercises.push(
      {
        id: "speed1",
        name: "Linear Sprint Ladder",
        sets: 3,
        reps: "30 yards × 4",
        restTime: 60,
        completed: false,
        category: "Speed"
      },
      {
        id: "speed2",
        name: "Resistance Band Sprints",
        sets: 4,
        reps: "15 yards",
        restTime: 90,
        completed: false,
        category: "Speed"
      },
      {
        id: "agility1",
        name: "Cone Shuttle Drill",
        sets: 3,
        reps: "5 reps",
        restTime: 60,
        completed: false,
        category: "Agility"
      }
    );
    
    // Add position-specific speed exercise
    if (position.includes("receiver") || position.includes("back")) {
      exercises.push({
        id: "posSpeed1",
        name: "Route Running Explosiveness",
        sets: 3,
        reps: "5 routes",
        restTime: 45,
        completed: false,
        category: "Position-Specific"
      });
    } else if (position.includes("quarterback")) {
      exercises.push({
        id: "posSpeed1",
        name: "Pocket Mobility Drills",
        sets: 3,
        reps: "1 minute each",
        restTime: 45,
        completed: false,
        category: "Position-Specific"
      });
    }
  } 
  else if (focus.includes("Strength")) {
    exercises.push(
      {
        id: "strength1",
        name: "Squat Progression",
        sets: 4,
        reps: "8-10 reps",
        restTime: 120,
        completed: false,
        category: "Strength"
      },
      {
        id: "strength2",
        name: "Bench Press Progression",
        sets: 4,
        reps: "8-10 reps",
        restTime: 120,
        completed: false,
        category: "Strength"
      },
      {
        id: "power1",
        name: "Explosive Medicine Ball Throws",
        sets: 3,
        reps: "8 reps",
        restTime: 60,
        completed: false,
        category: "Power"
      }
    );
    
    // Add position-specific strength exercise
    if (position.includes("line")) {
      exercises.push({
        id: "posStrength1",
        name: "Sled Push/Pull Complex",
        sets: 3,
        reps: "20 yards each",
        restTime: 90,
        completed: false,
        category: "Position-Specific"
      });
    }
  } 
  else if (focus.includes("Agility") || focus.includes("Quickness")) {
    exercises.push(
      {
        id: "agility1",
        name: "5-10-5 Pro Agility Shuttle",
        sets: 4,
        reps: "3 reps",
        restTime: 60,
        completed: false,
        category: "Agility"
      },
      {
        id: "agility2",
        name: "Lateral Hurdle Hops",
        sets: 3,
        reps: "8 each side",
        restTime: 45,
        completed: false,
        category: "Agility"
      },
      {
        id: "agility3",
        name: "Box Drill",
        sets: 3,
        reps: "2 each direction",
        restTime: 60,
        completed: false,
        category: "Agility"
      }
    );
    
    // Add position-specific agility exercise
    if (position.includes("cornerback") || position.includes("safety")) {
      exercises.push({
        id: "posAgility1",
        name: "Coverage Reactive Footwork",
        sets: 3,
        reps: "45 seconds",
        restTime: 45,
        completed: false,
        category: "Position-Specific"
      });
    }
  } 
  else if (focus.includes("Arm") || position.includes("quarterback")) {
    exercises.push(
      {
        id: "qb1",
        name: "Rotational Medicine Ball Throws",
        sets: 3,
        reps: "10 each side",
        restTime: 45,
        completed: false,
        category: "Power"
      },
      {
        id: "qb2",
        name: "Quarterback Ladder Progression",
        sets: 3,
        reps: "2 minutes",
        restTime: 60,
        completed: false,
        category: "Footwork"
      },
      {
        id: "qb3",
        name: "Progressive Throwing Routine",
        sets: 4,
        reps: "10 throws per set",
        restTime: 45,
        completed: false,
        category: "Position-Specific"
      }
    );
  }
  else if (focus.includes("Leg") || position.includes("kicker")) {
    exercises.push(
      {
        id: "specialist1",
        name: "Leg Swings & Hip Mobility",
        sets: 3,
        reps: "10 each direction",
        restTime: 30,
        completed: false,
        category: "Mobility"
      },
      {
        id: "specialist2",
        name: "Single Leg RDL Progression",
        sets: 3,
        reps: "8 each leg",
        restTime: 45,
        completed: false,
        category: "Strength"
      },
      {
        id: "specialist3",
        name: "Progressive Kicking Routine",
        sets: 1,
        reps: "15 minutes",
        restTime: 0,
        completed: false,
        category: "Position-Specific"
      }
    );
  }
  else {
    // General athletic development for any focus not covered
    exercises.push(
      {
        id: "general1",
        name: "Squat Progression",
        sets: 3,
        reps: "8-10 reps",
        restTime: 90,
        completed: false,
        category: "Strength"
      },
      {
        id: "general2",
        name: "Push-Up Variations",
        sets: 3,
        reps: "10-12 reps",
        restTime: 60,
        completed: false,
        category: "Strength"
      },
      {
        id: "general3",
        name: "Sprint Interval Training",
        sets: 5,
        reps: "20 yards",
        restTime: 60,
        completed: false,
        category: "Speed"
      }
    );
  }
  
  // Add finishing core work to all plans
  exercises.push({
    id: "core1",
    name: "Core Circuit",
    sets: 3,
    reps: "30 seconds each exercise",
    restTime: 45,
    completed: false,
    category: "Core"
  });
  
  return exercises;
}

/**
 * Generate a coaching tip based on focus and position
 */
function generateCoachTip(focus: string, position: string): string {
  const focusLower = focus.toLowerCase();
  const positionLower = position.toLowerCase();
  
  if (focusLower.includes("speed")) {
    return "Focus on proper sprint mechanics: high knees, arms at 90 degrees, and driving through the ground with each step. Quality of movement is more important than just going fast.";
  } 
  else if (focusLower.includes("strength")) {
    return "Remember that form always comes before weight. Master the movement patterns before adding significant resistance. Progressive overload should be gradual.";
  } 
  else if (focusLower.includes("agility")) {
    return "When performing agility drills, focus on planting your outside foot and driving in the new direction. The lower you can keep your center of gravity during transitions, the quicker you'll be.";
  }
  else if (positionLower.includes("quarterback")) {
    return "During throwing drills, focus on sequencing: hips, torso, then arm. Generate power from the ground up. Your accuracy will improve when your full body works together as a unit.";
  }
  else if (positionLower.includes("line")) {
    return "For linemen training, the key is explosive power from a stable base. Focus on driving from your hips while maintaining core stability throughout each exercise.";
  }
  else if (positionLower.includes("kicker") || positionLower.includes("punter")) {
    return "Consistency comes from repeatable technique. Focus on the same approach and contact point every time. Your non-kicking leg is your foundation - make it strong and stable.";
  }
  
  // General tip for any other focus/position
  return "This foundation plan builds the athletic base you'll need for football success. Focus on quality movements, proper recovery between sets, and gradually increasing intensity as you progress.";
}

/**
 * Create sample exercises for the exercise library
 */
export function createSampleExercises(): InsertExerciseLibrary[] {
  return [
    {
      name: "Box Jumps",
      description: "Explosive jumping exercise to develop lower body power",
      category: "Power",
      difficulty: "Intermediate",
      muscleGroups: ["Quadriceps", "Hamstrings", "Glutes", "Calves"],
      equipmentNeeded: ["Plyo box"],
      instructions: [
        "Stand facing the box with feet shoulder-width apart",
        "Swing arms back and bend knees to prepare for jump",
        "Explosively extend hips, knees, and ankles to jump onto the box",
        "Land softly in a partial squat position on the box",
        "Step back down and repeat"
      ],
      tips: [
        "Focus on soft landings to protect your joints",
        "Start with a lower box and progress to higher heights",
        "Ensure the box is stable before jumping"
      ],
      positionSpecific: false,
      positions: []
    },
    {
      name: "Quarterback Ladder Drill",
      description: "Footwork drill to improve quarterback mobility in the pocket",
      category: "Agility",
      difficulty: "Intermediate",
      muscleGroups: ["Calves", "Hamstrings", "Quadriceps"],
      equipmentNeeded: ["Agility ladder"],
      instructions: [
        "Begin at one end of the ladder",
        "Perform quick feet through the ladder using various patterns (in-in-out-out, lateral shuffles, high knees)",
        "Finish with a simulated throwing motion",
        "Repeat with different footwork patterns"
      ],
      tips: [
        "Focus on quick, light feet",
        "Keep your head up as if scanning the field",
        "Maintain an athletic quarterback stance throughout"
      ],
      positionSpecific: true,
      positions: ["Quarterback (QB)"]
    },
    {
      name: "Defensive Line Get-Off Drill",
      description: "Drill to improve explosive first step for defensive linemen",
      category: "Position-Specific",
      difficulty: "Intermediate",
      muscleGroups: ["Calves", "Quadriceps", "Core", "Shoulders"],
      equipmentNeeded: ["Cones", "Timer"],
      instructions: [
        "Start in a three-point stance in front of a cone",
        "On visual or audio cue, explode forward as if rushing the passer",
        "Touch the ground at the cone 5 yards ahead",
        "Repeat with varied timing between cues"
      ],
      tips: [
        "Focus on explosive hip extension",
        "Keep low center of gravity during initial steps",
        "Drive arms forward to generate momentum",
        "React to the cue, don't anticipate"
      ],
      positionSpecific: true,
      positions: ["Defensive Tackle (DT)", "Defensive End (DE)"]
    }
  ];
}