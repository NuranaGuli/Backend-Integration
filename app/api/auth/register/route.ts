import { playerAccounts } from "@/lib/gameVault";
import { PlayerRegistrationSchema } from "@/lib/validations/authSchemas";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export const POST = async (request: Request) => {
  const requestBody = await request.json();

  const schemaResult = PlayerRegistrationSchema.safeParse(requestBody);
  if (!schemaResult.success) {
    return NextResponse.json(
      { error: schemaResult.error.issues.map((i) => i.message) },
      { status: 422 }
    );
  }

  const { playerEmail, securityKey } = schemaResult.data;

  const duplicateAccount = playerAccounts.find((acc) => acc.playerEmail === playerEmail);
  if (duplicateAccount) {
    return NextResponse.json(
      { error: "This email address is already associated with an existing account." },
      { status: 409 }
    );
  }

  const hashedSecurityKey = await bcrypt.hash(securityKey, 10);

  const registeredPlayer = {
    id: `pa${playerAccounts.length + 1}`,
    playerEmail,
    hashedSecurityKey,
    accountTier: "player",
  };

  playerAccounts.push(registeredPlayer);

  const { hashedSecurityKey: _omit, ...publicProfile } = registeredPlayer;
  return NextResponse.json(publicProfile, { status: 201 });
};
