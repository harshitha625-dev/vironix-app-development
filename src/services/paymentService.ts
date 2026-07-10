/**
 * Payment orchestration. The actual checkout UI comes from each provider's
 * native/React Native SDK (react-native-razorpay or @stripe/stripe-react-native) —
 * install whichever you need and fill in the two functions below. Kept behind
 * one interface so screens (Pricing/Wallet) don't care which provider is live.
 */
export type PaymentProvider = 'razorpay' | 'stripe';

export interface PaymentResult {
  success: boolean;
  providerPaymentId?: string;
  error?: string;
}

export async function startCheckout(opts: {
  provider: PaymentProvider;
  amountInr: number;
  description: string;
}): Promise<PaymentResult> {
  // Example wiring for Razorpay once the SDK is installed:
  //
  //   import RazorpayCheckout from 'react-native-razorpay';
  //   const order = await createOrderOnYourBackend(opts.amountInr); // Edge Function
  //   const result = await RazorpayCheckout.open({
  //     key: RAZORPAY_KEY_ID,
  //     amount: opts.amountInr * 100,
  //     currency: 'INR',
  //     name: 'VEYTRIX',
  //     description: opts.description,
  //     order_id: order.id,
  //   });
  //   return { success: true, providerPaymentId: result.razorpay_payment_id };

  console.log('[payments] startCheckout (stub)', opts);
  await new Promise((r) => setTimeout(r, 900));
  return { success: true, providerPaymentId: `demo_${Date.now()}` };
}
