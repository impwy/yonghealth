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
