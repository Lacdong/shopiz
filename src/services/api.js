import axios from "axios";
// Reserved for future simulator APIs. No production services are connected.
export const api = axios.create({ baseURL: "/api", timeout: 10000 });
