import { gameProducts } from "@/lib/gameVault";
import { NextResponse } from "next/server";

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const locatedGame = gameProducts.find((g) => g.id === id);

  if (!locatedGame) {
    return NextResponse.json(
      { error: "No vault entry found for the specified game identifier." },
      { status: 404 }
    );
  }

  return NextResponse.json(locatedGame);
};

export const PUT = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const targetGame = gameProducts.find((g) => g.id === id);

  if (!targetGame) {
    return NextResponse.json(
      { error: "Vault entry unavailable — cannot apply update to non-existent record." },
      { status: 404 }
    );
  }

  try {
    const updateFields = await request.json();
    Object.assign(targetGame, updateFields);
  } catch {
    return NextResponse.json(
      { error: "Request body is malformed — valid JSON is required." },
      { status: 400 }
    );
  }

  return NextResponse.json(targetGame);
};

export const DELETE = async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const gameToRemove = gameProducts.find((g) => g.id === id);

  if (!gameToRemove) {
    return NextResponse.json(
      { error: "Removal failed — vault entry does not exist." },
      { status: 404 }
    );
  }

  const survivingEntries = gameProducts.filter((g) => g.id !== gameToRemove.id);
  gameProducts.length = 0;
  gameProducts.push(...survivingEntries);

  return NextResponse.json({
    delistedId: gameToRemove.id,
    remainingCount: gameProducts.length,
  });
};
