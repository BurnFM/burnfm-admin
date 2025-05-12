
export interface iShow {
  id: number,
  title: string,
  description?: string,
  hosts: string[],
  photo?: string
}

export interface ShowsState {
  loading: boolean;
  shows: iShow[];
  error: string | null;
}

export const initialState: ShowsState = {
  loading: true,
  shows: [],
  error: null,
};

export type SchedulesAction =
    | { type: 'FETCH_REQUEST' }
    | { type: 'FETCH_SUCCESS', payload: iShow[] }
    | { type: 'FETCH_FAILURE', payload: string };

export function showsReducer(state: ShowsState, action: SchedulesAction): ShowsState {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, shows: action.payload };
    case 'FETCH_FAILURE':
      return { ...state, loading: false, error: action.payload };
  }
}