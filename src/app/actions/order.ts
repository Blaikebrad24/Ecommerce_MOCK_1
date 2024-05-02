"use server";

import prismaDBConnection from "@/db/db";


//is there an order for this product if so return true/false
export async function userOrderExists(email: string, productId: string) {
    return (
      (await prismaDBConnection.order.findFirst({
        where: { user: { email }, productId },
        select: { id: true },
      })) != null
    )
  }