import type { Metadata } from "next";
import Link from "next/link";

import { InvoiceForm } from "@/components/forms/invoice-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { listCustomers } from "@/lib/services/customer-service";
import { getTemplate } from "@/lib/templates";

export const metadata: Metadata = {
  title: "New invoice",
};

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams?: Promise<{ customerId?: string; template?: string }>;
}) {
  const user = await getCurrentUser();
  const customers = await listCustomers(user.workspaceId);
  const resolvedSearchParams = await searchParams;
  const requestedCustomerId = resolvedSearchParams?.customerId;
  const requestedTemplate = resolvedSearchParams?.template;
  const selectedTemplate = requestedTemplate ? getTemplate(requestedTemplate) : null;
  const defaultCustomerId = customers.some((customer) => customer.id === requestedCustomerId)
    ? requestedCustomerId
    : undefined;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-2xl">
              {selectedTemplate ? `New ${selectedTemplate.name}` : "New invoice"}
            </CardTitle>
            <CardDescription>
              {selectedTemplate 
                ? `Using ${selectedTemplate.name} template - ${selectedTemplate.description}`
                : "Build an invoice, generate a Square payment link, and send it in minutes."
              }
            </CardDescription>
          </div>
          <Button variant="outline" asChild>
            <Link href="/invoices">Back to invoices</Link>
          </Button>
        </CardHeader>
      </Card>

      {customers.length === 0 ? (
        <Card>
          <CardContent className="space-y-4 py-12 text-center text-sm text-muted-foreground">
            <p>Add a customer before creating invoices. Import Square customers in Settings or add one manually.</p>
            <Button asChild variant="secondary" size="sm">
              <Link href="/customers/new">Create customer</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-6">
            <InvoiceForm
              customers={customers.map((customer) => ({
                id: customer.id,
                businessName: customer.businessName,
                email: customer.email,
              }))}
              defaultCustomerId={defaultCustomerId}
              template={selectedTemplate}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
