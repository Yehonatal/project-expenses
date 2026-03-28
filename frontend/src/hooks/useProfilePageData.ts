import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { authAPI } from "../api/api";
import { applyAuthToken, getStoredToken } from "../utils/auth";
import type { ProfileStats, ProfileUser } from "../types/profile";

export function useProfilePageData() {
    const navigate = useNavigate();
    const [user, setUser] = useState<ProfileUser | null>(null);
    const [stats, setStats] = useState<ProfileStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = getStoredToken();
        if (!token) {
            navigate("/");
            setLoading(false);
            return;
        }

        applyAuthToken(token);

        const fetchData = async () => {
            try {
                const [userRes, statsRes] = await Promise.all([
                    authAPI.get("/auth/me"),
                    API.get("/expenses/stats"),
                ]);
                setUser(userRes.data);
                setStats(statsRes.data);
            } catch (err) {
                console.error("Failed to load profile data", err);
            } finally {
                setLoading(false);
            }
        };

        void fetchData();
    }, [navigate]);

    return {
        user,
        stats,
        loading,
    };
}
