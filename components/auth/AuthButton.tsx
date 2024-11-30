"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function AuthButton() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Check if user is already authenticated
        const token = localStorage.getItem('auth_token');
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_name');
        setIsAuthenticated(false);
        window.location.reload();
    };

    const handleLogin = () => {
        router.push('/sign-in');
    };

    if (isAuthenticated) {
        return (
            <Button onClick={handleLogout} variant="outline">
                Logout
            </Button>
        );
    }

    return (
        <Button onClick={handleLogin} variant={"outline"}>
            Login
        </Button>
    );
}
