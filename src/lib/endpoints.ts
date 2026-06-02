const BASE_ENDPOINT = "https://api.burnfm.com/new/"
const BASE_ENDPOINT_RADIO = BASE_ENDPOINT + "radio_show/"
const BASE_ENDPOINT_SETTINGS = BASE_ENDPOINT + "settings/"
const BASE_ENDPOINT_SCHEDULES = BASE_ENDPOINT + "schedule/"
const BASE_ENDPOINT_PODCAST = BASE_ENDPOINT + "podcast/"
const BASE_ENDPOINT_COMMITTEE = BASE_ENDPOINT + "committee/"
const BASE_ENDPOINT_OVERRIDES = BASE_ENDPOINT + "overrides/"
const BASE_ENDPOINT_IMAGES  = "https://api.burnfm.com/uploads/"
const GET_IMAGE_FILENAME = "/images.php"

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
export const DUPLICATE_SCHEDULE_ENDPOINT = (id: number) => BASE_ENDPOINT_SCHEDULES + "duplicate?id=" + id;

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

//committee
export const GET_COMMITTEE_ENDPOINT = (id?: number) => {
  if (id)
    return BASE_ENDPOINT_COMMITTEE + "get?id=" + id;
  else
    return BASE_ENDPOINT_COMMITTEE + "get";
}
export const INSERT_COMMITTEE_ENDPOINT = BASE_ENDPOINT_COMMITTEE + "insert";
export const DELETE_COMMITTEE_ENDPOINT = (id: number) => BASE_ENDPOINT_COMMITTEE + "delete?id=" + id;
export const UPDATE_COMMITTEE_ENDPOINT = (id: number) => BASE_ENDPOINT_COMMITTEE + "update?id=" + id;

//images
export const GET_PODCAST_IMAGES_ENDPOINT = BASE_ENDPOINT_IMAGES + "podcast_img" + GET_IMAGE_FILENAME;
export const GET_PEOPLE_IMAGES_ENDPOINT = BASE_ENDPOINT_IMAGES + "committee_img" + GET_IMAGE_FILENAME;
export const GET_SHOW_IMAGES_ENDPOINT = BASE_ENDPOINT_IMAGES + "schedule_img" + GET_IMAGE_FILENAME;

//overrides
export const GET_OVERRIDES_ENDPOINT = (id?: number) => {
  if (id)
    return BASE_ENDPOINT_OVERRIDES + "get?id=" + id;
  else
    return BASE_ENDPOINT_OVERRIDES + "get";
}
export const INSERT_OVERRIDE_ENDPOINT = BASE_ENDPOINT_OVERRIDES + "insert";
export const DELETE_OVERRIDE_ENDPOINT = (id: number) => BASE_ENDPOINT_OVERRIDES + "delete?id=" + id;
export const UPDATE_OVERRIDE_ENDPOINT = (id: number) => BASE_ENDPOINT_OVERRIDES + "update?id=" + id;