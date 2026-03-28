import API, { authAPI } from "../api/api";

export const getStoredToken = () => localStorage.getItem("token");

export const persistTokenFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("token");
    if (!tokenFromUrl) return null;

    localStorage.setItem("token", tokenFromUrl);
    window.history.replaceState({}, document.title, window.location.pathname);
    return tokenFromUrl;
};

export const applyAuthToken = (token: string) => {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    authAPI.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

export const clearAuthToken = () => {
    delete API.defaults.headers.common["Authorization"];
    delete authAPI.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
};
