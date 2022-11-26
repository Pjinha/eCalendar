export const DEVELOPMENT = location.hostname === "localhost" || location.hostname === "";
export const PRODUCTION = !DEVELOPMENT;

export const API_URL = DEVELOPMENT ? "http://localhost:8000/" : "https://qq0201.iptime.org/";
