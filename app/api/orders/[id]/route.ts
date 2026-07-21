import { NextResponse } from "next/server";
import { deleteOrderById, getOrderById, updateOrderById } from "@/lib/db";

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const locatedOrder = getOrderById(id);

  if (!locatedOrder) {
    return NextResponse.json(
      { error: "Purchase order not found for the given identifier." },
      { status: 404 }
    );
  }

  return NextResponse.json(locatedOrder);
};

export const PUT = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  try {
    const amendmentData = await request.json();
    const amendedOrder = updateOrderById(id, amendmentData);

    if (!amendedOrder) {
      return NextResponse.json(
        { error: "Cannot amend — order record does not exist." },
        { status: 404 }
      );
    }

    return NextResponse.json(amendedOrder);
  } catch {
    return NextResponse.json(
      { error: "Malformed payload — JSON structure expected." },
      { status: 400 }
    );
  }
};

export const DELETE = async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const removed = deleteOrderById(id);

  if (!removed) {
    return NextResponse.json(
      { error: "Cancellation failed — no matching order record found." },
      { status: 404 }
    );
  }

  return NextResponse.json({ cancelledOrderId: id });
};
