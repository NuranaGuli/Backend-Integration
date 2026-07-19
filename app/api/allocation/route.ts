import { NextResponse } from "next/server";
import { gameProducts } from "@/lib/gameVault";

export const GET = async () => {
  const allocationSnapshot = gameProducts.map((g) => ({
    id: g.id,
    title: g.title,
    availableKeys: g.availableKeys,
    platform: g.platform,
    genre: g.genre,
  }));

  return NextResponse.json(allocationSnapshot);
};
