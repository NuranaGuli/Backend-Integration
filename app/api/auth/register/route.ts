import { PlayerRegistrationSchema } from "@/lib/validations/authSchemas";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createPlayerAccount, getPlayerAccountByEmail } from "@/lib/db";

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

  const duplicateAccount = getPlayerAccountByEmail(playerEmail);
  if (duplicateAccount) {
    return NextResponse.json(
      { error: "This email address is already associated with an existing account." },
      { status: 409 }
    );
  }

  const hashedSecurityKey = await bcrypt.hash(securityKey, 10);

  const registeredPlayer = createPlayerAccount({
    playerEmail,
    hashedSecurityKey,
    accountTier: "player",
  });

  const { hashedSecurityKey: _omit, ...publicProfile } = registeredPlayer;
  return NextResponse.json(publicProfile, { status: 201 });
};
