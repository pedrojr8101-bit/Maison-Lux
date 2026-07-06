import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfMonth, startOfDay, subDays, format } from "date-fns";

// GET /api/admin/dashboard — métricas principais para o dashboard do lojista
export async function GET() {
  const monthStart = startOfMonth(new Date());

  const [ordersThisMonth, paidOrdersThisMonth, weeklyOrders] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: monthStart }, status: { not: "CANCELADO" } },
      select: { total: true },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: monthStart }, status: "PAGO" },
      select: { total: true },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: subDays(startOfDay(new Date()), 6) }, status: { not: "CANCELADO" } },
      select: { total: true, createdAt: true },
    }),
  ]);

  const totalSalesMonth = ordersThisMonth.reduce((sum, o) => sum + Number(o.total), 0);
  const totalOrdersMonth = ordersThisMonth.length;
  const avgTicket = totalOrdersMonth > 0 ? totalSalesMonth / totalOrdersMonth : 0;

  // Monta os últimos 7 dias, mesmo os que não tiveram vendas (para o gráfico ficar completo)
  const revenueByDay: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const day = format(subDays(new Date(), i), "dd/MM");
    revenueByDay[day] = 0;
  }
  weeklyOrders.forEach((order) => {
    const day = format(order.createdAt, "dd/MM");
    if (day in revenueByDay) revenueByDay[day] += Number(order.total);
  });

  const weeklyChart = Object.entries(revenueByDay).map(([day, total]) => ({
    day,
    total: Number(total.toFixed(2)),
  }));

  return NextResponse.json({
    totalSalesMonth: Number(totalSalesMonth.toFixed(2)),
    totalOrdersMonth,
    avgTicket: Number(avgTicket.toFixed(2)),
    paidOrdersMonth: paidOrdersThisMonth.length,
    weeklyChart,
  });
}
