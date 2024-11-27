"use client"

import React, { useEffect, useState } from 'react';
import Script from 'next/script';
import { handleAuthResponse } from '@/lib/authUtils';
import { LoadingSpinner } from '@/components/ui/loading';

const OtplessComponent = () => {
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);
    const [isScriptError, setIsScriptError] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        
        // Reset any existing instance
        const existingScript = document.getElementById('otpless-sdk');
        if (existingScript) {
            existingScript.remove();
        }

        window.otpless = (otplessUser: any) => {
            handleAuthResponse(otplessUser);
        };

        // Reset the div when component mounts
        const resetOtplessDiv = () => {
            const existingDiv = document.getElementById('otpless-login-page');
            if (existingDiv) {
                existingDiv.innerHTML = '';
            }
        };
        resetOtplessDiv();

        // Force initialization after a short delay
        const timer = setTimeout(() => {
            if (window.otpless && typeof window.otpless.init === 'function') {
                window.otpless.init();
            }
        }, 100);

        // Cleanup function
        return () => {
            clearTimeout(timer);
            resetOtplessDiv();
            setIsMounted(false);
            setIsScriptLoaded(false);
        };
    }, []);

    const handleScriptLoad = () => {
        setIsScriptLoaded(true);
        // Initialize otpless after script loads
        if (window.otpless && typeof window.otpless.init === 'function') {
            window.otpless.init();
        }
    };

    const handleScriptError = () => {
        setIsScriptError(true);
    };

    const appID = process.env.NEXT_PUBLIC_OTPLESS_APP_ID;

    if (!appID) {
        console.error('NEXT_PUBLIC_OTPLESS_APP_ID is not set in the environment variables');
        return null;
    }

    if (isScriptError) {
        return (
            <div className="text-center text-red-500 p-4">
                Failed to load authentication component. Please try again later.
            </div>
        );
    }

    if (!isMounted) {
        return <LoadingSpinner />;
    }

    return (
        <div>
            <Script
                id="otpless-sdk"
                type="text/javascript"
                src="https://otpless.com/v2/auth.js"
                data-appid={appID}
                onLoad={handleScriptLoad}
                onError={handleScriptError}
                strategy="afterInteractive"
            />
            
            {!isScriptLoaded && (
                <LoadingSpinner />
            )}

        <div id="otpless-login-page"></div>
        </div>
    );
};

export default OtplessComponent;