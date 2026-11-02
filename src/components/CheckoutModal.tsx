import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Building,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Lock,
  ArrowRight,
  Smartphone,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import {
  PlanTier,
  BillingInterval,
  PaymentMethod,
  BankOption,
  SubscriptionRecord,
  CheckoutRequest,
} from '../types/subscription';
import { api } from '../services/api';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlanId?: PlanTier;
  initialInterval?: BillingInterval;
  onSubscriptionSuccess: (subscription: SubscriptionRecord) => void;
}

const SA_BANKS: BankOption[] = [
  { id: 'Capitec Pay', name: 'Capitec Pay', color: 'from-sky-500 to-red-500', badge: 'Real-Time' },
  { id: 'FNB', name: 'First National Bank (FNB)', color: 'from-teal-600 to-amber-500', badge: 'Instant EFT' },
  { id: 'Standard Bank', name: 'Standard Bank', color: 'from-blue-600 to-blue-800', badge: 'Instant EFT' },
  { id: 'Nedbank', name: 'Nedbank Money', color: 'from-emerald-700 to-emerald-900', badge: 'Instant EFT' },
  { id: 'ABSA', name: 'ABSA Bank', color: 'from-rose-600 to-rose-800', badge: 'Instant EFT' },
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  initialPlanId = 'pro',
  initialInterval = 'monthly',
  onSubscriptionSuccess,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>(initialPlanId);
  const [billingInterval, setBillingInterval] = useState<BillingInterval>(initialInterval);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [selectedBank, setSelectedBank] = useState<string>('Capitec Pay');

  // Customer form inputs
  const [customerName, setCustomerName] = useState('Uvaan Govender');
  const [customerEmail, setCustomerEmail] = useState('uvaan.govender@sportsai.co.za');
  const [cardNumber, setCardNumber] = useState('4532 8920 1827 4242');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('781');
  const [eftPhone, setEftPhone] = useState('+27 82 459 1029');

  // Multi-step modal flow
  const [step, setStep] = useState<'checkout' | '3ds_challenge' | 'eft_push' | 'success'>('checkout');
  const [otpCode, setOtpCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeSubscription, setActiveSubscription] = useState<SubscriptionRecord | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    if (initialPlanId) setSelectedPlan(initialPlanId);
    if (initialInterval) setBillingInterval(initialInterval);
    setStep('checkout');
    setErrorMessage('');
  }, [initialPlanId, initialInterval, isOpen]);

  if (!isOpen) return null;

  // Pricing computations
  let unitMonthlyPrice = 249;
  let planName = 'Pro Punter';

  if (selectedPlan === 'free') {
    unitMonthlyPrice = 0;
    planName = 'Free Trial (7-Day)';
  } else if (selectedPlan === 'pro') {
    unitMonthlyPrice = billingInterval === 'annual' ? 199 : 249;
    planName = 'Pro Punter';
  } else if (selectedPlan === 'syndicate') {
    unitMonthlyPrice = billingInterval === 'annual' ? 719 : 899;
    planName = 'Syndicate Enterprise';
  }

  const totalPriceZar = selectedPlan === 'free' ? 0 : billingInterval === 'annual' ? unitMonthlyPrice * 12 : unitMonthlyPrice;
  const vatZar = Math.round((totalPriceZar * 15) / 115 * 100) / 100;
  const subtotalZar = Math.round((totalPriceZar - vatZar) * 100) / 100;

  // Format credit card input
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  // Submit checkout form
  const handleInitiatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (selectedPlan === 'free') {
      // Free trial skips payment processing
      completeCheckout();
      return;
    }

    if (paymentMethod === 'card') {
      setStep('3ds_challenge');
    } else {
      setStep('eft_push');
    }
  };

  // Complete checkout API call
  const completeCheckout = async () => {
    setIsProcessing(true);
    setErrorMessage('');
    try {
      const payload: CheckoutRequest = {
        planId: selectedPlan,
        billingInterval,
        paymentMethod,
        customerName,
        customerEmail,
        cardDetails: {
          cardNumberLast4: cardNumber.replace(/\s/g, '').slice(-4) || '4242',
          cardHolder: customerName,
          expiry: cardExpiry,
        },
        eftDetails: {
          bank: selectedBank,
          accountHolderPhone: eftPhone,
        },
      };

      const result = await api.simulateCheckout(payload);
      setActiveSubscription(result);
      onSubscriptionSuccess(result);
      setStep('success');
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment simulation failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Copy license key to clipboard
  const handleCopyKey = () => {
    if (!activeSubscription?.licenseKey) return;
    navigator.clipboard.writeText(activeSubscription.licenseKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  // Download Simulated PDF / Tax Invoice Receipt
  const handleDownloadReceipt = () => {
    if (!activeSubscription) return;
    const invoiceText = `=======================================================
       UVAAN'S BET PREDICT — OFFICIAL TAX INVOICE
               (Data & AI Durban 2026 Edition)
=======================================================
Invoice Reference:  ${activeSubscription.txRef}
Date of Issue:      ${new Date(activeSubscription.createdAt).toLocaleString('en-ZA')}
Customer Name:      ${activeSubscription.customerName}
Customer Email:     ${activeSubscription.customerEmail}
-------------------------------------------------------
Subscription Plan:  ${activeSubscription.planName}
Billing Cycle:      ${activeSubscription.billingInterval === 'annual' ? 'Annually (Save 20%)' : 'Monthly'}
Status:             ${activeSubscription.status.toUpperCase()}
License Key:        ${activeSubscription.licenseKey}
Valid Until:        ${new Date(activeSubscription.expiresAt).toLocaleDateString('en-ZA')}
-------------------------------------------------------
Subtotal (Excl VAT): R${(activeSubscription.amountZar - activeSubscription.vatZar).toFixed(2)}
15% RSA VAT:         R${activeSubscription.vatZar.toFixed(2)}
-------------------------------------------------------
TOTAL PAID (ZAR):    R${activeSubscription.amountZar.toFixed(2)}
Payment Method:     ${activeSubscription.paymentDetailsSummary}
=======================================================
Thank you for subscribing to Uvaan's Bet Predict!
Conference session: Data & AI Community Day Durban 2026
Umhlanga, Durban · https://betpredict.co.za
=======================================================`;

    const blob = new Blob([invoiceText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BetPredict_Receipt_${activeSubscription.txRef}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/90 shadow-[0_25px_60px_rgba(15,23,42,0.18)] overflow-hidden my-8">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-600 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                {step === 'success' ? 'Subscription Activated' : "Uvaan's Bet Predict Checkout"}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                South African Rand (ZAR) · Secure 256-bit SSL Gateway
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* STEP 1: CHECKOUT FORM */}
        {/* ======================================================== */}
        {step === 'checkout' && (
          <form onSubmit={handleInitiatePayment} className="p-6 space-y-6">
            {/* Plan Selector Radio Row */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                1. Select Subscription Tier
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'free' as PlanTier, label: 'Free Trial', price: 'R0', sub: '7 days' },
                  { id: 'pro' as PlanTier, label: 'Pro Punter', price: billingInterval === 'annual' ? 'R199/m' : 'R249/m', sub: 'Popular' },
                  { id: 'syndicate' as PlanTier, label: 'Syndicate', price: billingInterval === 'annual' ? 'R719/m' : 'R899/m', sub: 'API & C#' },
                ].map(p => {
                  const isSelected = selectedPlan === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPlan(p.id)}
                      className={`p-3 rounded-2xl text-left border transition-all ${
                        isSelected
                          ? 'bg-cyan-50/70 border-cyan-400 ring-2 ring-cyan-200 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-900">{p.label}</div>
                      <div className="font-mono text-sm font-extrabold text-cyan-800">{p.price}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{p.sub}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Billing Interval Toggle (Only for paid plans) */}
            {selectedPlan !== 'free' && (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Billing Interval</span>
                <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200 font-medium">
                  <button
                    type="button"
                    onClick={() => setBillingInterval('monthly')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      billingInterval === 'monthly' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingInterval('annual')}
                    className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                      billingInterval === 'annual' ? 'bg-cyan-700 text-white font-bold' : 'text-slate-600'
                    }`}
                  >
                    <span>Annual</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 rounded font-bold">
                      -20%
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Full Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="glass-input w-full px-3 py-2 text-xs"
                  placeholder="e.g. Sipho Sithole"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Email Address (for License Key)</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  className="glass-input w-full px-3 py-2 text-xs"
                  placeholder="name@domain.co.za"
                />
              </div>
            </div>

            {/* Payment Method Switcher (if not free) */}
            {selectedPlan !== 'free' && (
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  2. Choose South African Payment Method
                </label>

                {/* Tabs */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                      paymentMethod === 'card'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Credit &amp; Debit Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('instant_eft')}
                    className={`p-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                      paymentMethod === 'instant_eft'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Building className="w-4 h-4" />
                    <span>Instant EFT (SA Banks)</span>
                  </button>
                </div>

                {/* Card Fields */}
                {paymentMethod === 'card' && (
                  <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-600">
                        <span className="font-semibold">Card Number</span>
                        <span className="font-mono text-[10px] text-slate-400">Visa / Mastercard / Amex</span>
                      </div>
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className="glass-input w-full px-3 py-2 text-xs font-mono"
                        placeholder="4532 •••• •••• ••••"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          className="glass-input w-full px-3 py-2 text-xs font-mono"
                          placeholder="08/28"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">CVV / CVC</label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          value={cardCvv}
                          onChange={e => setCardCvv(e.target.value)}
                          className="glass-input w-full px-3 py-2 text-xs font-mono"
                          placeholder="•••"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Instant EFT SA Bank Selector */}
                {paymentMethod === 'instant_eft' && (
                  <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                    <label className="text-[11px] font-semibold text-slate-600">Select Your South African Bank</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {SA_BANKS.map(b => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setSelectedBank(b.id)}
                          className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                            selectedBank === b.id
                              ? 'bg-cyan-50 border-cyan-400 text-cyan-900 font-bold'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <span className="text-xs">{b.name}</span>
                          <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {b.badge}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="space-y-1 pt-1">
                      <label className="text-[11px] font-semibold text-slate-600">
                        Capitec Pay Phone / SA Bank Registered Number
                      </label>
                      <input
                        type="text"
                        value={eftPhone}
                        onChange={e => setEftPhone(e.target.value)}
                        className="glass-input w-full px-3 py-2 text-xs font-mono"
                        placeholder="+27 82 ••• ••••"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Order Summary Well */}
            <div className="p-4 rounded-2xl bg-slate-100/70 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>{planName} ({billingInterval})</span>
                <span className="font-mono font-semibold">R{subtotalZar.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>15% South African VAT (Included)</span>
                <span className="font-mono">R{vatZar.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-900 font-bold pt-1 border-t border-slate-200 text-sm">
                <span>Total Due Now (ZAR)</span>
                <span className="font-mono text-cyan-800 text-base">R{totalPriceZar.toFixed(2)}</span>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex-1 py-3 px-6 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 shadow-md shadow-cyan-600/25 transition-all flex items-center justify-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>
                  {selectedPlan === 'free'
                    ? 'Activate 7-Day Free Pass'
                    : `Authorize R${totalPriceZar.toFixed(2)} in ZAR`}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* STEP 2A: MOCK 3D SECURE OTP CHALLENGE (CARD) */}
        {/* ======================================================== */}
        {step === '3ds_challenge' && (
          <div className="p-8 space-y-6 text-center max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 mx-auto">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">3D Secure Bank Verification</h3>
              <p className="text-xs text-slate-500">
                A verification one-time PIN (OTP) has been sent to your registered South African mobile ending in{' '}
                <strong className="text-slate-800">••34</strong>.
              </p>
            </div>

            {/* Mock OTP prompt */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <label className="text-xs font-semibold text-slate-700 block">
                Enter 6-Digit One-Time PIN
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={e => setOtpCode(e.target.value)}
                placeholder="849201"
                className="glass-input w-48 text-center text-lg tracking-widest font-mono font-bold mx-auto px-3 py-2"
              />
              <button
                type="button"
                onClick={() => setOtpCode('849201')}
                className="text-[11px] text-cyan-700 hover:underline font-semibold block mx-auto"
              >
                Auto-fill test demo OTP (849201)
              </button>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
              >
                Back
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={completeCheckout}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 flex items-center justify-center gap-2 shadow-md shadow-cyan-600/20"
              >
                {isProcessing ? (
                  <span>Authorizing with Bank...</span>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Authorize &amp; Issue License</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 2B: MOCK INSTANT EFT APP PUSH (SA BANKS) */}
        {/* ======================================================== */}
        {step === 'eft_push' && (
          <div className="p-8 space-y-6 text-center max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
              <Smartphone className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">{selectedBank} Payment Request</h3>
              <p className="text-xs text-slate-500">
                Please open your <strong className="text-slate-800">{selectedBank}</strong> app on your smartphone to
                approve the payment of <strong className="font-mono text-cyan-800">R{totalPriceZar.toFixed(2)}</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 space-y-2">
              <div className="font-bold flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                <span>Awaiting Banking App Approval</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                Capitec Pay / EFT Real-Time Clearing reference: TXN-ZA-2026
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={completeCheckout}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
              >
                {isProcessing ? (
                  <span>Verifying Real-Time Clearance...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Simulate App Push Approval</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 3: SUCCESS STATE & LICENSE RECEIPT */}
        {/* ======================================================== */}
        {step === 'success' && activeSubscription && (
          <div className="p-6 sm:p-8 space-y-6 text-center">
            {/* Success Icon */}
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-slate-900">
                Payment Authorized &amp; License Active!
              </h3>
              <p className="text-xs text-slate-500">
                Welcome to Uvaan's Bet Predict. Your subscription has been recorded in the Durban .NET engine.
              </p>
            </div>

            {/* Monospace License Key Box */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 text-left">
              <div className="flex items-center justify-between text-[11px] text-slate-400 uppercase tracking-widest font-mono">
                <span>Active License Key</span>
                <span className="text-emerald-400 font-bold">256-bit Signed</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-sm sm:text-base font-bold text-cyan-400 tracking-wider break-all">
                  {activeSubscription.licenseKey}
                </span>
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Receipt Summary Table */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-2 text-left">
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-medium">Plan</span>
                <span className="font-bold text-slate-900">{activeSubscription.planName}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-medium">Amount Paid</span>
                <span className="font-mono font-bold text-emerald-700">R{activeSubscription.amountZar.toFixed(2)} ZAR</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-medium">Transaction Ref</span>
                <span className="font-mono text-slate-700">{activeSubscription.txRef}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-medium">Billing Valid Until</span>
                <span className="font-mono text-slate-700">
                  {new Date(activeSubscription.expiresAt).toLocaleDateString('en-ZA', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-200 text-[11px]">
                <span>Payment Route</span>
                <span className="text-slate-500">{activeSubscription.paymentDetailsSummary}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleDownloadReceipt}
                className="flex-1 py-3 px-4 rounded-2xl text-xs font-bold text-slate-800 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4 text-cyan-600" />
                <span>Download Tax Invoice (TXT)</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-6 rounded-2xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-md shadow-slate-900/20 flex items-center justify-center gap-2 transition-all"
              >
                <span>Launch Pro Predictor</span>
                <ArrowRight className="w-4 h-4 text-cyan-400" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
