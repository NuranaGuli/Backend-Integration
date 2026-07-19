import { purchaseOrders } from "@/lib/gameVault";
import { NextResponse } from "next/server";

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const locatedOrder = purchaseOrders.find((po) => po.id === id);

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
  const orderToAmend = purchaseOrders.find((po) => po.id === id);

  if (!orderToAmend) {
    return NextResponse.json(
      { error: "Cannot amend — order record does not exist." },
      { status: 404 }
    );
  }

  try {
    const amendmentData = await request.json();
    Object.assign(orderToAmend, amendmentData);
  } catch {
    return NextResponse.json(
      { error: "Malformed payload — JSON structure expected." },
      { status: 400 }
    );
  }

  return NextResponse.json(orderToAmend);
};

export const DELETE = async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const orderToCancel = purchaseOrders.find((po) => po.id === id);

  if (!orderToCancel) {
    return NextResponse.json(
      { error: "Cancellation failed — no matching order record found." },
      { status: 404 }
    );
  }

  const remainingOrders = purchaseOrders.filter((po) => po.id !== orderToCancel.id);
  purchaseOrders.length = 0;
  purchaseOrders.push(...remainingOrders);

  return NextResponse.json({ cancelledOrderId: orderToCancel.id });
};
