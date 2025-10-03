"use client";

// Client-side cookie utilities
export const getClientToken = (): string | null => {
    if (typeof window === "undefined") return null;

    try {
        // Get token from document.cookie
        const name = "token=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const cookies = decodedCookie.split(';');

        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i];
            while (cookie.charAt(0) === ' ') {
                cookie = cookie.substring(1);
            }
            if (cookie.indexOf(name) === 0) {
                return cookie.substring(name.length, cookie.length);
            }
        }
        return null;
    } catch {
        return null;
    }
};

export const removeClientToken = (): void => {
    if (typeof window === "undefined") return;

    try {
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    } catch (error) {
        console.error("Failed to remove token:", error);
    }
};

export const isLoggedIn = (): boolean => {
    const token = getClientToken();
    return !!token && token.trim() !== "";
};