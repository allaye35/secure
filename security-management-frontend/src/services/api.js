import axios from "axios";
import { tokenService } from "./auth/tokenService";

const BASE_URL = process.env.REACT_APP_API_BASE || "http://localhost:8080/api";

// --- instance principale
const api = axios.create({ baseURL: BASE_URL, timeout: 20000 });

// --- instance "nue" pour refresh
const plain = axios.create({ baseURL: BASE_URL, timeout: 20000 });

// REQUEST: Content-Type + Authorization
api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else {
    config.headers["Content-Type"] = "application/json";
  }
  const access = tokenService.getAccess();
  if (access && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

// RESPONSE: refresh auto sur 401 (une seule tentative)
let refreshPromise = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;
    const original = error.config;

    const isAuthUrl =
      original?.url?.includes("/auth/login") ||
      original?.url?.includes("/auth/refresh");

    if (status === 401 && !original?._retry && !isAuthUrl) {
      original._retry = true;

      if (!refreshPromise) {
        const refreshToken = tokenService.getRefresh();
        refreshPromise = plain
          .post("/auth/refresh", { refreshToken })
          .then((r) => r.data?.accessToken)
          .catch(() => null)
          .finally(() => { setTimeout(() => (refreshPromise = null), 0); });
      }

      const newAccess = await refreshPromise;
      if (newAccess) {
        tokenService.setTokens({ accessToken: newAccess });
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original); // rejoue la requête
      } else {
        tokenService.clear();
         window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
export { plain };
