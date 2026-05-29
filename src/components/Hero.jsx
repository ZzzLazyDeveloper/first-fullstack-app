import './Hero.css'

function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero__glow" aria-hidden="true" />

      <div className="hero__container">
        <div className="hero__badge">
          <span className="hero__badge-dot" />
          Now in public beta
        </div>

        <h1 className="hero__title">
          Build smarter with{' '}
          <span className="hero__gradient-text">AI that understands</span>
        </h1>

        <p className="hero__subtitle">
          NeuralFlow helps teams automate workflows, generate insights, and ship
          faster — all powered by cutting-edge machine learning.
        </p>

        <div className="hero__actions">
          <a href="#contact" className="hero__btn hero__btn--primary">
            Start Free Trial
          </a>
          <a href="#features" className="hero__btn hero__btn--secondary">
            See Features
          </a>
        </div>

        <div className="hero__stats">
          <div className="hero__stat">
            <strong>10K+</strong>
            <span>Active users</span>
          </div>
          <div className="hero__stat">
            <strong>99.9%</strong>
            <span>Uptime</span>
          </div>
          <div className="hero__stat">
            <strong>50M+</strong>
            <span>API calls/day</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
