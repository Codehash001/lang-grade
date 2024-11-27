interface OtplessUser {
    status: string;
    token: string;
    userId: string;
    timestamp: string;
    identities: Array<{
      identityType: string;
      identityValue: string;
      channel: string;
      methods: string[];
      name: string;
      verified: boolean;
      verifiedAt: string;
      isCompanyEmail: string;
    }>;
    idToken: string;
    network: {
      ip: string;
      timezone: string;
      ipLocation: Record<string, unknown>;
    };
    deviceInfo: Record<string, unknown>;
    sessionInfo: Record<string, unknown>;
    firebaseInfo: Record<string, unknown>;
  }
  interface OtplessExtended {
    (otplessUser: OtplessUser): void;
    init?: () => void;
}

declare global {
    interface Window {
        otpless: OtplessExtended;
    }
}

  export {};