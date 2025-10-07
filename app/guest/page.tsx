import { GuestInvoiceForm } from "@/components/guest/guest-invoice-form";

export default function GuestPage() {
  return (
    <div className="min-h-screen bg-muted/50 px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Try Ledgerflow Free
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create up to 3 professional invoices for free. No signup required to get started.
          </p>
        </div>

        {/* Invoice Form */}
        <GuestInvoiceForm />

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-semibold">Professional Invoices</h3>
            <p className="text-sm text-muted-foreground">
              Create beautiful, professional invoices in minutes
            </p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold">Instant Creation</h3>
            <p className="text-sm text-muted-foreground">
              No signup required to start creating invoices right away
            </p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="font-semibold">Secure & Private</h3>
            <p className="text-sm text-muted-foreground">
              Your data is stored securely in your browser
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}