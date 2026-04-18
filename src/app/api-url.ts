import { environment } from "../environments/environment";

/** Base URL for REST API (no trailing slash). */
export const API_BASE_URL = environment.apiBaseUrl.replace(/\/$/, "");
