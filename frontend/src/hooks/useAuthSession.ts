import { useEffect, useState } from "react";
import { authAPI } from "../api/api";
import {
    applyAuthToken,
    clearAuthToken,
    getStoredToken,
    persistTokenFromUrl,
} from "../utils/auth";

type UserData = {
    _id: string;
    name: string;
    email: string;
    picture: string;
};

export function useAuthSession() {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        persistTokenFromUrl();

        const token = getStoredToken();
        if (!token) {
            setLoading(false);
            return;
        }

        applyAuthToken(token);
        authAPI
            .get("/auth/me")
            .then((res) => setUser(res.data))
            .catch(() => {
                clearAuthToken();
                setUser(null);
            })
            .finally(() => setLoading(false));
    }, []);

    const logout = () => {
        clearAuthToken();
        setUser(null);
    };

    return {
        user,
        loading,
        setUser,
        logout,
    };
}
