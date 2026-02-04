"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Banknote } from "lucide-react";

import { recordPartialPaymentAction } from "@/app/(dashboard)/invoices/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  invoiceId: string;
  invoiceTotal: number;
  currency?: string;
};

export function PartialPaymentButton({
  invoiceId,
  invoiceTotal,
  currency = "USD",
}: Props) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [amount, setAmount] = React.useState("");
  const [method, setMethod] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const num = parseFloat(amount);
    if (Number.isNaN(num) || num <= 0) {
      setError("Enter a valid amount greater than 0.");
      return;
    }
    if (num > invoiceTotal) {
      setError(`Amount cannot exceed invoice total (${invoiceTotal.toFixed(2)}).`);
      return;
    }
    startTransition(async () => {
      try {
        await recordPartialPaymentAction(invoiceId, num, method || undefined);
        setAmount("");
        setMethod("");
        setOpen(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to record payment.");
      }
    });
  };

  const currencySymbol = currency === "USD" ? "$" : currency + " ";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
        >
          <Banknote className="mr-1.5 h-4 w-4" />
          Partial payment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Record partial payment</DialogTitle>
            <DialogDescription>
              Enter the amount received. Invoice total: {currencySymbol}
              {invoiceTotal.toFixed(2)}. If total payments reach the invoice total, the invoice will be marked as paid.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="partial-amount">Amount</Label>
              <Input
                id="partial-amount"
                type="number"
                step="0.01"
                min="0.01"
                max={invoiceTotal}
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isPending}
                className="font-mono"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="partial-method">Method (optional)</Label>
              <Input
                id="partial-method"
                type="text"
                placeholder="e.g. Cash, Check, Bank transfer"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                disabled={isPending}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Recording..." : "Record payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
