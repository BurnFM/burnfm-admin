const BASE_ENDPOINT = "https://api.burnfm.com/new/"
const BASE_ENDPOINT_RADIO = BASE_ENDPOINT + "radio_show/"
const BASE_ENDPOINT_SETTINGS = BASE_ENDPOINT + "settings/"
const BASE_ENDPOINT_SCHEDULES = BASE_ENDPOINT + "schedule/"
const BASE_ENDPOINT_PODCAST = BASE_ENDPOINT + "podcast/"
const BASE_ENDPOINT_COMMITTEE = BASE_ENDPOINT + "committee/"
const BASE_ENDPOINT_PEOPLE = BASE_ENDPOINT_COMMITTEE + "people/"
const BASE_ENDPOINT_ROLE = BASE_ENDPOINT_COMMITTEE + "role/"
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
//people on committee
export const GET_PEOPLE_ENDPOINT = (id?: number) => {
  if (id)
    return BASE_ENDPOINT_PEOPLE + "get?id=" + id;
  else
    return BASE_ENDPOINT_PEOPLE + "get";
}
export const INSERT_PEOPLE_ENDPOINT = BASE_ENDPOINT_PEOPLE + "insert";
export const DELETE_PEOPLE_ENDPOINT = (id: number) => BASE_ENDPOINT_PEOPLE + "delete?id=" + id;
export const UPDATE_PEOPLE_ENDPOINT = (id: number) => BASE_ENDPOINT_PEOPLE + "update?id=" + id;
//roles on committee
export const GET_ROLE_ENDPOINT = (id?: number, year?: number) => {
  if (id)
    return BASE_ENDPOINT_ROLE + "get?id=" + id;
  if (year)
    return BASE_ENDPOINT_ROLE + "get?year=" + year;
  else
    return BASE_ENDPOINT_ROLE + "get";
}
export const INSERT_ROLE_ENDPOINT = BASE_ENDPOINT_ROLE + "insert";
export const DELETE_ROLE_ENDPOINT = (id: number) => BASE_ENDPOINT_ROLE + "delete?id=" + id;
export const UPDATE_ROLE_ENDPOINT = (id: number) => BASE_ENDPOINT_ROLE + "update?id=" + id;

export const GET_PODCAST_IMAGES_ENDPOINT = BASE_ENDPOINT_IMAGES + "podcast_img" + GET_IMAGE_FILENAME;
export const GET_PEOPLE_IMAGES_ENDPOINT = BASE_ENDPOINT_IMAGES + "committee_img" + GET_IMAGE_FILENAME;
export const GET_SHOW_IMAGES_ENDPOINT = BASE_ENDPOINT_IMAGES + "schedule_img" + GET_IMAGE_FILENAME;