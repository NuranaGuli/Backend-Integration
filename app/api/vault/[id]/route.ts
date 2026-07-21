import { NextResponse } from "next/server";
import { deleteGameById, getGameById, listGames, updateGameById } from "@/lib/db";

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const locatedGame = getGameById(id);

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

  try {
    const updateFields = await request.json();
    const updatedGame = updateGameById(id, updateFields);

    if (!updatedGame) {
      return NextResponse.json(
        { error: "Vault entry unavailable — cannot apply update to non-existent record." },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedGame);
  } catch {
    return NextResponse.json(
      { error: "Request body is malformed — valid JSON is required." },
      { status: 400 }
    );
  }
};

export const DELETE = async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const removed = deleteGameById(id);

  if (!removed) {
    return NextResponse.json(
      { error: "Removal failed — vault entry does not exist." },
      { status: 404 }
    );
  }

  return NextResponse.json({ delistedId: id, remainingCount: listGames().length });
};
