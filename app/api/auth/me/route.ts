import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { getAuthSessionByToken, getPlayerAccountById } from "@/lib/db";

export const GET = async (_request: Request) => {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("gk_token")?.value;

  if (!sessionToken) {
    console.log("No session token found in cookies.");
    return NextResponse.json(
      { error: "No active session detected — please sign in to continue." },
      { status: 401 }
    );
  }

  let tokenPayload: { accountId: string };

  try {
    tokenPayload = jwt.verify(
      sessionToken,
      process.env.JWT_SECRET ?? "cyberkey_gg_secret"
    ) as { accountId: string };
  } catch {
    console.log("Session token verification failed.");
    return NextResponse.json(
      { error: "Session token is invalid or has expired — sign in again." },
      { status: 401 }
    );
  }

  const authSession = getAuthSessionByToken(sessionToken);
  if (!authSession || authSession.accountId !== tokenPayload.accountId) {
    console.log("No matching auth session found for the provided token.");
    console.log("Token payload:", tokenPayload);
    return NextResponse.json(
      { error: "Session token is invalid or has expired — sign in again." },
      { status: 401 }
    );
  }

  const resolvedAccount = getPlayerAccountById(tokenPayload.accountId);

  if (!resolvedAccount) {
    console.log("No player account found for the given account ID.");
    return NextResponse.json(
      { error: "Player account could not be located." },
      { status: 404 }
    );
  }

  const { hashedSecurityKey, ...safeProfile } = resolvedAccount;
  console.log("Resolved player profile:", safeProfile);
  return NextResponse.json(safeProfile);
};
