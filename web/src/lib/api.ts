import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// (optional) interceptors for logging or auth
// api.interceptors.response.use(r => r, e => { console.error(e); return Promise.reject(e); });
