export type WeightUnit = 'KG' | 'LB';

export type BodyPart = 'CHEST' | 'BACK' | 'LEGS' | 'SHOULDERS' | 'ARMS' | 'CORE' | 'CARDIO';
export type EquipmentType = 'BARBELL' | 'DUMBBELL' | 'MACHINE' | 'BODYWEIGHT' | 'CABLE' | 'BAND';
export type MovementType = 'PUSH' | 'PULL' | 'LOWER' | 'CARDIO' | 'CORE' | 'COMPOUND';

export interface ExerciseSet {
  id: number;
  setNumber: number;
  weight: number;
  weightUnit: WeightUnit;
  reps: number;
}

export interface Exercise {
  id: number;
  exerciseCatalogId: number | null;
  displayName: string;
  customName: string | null;
  sortOrder: number;
  note: string | null;
  sets: ExerciseSet[];
}

export interface Workout {
  id: number;
  workoutDate: string;
  startTime: string;
  endTime: string | null;
  memo: string | null;
  exerciseCount: number;
  totalSetCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutDetail extends Workout {
  exercises: Exercise[];
}

export interface WorkoutRequest {
  workoutDate: string;
  startTime: string;
  endTime?: string;
  memo?: string;
}

export interface ExerciseRequest {
  exerciseCatalogId?: number | null;
  displayName: string;
  customName?: string | null;
  sortOrder: number;
  note?: string | null;
}

export interface ExerciseSetRequest {
  setNumber: number;
  weight: number;
  weightUnit: WeightUnit;
  reps: number;
}

// Calendar types
export interface CalendarDaySummary {
  date: string;
  workoutCount: number;
  exerciseCount: number;
  totalSets: number;
}

export interface CalendarSummaryResponse {
  year: number;
  month: number;
  days: CalendarDaySummary[];
}

export interface WorkoutDateSummary {
  id: number;
  startTime: string;
  endTime: string | null;
  memo: string | null;
  exerciseCount: number;
  totalSets: number;
}

// Exercise Catalog types
export interface ExerciseCatalog {
  id: number;
  name: string;
  category: BodyPart;
  equipment: EquipmentType;
  movementType: MovementType;
  aliases: string[];
}

export interface ExerciseCatalogSearchResponse {
  query: string;
  resultCount: number;
  results: ExerciseCatalog[];
}

export interface ErrorResponse {
  status: number;
  message: string;
  timestamp: string;
}

// Football types
export interface FootballMember {
  id: number;
  name: string;
  grade: number;
}

export interface FootballMemberRequest {
  name: string;
  grade: number;
}

export interface FootballSavedTeamMember {
  memberId?: number | null;
  memberName: string;
  memberGrade: number;
}

export interface FootballSavedTeamLineup {
  teamNumber: number;
  members: FootballSavedTeamMember[];
}

export interface FootballSavedTeam {
  id: number;
  name: string;
  teamCount: number;
  createdAt: string;
  teams: FootballSavedTeamLineup[];
}

export interface FootballSavedTeamRequest {
  name?: string;
  teams: FootballSavedTeamLineup[];
}

export type GradeGroup = '1티어' | '2티어' | '3티어' | '4티어' | '5티어' | '6티어';

export interface TeamResult {
  teamNumber: number;
  members: FootballMember[];
  gradeSum: number;
}

export interface TeamScenario {
  id: number;
  teams: TeamResult[];
}

export type LockedAssignments = Record<number, number>;

export type TeamGenerationMode = 'random' | 'roulette';
export type RouletteSpinPhase = 'idle' | 'spinning' | 'settled';

export interface RouletteAssignmentStep {
  id: number;
  tier: GradeGroup;
  targetTeamIndex: number;
  targetTeamNumber: number;
  candidates: FootballMember[];
  selectedCandidateIndex: number;
  selectedMember: FootballMember;
  spinRotationDeg: number;
  teams: TeamResult[];
}

export interface RoulettePlan {
  initialTeams: TeamResult[];
  lockedMemberCount: number;
  rouletteMemberCount: number;
  targetSizes: number[];
  steps: RouletteAssignmentStep[];
  finalTeams: TeamResult[];
}
