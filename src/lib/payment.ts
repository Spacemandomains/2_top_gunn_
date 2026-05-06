/**
 * Verifies a Stripe payment session token against the Stripe API.
 * Returns true if the session is paid, false otherwise.
 */
export async function verifyStripeSession(
  sessionId: string,
  stripeSecretKey: string
): Promise<boolean> {
  const res = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
    {
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
      },
    }
  );

  if (!res.ok) return false;

  const session = (await res.json()) as { payment_status?: string };
  return session.payment_status === "paid";
}

export function buildPaymentRequired(paymentUrl: string, walletAddress?: string) {
  return {
    error: "payment_required" as const,
    message:
      "This audit costs $1.50 USDC. Complete payment and retry with the " +
      "X-Payment-Token header set to your Stripe session ID.",
    amount: "1.50",
    currency: "USDC" as const,
    paymentUrl,
    ...(walletAddress ? { walletAddress } : {}),
  };
}
