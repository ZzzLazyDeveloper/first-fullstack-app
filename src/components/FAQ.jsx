import { useState } from 'react'
import './FAQ.css'

const faqs = [
  {
    question: 'What is NeuralFlow?',
    answer:
      'NeuralFlow is an AI platform that helps teams automate workflows, analyze data, and build intelligent applications — without needing a machine learning PhD.',
  },
  {
    question: 'Do I need coding experience to use it?',
    answer:
      'No. Our visual workflow builder lets anyone create automations. Developers can also use our REST API and SDKs for deeper customization.',
  },
  {
    question: 'Is there a free plan?',
    answer:
      'Yes! The Starter plan is free forever and includes 1,000 API calls per month — enough to explore the platform and build small projects.',
  },
  {
    question: 'How secure is my data?',
    answer:
      'We are SOC 2 compliant and use end-to-end encryption. Your data is never used to train models unless you explicitly opt in.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer:
      'Absolutely. There are no long-term contracts. Upgrade, downgrade, or cancel your plan at any time from your account settings.',
  },
  {
    question: 'Do you offer custom enterprise solutions?',
    answer:
      'Yes. Our Enterprise plan includes dedicated infrastructure, custom AI models, SLA guarantees, and a dedicated account manager. Contact us to learn more.',
  },
]

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  function toggle(index) {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="faq" id="faq">
      <div className="faq__container">
        <div className="faq__header">
          <span className="faq__label">FAQ</span>
          <h2 className="faq__title">Frequently asked questions</h2>
          <p className="faq__subtitle">
            Everything you need to know about NeuralFlow. Can&apos;t find an answer?{' '}
            <a href="#contact">Contact us</a>.
          </p>
        </div>

        <div className="faq__list">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index

            return (
              <article key={faq.question} className={`faq__item ${isOpen ? 'faq__item--open' : ''}`}>
                <button
                  type="button"
                  className="faq__question"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                >
                  {faq.question}
                  <span className="faq__icon" aria-hidden="true">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                <div className="faq__answer-wrapper">
                  <p className="faq__answer">{faq.answer}</p>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default FAQ
