import { NextResponse } from "next/server";
import { z } from "zod";
import { createOrder, listOrders } from "@/lib/db";

const OrderSubmissionSchema = z.object({
  gameId: z.string().min(1, { message: "A valid game identifier is required." }),
  unitCount: z.number().positive({ message: "Unit count must be at least one." }),
  deliveryState: z.string().min(1, { message: "Delivery state must be declared at order creation." }),
  customerId: z.string().min(1, { message: "Customer identifier is mandatory." }),
  grandTotal: z.number().positive({ message: "Grand total must reflect a positive value." }),
});

export const GET = async () => {
  return NextResponse.json(listOrders());
};

export const POST = async (request: Request) => {
  const requestBody = await request.json();
  const schemaResult = OrderSubmissionSchema.safeParse(requestBody);

  if (!schemaResult.success) {
    return NextResponse.json(
      { error: schemaResult.error.issues },
      { status: 422 }
    );
  }

  const committedOrder = createOrder(schemaResult.data);
  return NextResponse.json(committedOrder, { status: 201 });
};
