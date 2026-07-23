import React, { useEffect } from "react";
import { useRouter } from "next/router";

export default function LoginRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div className="p-10 text-center font-bold text-[#0F1E3D]">
      Redirecting to Login Gateway...
    </div>
  );
}
