import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getUser, setUser as saveUser, clearUser } from "@/utils/sessionManager";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const UserContext = createContext(null);

export function UserProvider({ children }) {
    const [user, setUserState] = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount, check localStorage
    useEffect(() => {
        const stored = getUser();
        if (stored) {
            setUserState(stored);
        }
        setLoading(false);
    }, []);

    const login = useCallback(async (name, email) => {
        const res = await axios.post(`${API}/user/sync`, { name, email });
        const userData = res.data;
        saveUser(userData);
        setUserState(userData);
        return userData;
    }, []);

    const logout = useCallback(() => {
        clearUser();
        setUserState(null);
    }, []);

    return (
        <UserContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error("useUser must be used within UserProvider");
    return ctx;
}
