import { NextResponse } from "next/server";
import { gameProducts } from "@/lib/gameVault";

export const PUT = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const { availableKeys } = await request.json();

  const targetGame = gameProducts.find((g) => g.id === id);

  if (!targetGame) {
    return NextResponse.json(
      { error: "Allocation adjustment failed — game entry not found." },
      { status: 404 }
    );
  }

  targetGame.availableKeys = availableKeys;
  return NextResponse.json(targetGame);
};
