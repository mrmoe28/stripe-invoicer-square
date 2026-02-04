import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Debug endpoint: list recent payments for the current workspace.
 * Only available when authenticated.
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    const payments = await prisma.payment.findMany({
      where: {
        invoice: { workspaceId: user.workspaceId },
      },
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        invoice: { select: { number: true, total: true } },
      },
    });
    return NextResponse.json({ payments });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
