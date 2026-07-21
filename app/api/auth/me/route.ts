import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { getPlayerAccountById } from "@/lib/db";

export const GET = async (_request: Request) => {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("gk_token")?.value;

  if (!sessionToken) {
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
    return NextResponse.json(
      { error: "Session token is invalid or has expired — sign in again." },
      { status: 401 }
    );
  }

  const resolvedAccount = getPlayerAccountById(tokenPayload.accountId);

  if (!resolvedAccount) {
    return NextResponse.json(
      { error: "Player account could not be located." },
      { status: 404 }
    );
  }

  const { hashedSecurityKey, ...safeProfile } = resolvedAccount;

  return NextResponse.json(safeProfile);
};
