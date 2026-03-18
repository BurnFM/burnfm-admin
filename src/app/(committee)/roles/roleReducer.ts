import { IPerson } from "@/interfaces/ICommittee";

export interface iRole {
  id: number,
  role: string,
  personID: IPerson | number,
  year: number,
}

export interface RoleState {
  loading: boolean;
  roles: iRole[];
  error: string | null;
}

export const initialState: RoleState = {
  loading: true,
  roles: [],
  error: null,
};

export type RoleAction =
    | { type: 'FETCH_REQUEST' }
    | { type: 'FETCH_SUCCESS', payload: iRole[] }
    | { type: 'FETCH_FAILURE', payload: string };

export function roleReducer(state: RoleState, action: RoleAction): RoleState {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, roles: action.payload };
    case 'FETCH_FAILURE':
      return { ...state, loading: false, error: action.payload };
  }
}