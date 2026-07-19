import { purchaseOrders } from "@/lib/gameVault";
import { NextResponse } from "next/server";
import { z } from "zod";

const OrderSubmissionSchema = z.object({
  gameId: z.string().min(1, { message: "A valid game identifier is required." }),
  unitCount: z.number().positive({ message: "Unit count must be at least one." }),
  deliveryState: z.string().min(1, { message: "Delivery state must be declared at order creation." }),
  customerId: z.string().min(1, { message: "Customer identifier is mandatory." }),
  grandTotal: z.number().positive({ message: "Grand total must reflect a positive value." }),
});

export const GET = async () => {
  return NextResponse.json(purchaseOrders);
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

  const committedOrder = {
    id: `po${purchaseOrders.length + 1}`,
    ...schemaResult.data,
  };

  purchaseOrders.push(committedOrder);
  return NextResponse.json(committedOrder, { status: 201 });
};
