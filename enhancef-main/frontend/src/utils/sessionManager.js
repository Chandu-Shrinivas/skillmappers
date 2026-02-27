const STORAGE_KEY = "elevate_user";

export const getUser = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
};

export const setUser = (user) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
};

export const clearUser = () => {
    localStorage.removeItem(STORAGE_KEY);
};
