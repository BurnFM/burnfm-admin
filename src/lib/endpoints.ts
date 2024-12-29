const BASE_ENDPOINT = "https://api.burnfm.com/new/radio_show"

export const GET_RADIOSHOW_ENDPOINT = (id?: number) => {
  if (id)
    return BASE_ENDPOINT + "/get?id=" + id;
  else
    return BASE_ENDPOINT + "/get";
}
export const INSERT_RADIOSHOW_ENDPOINT = BASE_ENDPOINT + "/insert";
export const DELETE_RADIOSHOW_ENDPOINT = (id: number) => BASE_ENDPOINT + "/delete?id=" + id;
export const UPDATE_RADIOSHOW_ENDPOINT = (id: number) => BASE_ENDPOINT + "/update?id=" + id;

export const GET_SETTINGS_ENDPOINT = "https://api.burnfm.com/new/settings/get";
export const UPDATE_SETTINGS_ENDPOINT = "https://api.burnfm.com/new/settings/update";

export const GET_SCHEDULES_ENDPOINT = (id?: number) => {
  if (id)
    return "https://api.burnfm.com/new/schedule/get?id=" + id;
  else
    return "https://api.burnfm.com/new/schedule/get";
}
export const UPDATE_SCHEDULE_ENDPOINT = (id: number) => "https://api.burnfm.com/new/schedule/update?id=" + id;