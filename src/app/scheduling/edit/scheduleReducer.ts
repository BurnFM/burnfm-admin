import {ISchedule} from "@/interfaces/ISchedule";

export interface ScheduleState {
  loading: boolean;
  schedule: ISchedule;
  originalSchedule: ISchedule;
  error: string | null;
}

export const initialState: ScheduleState = {
  loading: true,
  schedule: {
    id: 0,
    name: "",
  },
  originalSchedule: {
    id: 0,
    name: "",
  },
  error: null,
};

export type ScheduleAction =
    | { type: "FETCH_REQUEST" }
    | { type: "FETCH_SUCCESS"; payload: ISchedule }
    | { type: "UPDATE_SUCCESS" }
    | { type: "FETCH_FAILURE"; payload: string }
    | { type: "SET_NAME"; payload: string }
    | { type: "SET_START_DATE"; payload: Date | undefined }
    | { type: "SET_END_DATE"; payload: Date | undefined }
    | { type: "RESET_SCHEDULE" };

export function scheduleReducer(state: ScheduleState, action: ScheduleAction): ScheduleState {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, schedule: action.payload, originalSchedule: action.payload };
    case "UPDATE_SUCCESS":
      return { ...state, loading: false, originalSchedule: state.schedule };
    case "FETCH_FAILURE":
      return { ...state, loading: false, error: action.payload };
    case "SET_NAME":
      return { ...state, schedule: { ...state.schedule, name: action.payload } };
    case "SET_START_DATE":
      return { ...state, schedule: { ...state.schedule, start_date: action.payload } };
    case "SET_END_DATE":
      return { ...state, schedule: { ...state.schedule, end_date: action.payload } };
    case "RESET_SCHEDULE":
      return { ...state, schedule: state.originalSchedule };
    default:
      return state;
  }
}