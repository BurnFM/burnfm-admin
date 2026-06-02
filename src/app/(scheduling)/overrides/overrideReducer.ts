
export interface iOverride {
  id: number,
  date: string,
  startTime: string,
  endTime: string,
  type: string,
  radioShowID?: number
}

export interface OverridesState {
  loading: boolean;
  overrides: iOverride[];
  error: string | null;
}

export const initialState: OverridesState = {
  loading: true,
  overrides: [],
  error: null,
};

export type SchedulesAction =
    | { type: 'FETCH_REQUEST' }
    | { type: 'FETCH_SUCCESS', payload: iOverride[] }
    | { type: 'FETCH_FAILURE', payload: string };

export function overridesReducer(state: OverridesState, action: SchedulesAction): OverridesState {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, overrides: action.payload };
    case 'FETCH_FAILURE':
      return { ...state, loading: false, error: action.payload };
  }
}