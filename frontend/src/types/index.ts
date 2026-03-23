export type WeightUnit = 'KG' | 'LB';

export interface ExerciseSet {
  id: number;
  setNumber: number;
  weight: number;
  weightUnit: WeightUnit;
  reps: number;
}

export interface Exercise {
  id: number;
  name: string;
  sortOrder: number;
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
  name: string;
  sortOrder: number;
}

export interface ExerciseSetRequest {
  setNumber: number;
  weight: number;
  weightUnit: WeightUnit;
  reps: number;
}

export interface ErrorResponse {
  status: number;
  message: string;
  timestamp: string;
}
