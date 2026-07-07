import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function getSession() {
  try {
    const headersList = await headers();
    const cookie = headersList.get("cookie");

    if (!cookie) return null;

    const session = await auth.api.getSession({
      headers: {
        cookie,
      },
    });

    return session;
  } catch (error) {
    console.error("Session error:", error);
    return null;
  }
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session;
}
