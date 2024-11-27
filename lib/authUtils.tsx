import Cookies from 'js-cookie';

export interface UserInfo {
    name: string;
    email: string;
    userId: string;
}

export interface OtplessResponse {
    token: string;
    userId: string;
    identities?: Array<{
        name: string;
        identityValue: string;
    }>;
}

export const handleAuthResponse = (response: OtplessResponse) => {
    if (response.token) {
        const userInfo: UserInfo = {
            name: response.identities?.[0]?.name || '',
            email: response.identities?.[0]?.identityValue || '',
            userId: response.userId
        };

        // Store user info and token
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        localStorage.setItem('auth_token', response.token);

        // Redirect to home page
        window.location.href = '/';
    }
};

export const signOut = () => {
    // Clear all auth-related items from localStorage
    localStorage.removeItem('userInfo');
    localStorage.removeItem('auth_token');
    
    // Reload the page to reset the app state
    window.location.reload();
};

export function useAuth() {
    const isAuthenticated = localStorage.getItem('auth_token');
    return { isAuthenticated, signOut };
}