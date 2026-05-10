export interface iPerson {
  id: number,
  name: string,
  role: string,
  course?: string,
  description?: string,
  fact?: string,
  song?: string,
  photo?: string,
  year: number
}

export interface PeopleState {
  loading: boolean;
  people: iPerson[];
  error: string | null;
}

export const initialState: PeopleState = {
  loading: true,
  people: [],
  error: null,
};

export type SchedulesAction =
    | { type: 'FETCH_REQUEST' }
    | { type: 'FETCH_SUCCESS', payload: iPerson[] }
    | { type: 'FETCH_FAILURE', payload: string };

export function peopleReducer(state: PeopleState, action: SchedulesAction): PeopleState {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, people: action.payload };
    case 'FETCH_FAILURE':
      return { ...state, loading: false, error: action.payload };
  }
}