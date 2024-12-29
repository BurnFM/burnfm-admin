export interface iSettings {
  defaultShow: {
    enabled: boolean,
    show?: number,
  },
  offAirMode: {
    enabled: boolean,
    show?: number,
  },
}

export interface SettingsState {
  loading: boolean;
  settings: iSettings;
  shows: { id: number, title: string }[]
  error: string | null;
}

export const initialState: SettingsState = {
  loading: true,
  settings: {
    defaultShow: {
      enabled: false,
      show: undefined
    },
    offAirMode: {
      enabled: false,
      show: undefined
    }
  },
  shows: [],
  error: null,
};

export type SettingsAction =
    | { type: 'FETCH_REQUEST' }
    | { type: 'FETCH_SUCCESS', payload: { settings: iSettings, shows: {id: number, title: string}[] } }
    | { type: 'UPDATE_SUCCESS' }
    | { type: 'FETCH_FAILURE', payload: string }
    | { type: 'TOGGLE_DEFAULT_SHOW', payload: boolean }
    | { type: 'SET_DEFAULT_SHOW', payload: number }
    | { type: 'TOGGLE_OFF_AIR_MODE', payload: boolean }
    | { type: 'SET_OFF_AIR_MODE_SHOW', payload: number }
    | { type: 'RESET_SETTINGS', payload: iSettings };

export function settingsReducer(state: SettingsState, action: SettingsAction): SettingsState {
  switch (action.type) {
    // Fetching settings initially
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, settings: action.payload.settings, shows: action.payload.shows };
    case 'UPDATE_SUCCESS':
      return { ...state, loading: false };
    case 'FETCH_FAILURE':
      return { ...state, loading: false, error: action.payload };

    //  Controlled behaviour of Settings
    case "TOGGLE_DEFAULT_SHOW":
      return {
        ...state,
        settings: {
          ...state.settings,
          defaultShow: {
            ...state.settings.defaultShow,
            enabled: action.payload,
          },
        }
      };
    case "SET_DEFAULT_SHOW":
      return {
        ...state,
        settings: {
          ...state.settings,
          defaultShow: {
            ...state.settings.defaultShow,
            show: action.payload,
          },
        }
      };
    case "TOGGLE_OFF_AIR_MODE":
      return {
        ...state,
        settings: {
          ...state.settings,
          offAirMode: {
            ...state.settings.offAirMode,
            enabled: action.payload,
          },
        }
      };
    case "SET_OFF_AIR_MODE_SHOW":
      return {
        ...state,
        settings: {
          ...state.settings,
          offAirMode: {
            ...state.settings.offAirMode,
            show: action.payload,
          },
        }
      };
    case "RESET_SETTINGS":
      return { ...state, settings: action.payload };

  }
}