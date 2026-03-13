
export interface ipodcast {
  id: number,
  title: string,
  description?: string,
  hosts: string[],
  photo?: string,
  startDate?: string,
  endDate?: string,
  latestShow?: string,

}

export interface PodcastsState {
  loading: boolean;
  podcasts: ipodcast[];
  error: string | null;
}

export const initialState: PodcastsState = {
  loading: true,
  podcasts: [],
  error: null,
};

export type SchedulesAction =
    | { type: 'FETCH_REQUEST' }
    | { type: 'FETCH_SUCCESS', payload: ipodcast[] }
    | { type: 'FETCH_FAILURE', payload: string };

export function podcastsReducer(state: PodcastsState, action: SchedulesAction): PodcastsState {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, podcasts: action.payload };
    case 'FETCH_FAILURE':
      return { ...state, loading: false, error: action.payload };
  }
}