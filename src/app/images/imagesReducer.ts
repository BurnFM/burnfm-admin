export interface iImage {
  name: string;
  location: string;
  use: string;
}

export interface ImageState {
  loading: boolean;
  images: iImage[];
  error: string | null;
}

export const initialState: ImageState = {
  loading: true,
  images: [],
  error: null,
};

export type SchedulesAction =
  | { type: "FETCH_REQUEST" }
  | { type: "FETCH_SUCCESS"; payload: iImage[] }
  | { type: "FETCH_FAILURE"; payload: string };

export function imageReducer(
  state: ImageState,
  action: SchedulesAction,
): ImageState {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, images: action.payload };
    case "FETCH_FAILURE":
      return { ...state, loading: false, error: action.payload };
  }
}
