import type {
  Workout,
  WorkoutDetail,
  WorkoutRequest,
  Exercise,
  ExerciseRequest,
  ExerciseSet,
  ExerciseSetRequest,
  WeightUnit,
  CalendarSummaryResponse,
  WorkoutDateSummary,
  ExerciseCatalog,
  ExerciseCatalogSearchResponse,
  BodyPart,
  FootballMember,
  FootballMemberRequest,
  FootballSavedTeam,
  FootballSavedTeamRequest,
} from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const headers: HeadersInit = options?.body
    ? { 'Content-Type': 'application/json' }
    : {};
  const res = await fetch(`${API_BASE}${url}`, {
    headers,
    ...options,
  });

  if (!res.ok) {
    const contentType = res.headers.get('content-type') ?? '';

    if (contentType.includes('application/json')) {
      const error = await res.json().catch(() => null);
      if (error?.message) {
        throw new Error(error.message);
      }
    } else {
      const text = await res.text().catch(() => '');
      if (text.trim()) {
        throw new Error(text.trim());
      }
    }

    if (res.status === 404) {
      throw new Error('요청한 API를 찾을 수 없습니다');
    }

    throw new Error(`요청에 실패했습니다 (${res.status})`);
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

  getCalendarSummary: (year: number, month: number) =>
    fetchApi<CalendarSummaryResponse>(`/api/workouts/calendar?year=${year}&month=${month}`),

  getDateSummary: (date: string) =>
    fetchApi<WorkoutDateSummary[]>(`/api/workouts/date/${date}`),
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

// Exercise Catalog API
export const exerciseCatalogApi = {
  getAll: () => fetchApi<ExerciseCatalog[]>('/api/exercise-catalog'),

  getByCategory: (category: BodyPart) =>
    fetchApi<ExerciseCatalog[]>(`/api/exercise-catalog?category=${category}`),

  search: (query: string) =>
    fetchApi<ExerciseCatalogSearchResponse>(`/api/exercise-catalog/search?query=${encodeURIComponent(query)}`),
};

// Football API
export const footballApi = {
  getMembers: () => fetchApi<FootballMember[]>('/api/football/members'),

  createMember: (data: FootballMemberRequest) =>
    fetchApi<FootballMember>('/api/football/members', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateMember: (id: number, data: FootballMemberRequest) =>
    fetchApi<FootballMember>(`/api/football/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteMember: (id: number) =>
    fetchApi<void>(`/api/football/members/${id}`, { method: 'DELETE' }),

  getSavedTeams: () => fetchApi<FootballSavedTeam[]>('/api/football/saved-teams'),

  saveTeam: (data: FootballSavedTeamRequest) =>
    fetchApi<FootballSavedTeam>('/api/football/saved-teams', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteSavedTeam: (id: number) =>
    fetchApi<void>(`/api/football/saved-teams/${id}`, { method: 'DELETE' }),
};

// Weight Conversion API
export const convertWeight = (value: number, from: WeightUnit, to: WeightUnit) =>
  fetchApi<{ from: WeightUnit; to: WeightUnit; originalValue: number; convertedValue: number }>(
    `/api/convert?value=${value}&from=${from}&to=${to}`
  );
