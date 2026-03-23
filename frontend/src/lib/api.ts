import type {
  Workout,
  WorkoutDetail,
  WorkoutRequest,
  Exercise,
  ExerciseRequest,
  ExerciseSet,
  ExerciseSetRequest,
  WeightUnit,
} from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: '요청에 실패했습니다' }));
    throw new Error(error.message);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// Workout API
export const workoutApi = {
  getAll: () => fetchApi<Workout[]>('/api/workouts'),

  getByDate: (date: string) => fetchApi<Workout[]>(`/api/workouts?date=${date}`),

  getById: (id: number) => fetchApi<WorkoutDetail>(`/api/workouts/${id}`),

  create: (data: WorkoutRequest) =>
    fetchApi<Workout>('/api/workouts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: WorkoutRequest) =>
    fetchApi<Workout>(`/api/workouts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    fetchApi<void>(`/api/workouts/${id}`, { method: 'DELETE' }),
};

// Exercise API
export const exerciseApi = {
  create: (workoutId: number, data: ExerciseRequest) =>
    fetchApi<Exercise>(`/api/workouts/${workoutId}/exercises`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: ExerciseRequest) =>
    fetchApi<Exercise>(`/api/exercises/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    fetchApi<void>(`/api/exercises/${id}`, { method: 'DELETE' }),
};

// ExerciseSet API
export const exerciseSetApi = {
  create: (exerciseId: number, data: ExerciseSetRequest) =>
    fetchApi<ExerciseSet>(`/api/exercises/${exerciseId}/sets`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: ExerciseSetRequest) =>
    fetchApi<ExerciseSet>(`/api/sets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    fetchApi<void>(`/api/sets/${id}`, { method: 'DELETE' }),
};

// Weight Conversion API
export const convertWeight = (value: number, from: WeightUnit, to: WeightUnit) =>
  fetchApi<{ from: WeightUnit; to: WeightUnit; originalValue: number; convertedValue: number }>(
    `/api/convert?value=${value}&from=${from}&to=${to}`
  );
