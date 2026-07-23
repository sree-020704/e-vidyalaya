import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export interface User {
  admissionNo: string;
  id: number;
  name: string;
  email: string;
  role: string;
  gradeLevel?: string;
  tenantId?: string;
}

export function useAuth(allowedRoles?: string[]) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        const userRole = parsedUser.role?.toLowerCase();

        if (
          allowedRoles &&
          allowedRoles.length > 0 &&
          !allowedRoles.includes(userRole)
        ) {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          router.push("/");
          return;
        }

        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        router.push("/");
      }
    } else {
      if (allowedRoles && allowedRoles.length > 0) {
        router.push("/");
      }
    }
    setLoading(false);
  }, [router, allowedRoles]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
  };

  return { user, loading, logout };
}
