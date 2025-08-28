import { createContext, useContext, useMemo, useState } from "react";
import AuthService from "../services/auth/AuthService";
import { tokenService } from "../services/auth/tokenService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => tokenService.getUser());

  const isAuthenticated = !!tokenService.getAccess();

  // ⬇️ Appel direct au backend
  const login = async (email, password) => {
    const data = await AuthService.login(email, password);
    // data = { accessToken, refreshToken, userId, role, userType, email, nom, prenom }
    const u = {
      id: data.userId,
      role: data.role,
      userType: data.userType,
      email: data.email,
      nom: data.nom,
      prenom: data.prenom,
    };
    tokenService.setUser(u);
    setUser(u);
    return u;
  };

  const logout = async () => {
    try { await AuthService.logout(); } catch {}
    tokenService.clear();
    setUser(null);
  };

  const hasRole = (...roles) => !!user && roles.flat().includes(user.role);

  const value = useMemo(
    () => ({ user, isAuthenticated, hasRole, login, logout }),
    [user, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
