import * as moment from "moment/moment";

export const API_URL = process.env.REACT_APP_API_URL;

//*************** Helper Functions **************/
export let getTime = date => {
    return moment(date).format("hh:mm") === "Invalid date" ? null : moment(date).format("hh:mm");
}
export let getDate = date => {
    return moment(date).format("YYYY-MM-DD") === "Invalid date" ? null : moment(date).format("YYYY-MM-DD");
}
export let saveStateToLocalStorage = (state) => {
    localStorage.setItem('events', JSON.stringify(state.events));
}
