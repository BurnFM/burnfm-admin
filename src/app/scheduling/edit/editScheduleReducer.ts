import {IEntry, IScheduleExtended} from "@/interfaces/ISchedule";

export interface EditScheduleState {
  loading: boolean;
  schedule: IScheduleExtended;
  originalSchedule: IScheduleExtended;
  shows: { id: number, title: string }[];
  error: { status: "FETCH_FAILURE" | "SAVE_FAILURE", message: string } | null;
}

export type EditScheduleAction =
    | { type: "START_REQUEST" }
    | { type: "FETCH_SUCCESS"; payload: { schedule: IScheduleExtended, shows: {id: number, title: string}[] } }
    | { type: "FETCH_FAILURE"; payload: string }
    | { type: "UPDATE_SUCCESS" }
    | { type: "UPDATE_FAILURE"; payload: string }
    | { type: "SET_NAME"; payload: string }
    | { type: "SET_START_DATE"; payload: Date | null }
    | { type: "SET_END_DATE"; payload: Date | null }
    | { type: "SET_ENTRIES"; payload: Omit<IEntry, "schedule_id">[] }
    | { type: "RESET_SCHEDULE" };

export function editScheduleReducer(state: EditScheduleState, action: EditScheduleAction): EditScheduleState {
  switch (action.type) {
    case "START_REQUEST":
      return {
        ...state,
        loading: true,
        error: null
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        loading: false,
        schedule: action.payload.schedule,
        originalSchedule: action.payload.schedule,
        shows: action.payload.shows
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        loading: false,
        error: { status: "FETCH_FAILURE", message: action.payload }
      };
    case "UPDATE_SUCCESS":
      return { ...state, loading: false, originalSchedule: state.schedule };
    case "UPDATE_FAILURE":
      return {
        ...state,
        loading: false,
        error: { status: "SAVE_FAILURE", message: action.payload }
      };
    case "SET_NAME":
      return { ...state, schedule: { ...state.schedule, name: action.payload } };
    case "SET_START_DATE":
      return { ...state, schedule: { ...state.schedule, start_date: action.payload } };
    case "SET_END_DATE":
      return { ...state, schedule: { ...state.schedule, end_date: action.payload } };
    case "SET_ENTRIES":
      return { ...state, schedule: { ...state.schedule, entries: action.payload } };
    case "RESET_SCHEDULE":
      return { ...state, schedule: state.originalSchedule };
    default:
      return state;
  }
}