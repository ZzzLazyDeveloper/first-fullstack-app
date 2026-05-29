import './Features.css'

const features = [
  {
    icon: '⚡',
    title: 'Lightning Fast',
    description:
      'Process millions of requests in milliseconds with our optimized AI inference engine.',
  },
  {
    icon: '🧠',
    title: 'Smart Automation',
    description:
      'Automate repetitive tasks with intelligent workflows that learn from your patterns.',
  },
  {
    icon: '🔒',
    title: 'Enterprise Security',
    description:
      'SOC 2 compliant with end-to-end encryption. Your data stays private and secure.',
  },
  {
    icon: '📊',
    title: 'Real-time Analytics',
    description:
      'Get actionable insights with dashboards that update as your data flows in.',
  },
  {
    icon: '🔌',
    title: 'Easy Integration',
    description:
      'Connect with 100+ tools via REST API, webhooks, and native SDKs for every platform.',
  },
  {
    icon: '🌍',
    title: 'Global Scale',
    description:
      'Deploy across 30+ regions with automatic failover and load balancing built in.',
  },
]

function Features() {
  return (
    <section className="features" id="features">
      <div className="features__container">
        <div className="features__header">
          <span className="features__label">Features</span>
          <h2 className="features__title">Everything you need to build with AI</h2>
          <p className="features__subtitle">
            Powerful tools designed for developers and teams who want to move fast
            without sacrificing quality.
          </p>
        </div>

        <div className="features__grid">
          {features.map((feature) => (
            <article key={feature.title} className="features__card">
              <span className="features__icon" aria-hidden="true">
                {feature.icon}
              </span>
              <h3 className="features__card-title">{feature.title}</h3>
              <p className="features__card-text">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
