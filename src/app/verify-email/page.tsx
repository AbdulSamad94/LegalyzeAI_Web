import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { VerificationUI } from "@/components/verification/VerificationUI";

const LoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-8">
    <div className="inline-flex p-4 bg-blue-100 rounded-full">
      <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
    </div>
    <span className="sr-only">Loading...</span>
  </div>
);

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerificationUI />
    </Suspense>
  );
}
