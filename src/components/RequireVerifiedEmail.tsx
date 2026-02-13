import { useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

export const RequireVerifiedEmail = ({ children }: { children: React.ReactNode }) => {
    const { user, isLoaded } = useUser();

    if (!isLoaded) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
    }

    // Check if the user has a verified email
    const hasVerifiedEmail = user?.emailAddresses.some(
        (email) => email.verification.status === "verified"
    );

    if (!hasVerifiedEmail) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 text-center">
                <img src="/logo.png" alt="Logo" className="h-12 w-auto mb-8" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify your email</h1>
                <p className="text-gray-600 mb-8 max-w-md">
                    Please check your inbox and verify your email address to continue.
                    Once verified, reload this page.
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors"
                    >
                        I've Verified My Email
                    </button>
                    <Link to="/" className="px-6 py-2 text-gray-600 font-medium hover:text-gray-900">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
