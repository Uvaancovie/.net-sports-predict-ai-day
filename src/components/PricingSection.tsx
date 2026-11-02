import React, { useState } from 'react';
import {
  Check,
  Sparkles,
  Zap,
  ShieldCheck,
  CreditCard,
  Building2,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { PlanTier, BillingInterval, PlanPricing } from '../types/subscription';

interface PricingSectionProps {
  onSelectPlan: (planId: PlanTier, interval: BillingInterval) => void;
  activePlanId?: PlanTier;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  onSelectPlan,
  activePlanId,
}) => {
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly');

  const plans: PlanPricing[] = [
    {
      id: 'free',
      name: 'Free Trial',
      tagline: 'Test the live predictor before upgrading',
      monthlyZar: 0,
      annualMonthlyZar: 0,
      trialDays: 7,
      ctaText: 'Start 7-Day Free Trial',
      features: [
        '5 match simulations per day',
        'Standard Odds API market lines (UK & US)',
        'Basic vig-removal calculation',
        'Head-to-head recent 3 encounters',
        'Community Durban session slides access',
      ],
      notIncluded: [
        'Unlimited 10,000 Monte Carlo simulations',
        'Live +EV value bet arbitrage alerts',
        'Kelly Criterion bankroll sizing',
        'Full Poisson scoreline heatmap matrix',
        'Downloadable C# predictive engine code',
      ],
    },
    {
      id: 'pro',
      name: 'Pro Punter',
      badge: 'Most Popular',
      popular: true,
      tagline: 'For serious bettors seeking empirical edges',
      monthlyZar: 249,
      annualMonthlyZar: 199,
      ctaText: 'Upgrade to Pro Punter',
      features: [
        'Unlimited 10,000-run Monte Carlo simulations',
        'Live real-time +EV value alerts (> +3% edge)',
        'Fractional Kelly Criterion bankroll sizing',
        'Comprehensive 5-game H2H form ribbons & history',
        'Poisson exact scoreline probability distribution',
        'WhatsApp & Telegram value bet webhook alerts',
        'Instant EFT (Capitec Pay) & Card support',
      ],
      notIncluded: [
        'Full Odds API raw proxy endpoints & key',
        'Downloadable C#/.NET 9 prediction engine code',
        'Dedicated 1-on-1 Durban speaker VIP onboarding',
      ],
    },
    {
      id: 'syndicate',
      name: 'Syndicate Enterprise',
      badge: 'Full Architecture',
      tagline: 'For betting syndicates, funds & engineering teams',
      monthlyZar: 899,
      annualMonthlyZar: 719,
      ctaText: 'Get Syndicate License',
      features: [
        'Everything in Pro Punter tier',
        'Direct Odds API proxy endpoint access & custom key',
        'Exportable C#/.NET 9 predictive engine source code',
        'Custom model weights (Home advantage, Poisson decay)',
        'Multi-seat access for up to 5 team analysts',
        'High-concurrency parallel API endpoints',
        'Priority technical support & direct Durban speaker channel',
      ],
    },
  ];

  return (
    <section id="pricing" className="py-16 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold">
            <CreditCard className="w-3.5 h-3.5" />
            <span>South African Rand (ZAR) Subscription Tiers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Transparent, Quantitative Value.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Choose the subscription that fits your bankroll. All plans include full access to our South African
            Durban conference engine, instant EFT via Capitec Pay, and 7-day money-back guarantee.
          </p>

          {/* Billing Switch: Monthly vs Annual (Save 20%) */}
          <div className="pt-2 flex items-center justify-center gap-3 text-xs font-semibold">
            <span className={billingInterval === 'monthly' ? 'text-slate-900 font-bold' : 'text-slate-500'}>
              Billed Monthly
            </span>
            <button
              type="button"
              onClick={() => setBillingInterval(billingInterval === 'monthly' ? 'annual' : 'monthly')}
              className="relative inline-flex h-6 w-12 items-center rounded-full bg-slate-300 transition-colors focus:outline-none"
              style={{ backgroundColor: billingInterval === 'annual' ? '#0284C7' : '#CBD5E1' }}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingInterval === 'annual' ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={billingInterval === 'annual' ? 'text-slate-900 font-bold' : 'text-slate-500'}>
              Billed Annually{' '}
              <span className="ml-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map(plan => {
            const isPro = plan.popular;
            const price = billingInterval === 'annual' ? plan.annualMonthlyZar : plan.monthlyZar;
            const isCurrent = activePlanId === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-7 flex flex-col justify-between transition-all duration-300 ${
                  isPro
                    ? 'glass-card bg-white/95 border-2 border-cyan-400 shadow-[0_20px_50px_rgba(14,165,233,0.12)] scale-100 lg:scale-[1.03] z-10'
                    : 'glass-card bg-white/75 border border-white/80 shadow-[0_10px_35px_rgba(0,0,0,0.03)]'
                }`}
              >
                {/* Popular Pill */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="px-3.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider text-white bg-gradient-to-r from-cyan-600 to-emerald-600 shadow-md">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Plan Name & Tagline */}
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-snug">{plan.tagline}</p>
                  </div>

                  {/* Price in ZAR */}
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
                        R{price}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        / month
                      </span>
                    </div>

                    {/* Zero-Pill Text Interpuncts */}
                    <div className="text-[11px] text-slate-500 font-mono">
                      {plan.monthlyZar === 0 ? (
                        <span>7-day unrestricted trial · No credit card required</span>
                      ) : billingInterval === 'annual' ? (
                        <span>Billed annually (R{price * 12}/yr) · Cancel anytime</span>
                      ) : (
                        <span>Billed monthly · Cancel anytime · Instant activation</span>
                      )}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => onSelectPlan(plan.id, billingInterval)}
                    className={`w-full py-3.5 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
                      isCurrent
                        ? 'bg-emerald-600 text-white cursor-default'
                        : isPro
                        ? 'text-white bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 shadow-md shadow-cyan-600/20 hover:scale-[1.01]'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {isCurrent ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Active Plan</span>
                      </>
                    ) : (
                      <>
                        <span>{plan.ctaText}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  {/* Feature List */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Included with {plan.name}:
                    </div>
                    <ul className="space-y-2.5 text-xs text-slate-600">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                          <span className="leading-tight">{feature}</span>
                        </li>
                      ))}

                      {plan.notIncluded?.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-slate-400">
                          <div className="w-4 h-4 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                            ✕
                          </div>
                          <span className="leading-tight line-through opacity-70">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer Assurance */}
                <div className="pt-6 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>South African Instant EFT &amp; 3D Secure Card</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Responsible Gambling Notice */}
        <div className="text-center text-xs text-slate-500 max-w-xl mx-auto pt-6 border-t border-slate-200/60 space-y-1">
          <p className="font-semibold text-slate-700">
            Responsible Sports Modeling &amp; Analytics
          </p>
          <p>
            Uvaan's Bet Predict provides quantitative statistical modeling and expected value analysis. We advocate strict
            bankroll discipline using fractional Kelly stakes. 18+ only.
          </p>
        </div>
      </div>
    </section>
  );
};
