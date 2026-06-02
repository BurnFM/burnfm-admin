import {ISchedulePartial} from "@/interfaces/ISchedule";

export interface ScheduleState {
  loading: boolean;
  schedule: ISchedulePartial;
  originalSchedule: ISchedulePartial;
  error: { status: "FETCH_FAILURE" | "SAVE_FAILURE", message: string } | null;
}

export type ScheduleAction =
    | { type: "START_REQUEST" }
    | { type: "UPDATE_SUCCESS" }
    | { type: "UPDATE_FAILURE"; payload: string }
    | { type: "SET_NAME"; payload: string }
    | { type: "SET_START_DATE"; payload: Date | null }
    | { type: "SET_END_DATE"; payload: Date | null }
    | { type: "SET_ACTIVE"; payload: boolean }
    | { type: "RESET_SCHEDULE" };

export function scheduleReducer(state: ScheduleState, action: ScheduleAction): ScheduleState {
  switch (action.type) {
    case "START_REQUEST":
      return { ...state, loading: true, error: null };
    case "UPDATE_SUCCESS":
      return { ...state, loading: false, originalSchedule: state.schedule };
    case "UPDATE_FAILURE":
      return { ...state, loading: false, error: { status: "SAVE_FAILURE", message: action.payload } };
    case "SET_NAME":
      return { ...state, schedule: { ...state.schedule, name: action.payload } };
    case "SET_START_DATE":
      return { ...state, schedule: { ...state.schedule, start_date: action.payload } };
    case "SET_END_DATE":
      return { ...state, schedule: { ...state.schedule, end_date: action.payload } };
    case "SET_ACTIVE":
      return { ...state, schedule: { ...state.schedule, active: action.payload } };
    case "RESET_SCHEDULE":
      return { ...state, schedule: state.originalSchedule };
    default:
      return state;
  }
}