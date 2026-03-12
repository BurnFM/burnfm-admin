const BASE_ENDPOINT = "https://api.burnfm.com/new/"
const BASE_ENDPOINT_RADIO = BASE_ENDPOINT + "radio_show/"
const BASE_ENDPOINT_SETTINGS = BASE_ENDPOINT + "settings/"
const BASE_ENDPOINT_SCHEDULES = BASE_ENDPOINT + "schedule/"
const BASE_ENDPOINT_PODCAST = BASE_ENDPOINT + "podcast/"

//radio shows
export const GET_RADIOSHOW_ENDPOINT = (id?: number) => {
  if (id)
    return BASE_ENDPOINT_RADIO + "get?id=" + id;
  else
    return BASE_ENDPOINT_RADIO + "get";
}
export const INSERT_RADIOSHOW_ENDPOINT = BASE_ENDPOINT_RADIO + "insert";
export const DELETE_RADIOSHOW_ENDPOINT = (id: number) => BASE_ENDPOINT_RADIO + "delete?id=" + id;
export const UPDATE_RADIOSHOW_ENDPOINT = (id: number) => BASE_ENDPOINT_RADIO + "update?id=" + id;

export const GET_SETTINGS_ENDPOINT = BASE_ENDPOINT_SETTINGS + "get";
export const UPDATE_SETTINGS_ENDPOINT = BASE_ENDPOINT_SETTINGS + "update";

//schedule
export const GET_SCHEDULES_ENDPOINT = (id?: number) => {
  if (id)
    return BASE_ENDPOINT_SCHEDULES + "get?id=" + id;
  else
    return BASE_ENDPOINT_SCHEDULES + "get";
}
export const UPDATE_SCHEDULE_ENDPOINT = (id: number) => BASE_ENDPOINT_SCHEDULES + "update?id=" + id;
export const INSERT_SCHEDULE_ENDPOINT = BASE_ENDPOINT_SCHEDULES + "insert";
export const DELETE_SCHEDULE_ENDPOINT = (id: number) => BASE_ENDPOINT_SCHEDULES + "delete?id=" + id;

//login
export const LOGIN_ENDPOINT = "https://api.burnfm.com/new/auth/login"

//podcast
export const GET_PODCAST_ENDPOINT = (id?: number) => {
  if (id)
    return BASE_ENDPOINT_PODCAST + "get?id=" + id;
  else
    return BASE_ENDPOINT_PODCAST + "get";
}
export const INSERT_PODCAST_ENDPOINT = BASE_ENDPOINT_PODCAST + "insert";
export const DELETE_PODCAST_ENDPOINT = (id: number) => BASE_ENDPOINT_PODCAST + "delete?id=" + id;
export const UPDATE_PODCAST_ENDPOINT = (id: number) => BASE_ENDPOINT_PODCAST + "update?id=" + id;