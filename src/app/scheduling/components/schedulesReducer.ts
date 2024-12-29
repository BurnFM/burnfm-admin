import {ISchedule} from "@/interfaces/ISchedule";

export interface SchedulesState {
  loading: boolean;
  schedules: ISchedule[];
  error: string | null;
}

export const initialState: SchedulesState = {
  loading: true,
  schedules: [],
  error: null,
};

export type SchedulesAction =
    | { type: 'FETCH_REQUEST' }
    | { type: 'FETCH_SUCCESS', payload: ISchedule[] }
    | { type: 'FETCH_FAILURE', payload: string };

export function schedulesReducer(state: SchedulesState, action: SchedulesAction): SchedulesState {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, schedules: action.payload };
    case 'FETCH_FAILURE':
      return { ...state, loading: false, error: action.payload };
  }
}