import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function LogoutButton({ className }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();          // efface tokens + user
    navigate("/login", { replace: true });
  };

  return (
    <button type="button" className={className} onClick={handleLogout}>
      Se déconnecter
    </button>
  );
}
