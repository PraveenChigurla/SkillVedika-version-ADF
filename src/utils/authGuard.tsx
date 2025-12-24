// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";

// export default function AuthGuard({ children }: { children: React.ReactNode }) {
//   const router = useRouter();
//   const [checked, setChecked] = useState(false);

//   useEffect(() => {
//     const token = localStorage.getItem("admin_token");

//     // ❌ No token → redirect to login page
//     if (!token) {
//       router.replace("/");
//       return;
//     }

//     // ✔ Token exists → allow dashboard
//     setChecked(true);
//   }, [router]);

//   if (!checked) return null; // avoid flashing dashboard before redirect

//   return <>{children}</>;
// }




"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");

    // If no token → redirect to login page
    if (!token) {
      router.replace("/");
    }
  }, [router]);

  return <>{children}</>;
}
