import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteAuthSessionByToken } from "@/lib/db";

export const POST = async () => {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("gk_token")?.value;

  if (sessionToken) {
    deleteAuthSessionByToken(sessionToken);
  }

  const serverResponse = NextResponse.json({
    message: "Player session terminated. See you next game! 👋",
  });
  serverResponse.cookies.delete("gk_token");
  return serverResponse;
};
