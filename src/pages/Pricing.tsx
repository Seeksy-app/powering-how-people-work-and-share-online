import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        { text: "Unlimited Studio Recording", included: true },
        { text: "Unlimited Episodes", included: true },
        { text: "Basic Analytics", included: true },
        { text: "1 AI Post-Production per month", included: true },
        { text: "2 AI-Generated Clips per month", included: true },
        { text: "RSS Feed Hosting", included: true },
        { text: "Advanced AI Features", included: false },
        { text: "Unlimited Clips", included: false },
        { text: "Priority Support", included: false },
      ],
      cta: "Start Free",
      popular: false,
    },
    {
      name: "Creator",
      price: "$19",
      period: "per month",
      description: "For serious content creators",
      features: [
        { text: "Everything in Free", included: true },
        { text: "10 AI Post-Productions per month", included: true },
        { text: "20 AI-Generated Clips per month", included: true },
        { text: "Advanced AI Features", included: true },
        { text: "Filler Word Removal", included: true },
        { text: "Noise Reduction", included: true },
        { text: "Auto Chaptering", included: true },
        { text: "Priority Email Support", included: true },
        { text: "Custom Branding", included: false },
      ],
      cta: "Start 14-Day Trial",
      popular: true,
    },
    {
      name: "Pro",
      price: "$49",
      period: "per month",
      description: "For professionals & teams",
      features: [
        { text: "Everything in Creator", included: true },
        { text: "Unlimited AI Post-Productions", included: true },
        { text: "Unlimited AI-Generated Clips", included: true },
        { text: "Multi-Track Handling", included: true },
        { text: "Speaker Separation", included: true },
        { text: "Custom Branding", included: true },
        { text: "API Access", included: true },
        { text: "Priority Support (24/7)", included: true },
        { text: "Team Collaboration", included: true },
      ],
      cta: "Start 14-Day Trial",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-primary cursor-pointer" onClick={() => navigate("/")}>
            Seeksy
          </h2>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate("/auth?mode=login")}>
              Log In
            </Button>
            <Button onClick={() => navigate("/auth?mode=signup")}>
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Creator Pricing</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Studio is always free. Unlock AI-powered editing and clips with our paid plans.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`p-8 relative ${
                plan.popular
                  ? "border-2 border-primary shadow-glow"
                  : "border border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    )}
                    <span
                      className={
                        feature.included
                          ? "text-foreground"
                          : "text-muted-foreground line-through"
                      }
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
                onClick={() => navigate("/auth?mode=signup")}
              >
                {plan.cta}
              </Button>
            </Card>
          ))}
        </div>

        <section className="max-w-4xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-3">Is the Studio really free forever?</h3>
              <p className="text-muted-foreground">
                Yes! Recording, hosting, and publishing unlimited podcast episodes in our Studio
                is completely free, forever. You only pay if you want AI-powered post-production
                features or AI-generated clips.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-3">
                What counts as an AI Post-Production?
              </h3>
              <p className="text-muted-foreground">
                Each time you process a recording with AI features (filler word removal, noise
                reduction, volume leveling, etc.), that counts as one AI post-production. The
                Free plan includes 1 per month, Creator includes 10, and Pro is unlimited.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-3">Can I try before I buy?</h3>
              <p className="text-muted-foreground">
                Absolutely! Start with our Free plan to test the Studio and get a feel for the AI
                features. Paid plans include a 14-day free trial with full access to all
                features.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-3">
                What makes your AI editing different?
              </h3>
              <p className="text-muted-foreground">
                Our AI is specifically trained for podcast content. It understands context,
                preserves natural conversation flow, and can identify the best moments for social
                clips. Unlike generic editors, we optimize for listener engagement.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-3">Can I cancel anytime?</h3>
              <p className="text-muted-foreground">
                Yes! All paid plans are monthly subscriptions that you can cancel at any time. No
                long-term commitments or cancellation fees. Your content and data remain
                accessible even if you downgrade to Free.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-3">Do you offer annual plans?</h3>
              <p className="text-muted-foreground">
                Not yet, but we're working on annual pricing with significant discounts. Join
                our newsletter to be notified when annual plans launch.
              </p>
            </Card>
          </div>
        </section>

        <section className="max-w-6xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center mb-4">How We Compare</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            See how Seeksy stacks up against other podcast platforms
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-semibold">Feature</th>
                  <th className="text-center p-4 font-semibold">
                    <div className="text-primary text-lg">Seeksy</div>
                  </th>
                  <th className="text-center p-4 font-semibold text-muted-foreground">
                    Riverside
                  </th>
                  <th className="text-center p-4 font-semibold text-muted-foreground">
                    Descript
                  </th>
                  <th className="text-center p-4 font-semibold text-muted-foreground">Anchor</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="p-4">Free Studio Recording</td>
                  <td className="text-center p-4">
                    <Check className="h-5 w-5 text-primary mx-auto" />
                  </td>
                  <td className="text-center p-4">
                    <X className="h-5 w-5 text-muted-foreground mx-auto" />
                  </td>
                  <td className="text-center p-4">
                    <X className="h-5 w-5 text-muted-foreground mx-auto" />
                  </td>
                  <td className="text-center p-4">
                    <Check className="h-5 w-5 text-muted-foreground mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4">AI Filler Word Removal</td>
                  <td className="text-center p-4">
                    <Check className="h-5 w-5 text-primary mx-auto" />
                  </td>
                  <td className="text-center p-4">
                    <X className="h-5 w-5 text-muted-foreground mx-auto" />
                  </td>
                  <td className="text-center p-4">
                    <Check className="h-5 w-5 text-muted-foreground mx-auto" />
                  </td>
                  <td className="text-center p-4">
                    <X className="h-5 w-5 text-muted-foreground mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4">AI-Generated Clips</td>
                  <td className="text-center p-4">
                    <Check className="h-5 w-5 text-primary mx-auto" />
                  </td>
                  <td className="text-center p-4">
                    <Check className="h-5 w-5 text-muted-foreground mx-auto" />
                  </td>
                  <td className="text-center p-4">
                    <X className="h-5 w-5 text-muted-foreground mx-auto" />
                  </td>
                  <td className="text-center p-4">
                    <X className="h-5 w-5 text-muted-foreground mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4">Auto Chaptering</td>
                  <td className="text-center p-4">
                    <Check className="h-5 w-5 text-primary mx-auto" />
                  </td>
                  <td className="text-center p-4">
                    <X className="h-5 w-5 text-muted-foreground mx-auto" />
                  </td>
                  <td className="text-center p-4">
                    <X className="h-5 w-5 text-muted-foreground mx-auto" />
                  </td>
                  <td className="text-center p-4">
                    <X className="h-5 w-5 text-muted-foreground mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4">Creator Landing Page</td>
                  <td className="text-center p-4">
                    <Check className="h-5 w-5 text-primary mx-auto" />
                  </td>
                  <td className="text-center p-4">
                    <X className="h-5 w-5 text-muted-foreground mx-auto" />
                  </td>
                  <td className="text-center p-4">
                    <X className="h-5 w-5 text-muted-foreground mx-auto" />
                  </td>
                  <td className="text-center p-4">
                    <X className="h-5 w-5 text-muted-foreground mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4">Ad Monetization Platform</td>
                  <td className="text-center p-4">
                    <Check className="h-5 w-5 text-primary mx-auto" />
                  </td>
                  <td className="text-center p-4">
                    <X className="h-5 w-5 text-muted-foreground mx-auto" />
                  </td>
                  <td className="text-center p-4">
                    <X className="h-5 w-5 text-muted-foreground mx-auto" />
                  </td>
                  <td className="text-center p-4">
                    <Check className="h-5 w-5 text-muted-foreground mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4">Starting Price</td>
                  <td className="text-center p-4 font-semibold text-primary">Free</td>
                  <td className="text-center p-4 text-muted-foreground">$19/mo</td>
                  <td className="text-center p-4 text-muted-foreground">$24/mo</td>
                  <td className="text-center p-4 text-muted-foreground">Free</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="text-center max-w-2xl mx-auto">
          <Card className="p-12 bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-2 border-primary/20">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Creating?</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Join thousands of creators using Seeksy to produce professional-quality podcasts
            </p>
            <Button size="lg" onClick={() => navigate("/auth?mode=signup")}>
              Start Free Today
            </Button>
          </Card>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-muted-foreground mt-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-4">
            <a href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <span className="hidden md:inline">•</span>
            <a href="/terms" className="hover:text-primary transition-colors">
              Terms & Conditions
            </a>
            <span className="hidden md:inline">•</span>
            <a href="/cookies" className="hover:text-primary transition-colors">
              Cookie Policy
            </a>
          </div>
          <p>© 2024 Seeksy. Connecting Your Way.</p>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
