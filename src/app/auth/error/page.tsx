"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

const errorMessages: Record<string, string> = {
  AccessDenied: "Access denied. Please check your credentials and try again.",
  OAuthSignin: "Error connecting to the OAuth provider. Please try again.",
  OAuthCallback:
    "Error during OAuth callback. Please try again or contact support.",
  OAuthCreateAccount: "Error creating account with OAuth. Please try again.",
  EmailCreateAccount:
    "Error creating account. The email might already be in use.",
  Callback: "An error occurred during callback. Please try again.",
  OAuthAccountNotLinked:
    "Email is already associated with a different login method.",
  EmailSignInError: "Email sign in failed. Please check your credentials.",
  CredentialsSignin: "Invalid email or password. Please try again.",
  SessionCallback: "Session callback error. Please sign in again.",
  JwtSessionError: "JWT session error. Please sign in again.",
  Default: "An authentication error occurred. Please try again.",
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const message = errorMessages[error as string] || errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-blue-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-red-100 p-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Authentication Error
        </h1>

        <p className="text-gray-600 text-center mb-6">{message}</p>

        {error && (
          <p className="text-sm text-gray-500 text-center mb-6">
            Error code: <span className="font-mono">{error}</span>
          </p>
        )}

        <div className="space-y-3">
          <Link
            href="/login"
            className="w-full bg-blue-600 text-white py-3 rounded-2xl font-semibold text-center hover:bg-blue-700 transition block"
          >
            Back to Login
          </Link>

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <p className="text-xs text-gray-500 text-center mt-6">
          If this problem persists, please contact support.
        </p>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
