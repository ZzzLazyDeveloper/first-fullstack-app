import './Pricing.css'

const plans = [
  {
    name: 'Starter',
    price: '0',
    period: 'forever',
    description: 'Perfect for side projects and learning.',
    features: [
      '1,000 API calls/month',
      'Basic analytics',
      'Community support',
      '1 team member',
    ],
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '29',
    period: 'per month',
    description: 'For growing teams that need more power.',
    features: [
      '100,000 API calls/month',
      'Advanced analytics',
      'Priority support',
      'Up to 10 team members',
      'Custom integrations',
    ],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    description: 'For organizations with advanced needs.',
    features: [
      'Unlimited API calls',
      'Dedicated infrastructure',
      '24/7 phone support',
      'Unlimited team members',
      'SLA guarantee',
      'Custom AI models',
    ],
    highlighted: false,
  },
]

function Pricing() {
  return (
    <section className="pricing" id="pricing">
      <div className="pricing__container">
        <div className="pricing__header">
          <span className="pricing__label">Pricing</span>
          <h2 className="pricing__title">Simple, transparent pricing</h2>
          <p className="pricing__subtitle">
            Start free and scale as you grow. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="pricing__grid">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`pricing__card ${plan.highlighted ? 'pricing__card--highlighted' : ''}`}
            >
              {plan.highlighted && (
                <span className="pricing__badge">Most Popular</span>
              )}

              <h3 className="pricing__plan-name">{plan.name}</h3>
              <p className="pricing__plan-desc">{plan.description}</p>

              <div className="pricing__price">
                {plan.price === 'Custom' ? (
                  <span className="pricing__amount">Custom</span>
                ) : (
                  <>
                    <span className="pricing__currency">$</span>
                    <span className="pricing__amount">{plan.price}</span>
                  </>
                )}
                <span className="pricing__period">/{plan.period}</span>
              </div>

              <ul className="pricing__features">
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <span className="pricing__check" aria-hidden="true">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className={`pricing__btn ${plan.highlighted ? 'pricing__btn--primary' : 'pricing__btn--secondary'}`}
              >
                {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Pricing
