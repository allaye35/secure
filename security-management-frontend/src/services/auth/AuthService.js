import api, { plain } from "../api";
import { tokenService } from "./tokenService";

const AuthService = {
  async login(email, password) {
    const { data } = await plain.post("/auth/login", { email, password });
    // data = { accessToken, refreshToken, userId, role, userType, email, nom, prenom }
    tokenService.setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
    tokenService.setUser({
      id: data.userId,
      role: data.role,
      userType: data.userType,
      email: data.email,
      nom: data.nom,
      prenom: data.prenom,
    });
    return data;
  },

    async register({ username, email, password }) {
      const { data } = await plain.post("/auth/register", { username, email, password });
      return data;
    },

  async refresh() {
    const refreshToken = tokenService.getRefresh();
    if (!refreshToken) return null;
    const { data } = await plain.post("/auth/refresh", { refreshToken });
    if (data?.accessToken) tokenService.setTokens({ accessToken: data.accessToken });
    return data?.accessToken ?? null;
  },

  async logout() {
    try { await api.post("/auth/logout"); } catch {}
    tokenService.clear();
  },
};

export default AuthService;
