import Link from "next/link";
import { differenceInDays, isAfter, subDays } from "date-fns";

import { RevenueChart } from "@/components/charts/revenue-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Icon } from "@/components/icons";
import { getCurrentUser } from "@/lib/auth";
import { listCustomers } from "@/lib/services/customer-service";
import { listInvoices } from "@/lib/services/invoice-service";
import { listPayments } from "@/lib/services/payment-service";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusVariant = {
  DRAFT: "outline",
  SENT: "secondary",
  PAID: "success",
  OVERDUE: "destructive",
  VOID: "destructive",
} as const;

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const workspaceId = user.workspaceId;
  const [invoices, payments, customers] = await Promise.all([
    listInvoices(workspaceId),
    listPayments(workspaceId),
    listCustomers(workspaceId),
  ]);
  const workspaceName = user.workspaceName ?? "your workspace";

  const outstanding = invoices
    .filter((invoice) => invoice.status !== "PAID" && invoice.status !== "VOID")
    .reduce((acc, invoice) => acc + Number(invoice.total ?? 0), 0);

  const now = new Date();
  const sevenDaysAgo = subDays(now, 7);

  const paidThisWeek = payments
    .filter((payment) =>
      payment.status === "SUCCEEDED" && payment.processedAt && isAfter(payment.processedAt, sevenDaysAgo),
    )
    .reduce((acc, payment) => acc + Number(payment.amount ?? 0), 0);

  const paidDurations = payments
    .filter((payment) => payment.status === "SUCCEEDED" && payment.processedAt && payment.invoice?.issueDate)
    .map((payment) => differenceInDays(payment.processedAt!, payment.invoice!.issueDate));

  const avgPaymentTime = paidDurations.length
    ? paidDurations.reduce((acc, days) => acc + days, 0) / paidDurations.length
    : null;

  const recentInvoices = invoices.slice(0, 5);

  const chartBuckets = new Map<string, { recurring: number; oneOff: number }>();
  invoices.forEach((invoice) => {
    const month = new Date(invoice.issueDate).toLocaleString("en-US", { month: "short" });
    if (!chartBuckets.has(month)) {
      chartBuckets.set(month, { recurring: 0, oneOff: 0 });
    }
    const bucket = chartBuckets.get(month)!;
    const isRecurring = invoice.notes?.toLowerCase().includes("retainer");
    if (isRecurring) {
      bucket.recurring += Number(invoice.total ?? 0);
    } else {
      bucket.oneOff += Number(invoice.total ?? 0);
    }
  });

  const chartData = Array.from(chartBuckets.entries()).map(([month, value]) => ({
    month,
    recurring: value.recurring,
    oneOff: value.oneOff,
  }));

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            Track outstanding invoices, send payment links, and keep cashflow predictable inside the {workspaceName} workspace.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/invoices/new">
            <Icon name="plus" className="size-4" />
            Draft invoice
          </Link>
        </Button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Outstanding balance</CardDescription>
            <CardTitle>{formatCurrency(outstanding)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Across {invoices.filter((invoice) => invoice.status !== "PAID").length} open invoices.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Paid this week</CardDescription>
            <CardTitle>{formatCurrency(paidThisWeek)}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-emerald-600">
            <Icon name="arrowRight" className="size-4 rotate-90" />
            {payments.filter((payment) => 
              payment.status === "SUCCEEDED" && 
              payment.processedAt && 
              isAfter(payment.processedAt, sevenDaysAgo)
            ).length} successful payments
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Avg. payment time</CardDescription>
            <CardTitle>{avgPaymentTime ? `${avgPaymentTime.toFixed(1)} days` : "N/A"}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Based on recently settled invoices.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Active customers</CardDescription>
            <CardTitle>{customers.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Manage relationships and reminders.</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Revenue trend</CardTitle>
            <CardDescription>Recurring retainers plus one-off projects.</CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            <RevenueChart data={chartData.length ? chartData : undefined} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Latest activity</CardTitle>
            <CardDescription>Updates from Square payments.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {payments.slice(0, 2).map((payment) => (
              <div key={payment.id} className="flex items-start gap-3 rounded-lg border border-border/60 p-3">
                <span className="rounded-full bg-primary/10 p-2 text-primary">
                  <Icon name={payment.status === "SUCCEEDED" ? "shield" : "mail"} className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {payment.status === "SUCCEEDED" ? "Payment received" : "Payment update"} ·
                    {" "}
                    {payment.invoice?.number}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {payment.invoice?.customer?.businessName ?? ""} · {formatCurrency(Number(payment.amount ?? 0))}
                  </p>
                </div>
              </div>
            ))}
            {payments.length === 0 && (
              <p className="text-sm text-muted-foreground">No payments tracked yet. Create an invoice to get started.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Recent invoices</CardTitle>
                <CardDescription>Stay ahead of overdue balances.</CardDescription>
              </div>
              <Button variant="outline" asChild>
                <Link href="/invoices">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.number}</TableCell>
                    <TableCell>{invoice.customer.businessName}</TableCell>
                    <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                    <TableCell>{formatCurrency(Number(invoice.total ?? 0))}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[invoice.status]}>{invoice.status.toLowerCase()}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {recentInvoices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                      No invoices yet. Create your first invoice to populate this view.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
