import { useState } from 'react'
import './Contact.css'

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)
    setFormData({ name: '', email: '', message: '' })
  }

  return (
    <section className="contact" id="contact">
      <div className="contact__container">
        <div className="contact__info">
          <span className="contact__label">Contact</span>
          <h2 className="contact__title">Get in touch</h2>
          <p className="contact__subtitle">
            Have questions? We&apos;d love to hear from you. Send us a message and
            we&apos;ll respond within 24 hours.
          </p>

          <div className="contact__details">
            <div className="contact__detail">
              <span className="contact__detail-icon" aria-hidden="true">✉</span>
              <div>
                <strong>Email</strong>
                <p>hello@neuralflow.ai</p>
              </div>
            </div>
            <div className="contact__detail">
              <span className="contact__detail-icon" aria-hidden="true">📍</span>
              <div>
                <strong>Office</strong>
                <p>San Francisco, CA</p>
              </div>
            </div>
          </div>
        </div>

        <form className="contact__form" onSubmit={handleSubmit}>
          {submitted && (
            <div className="contact__success" role="status">
              Thanks! We&apos;ll get back to you soon.
            </div>
          )}

          <div className="contact__field">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Jane Doe"
              required
            />
          </div>

          <div className="contact__field">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="jane@company.com"
              required
            />
          </div>

          <div className="contact__field">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us about your project..."
              rows={5}
              required
            />
          </div>

          <button type="submit" className="contact__submit">
            Send Message
          </button>
        </form>
      </div>
    </section>
  )
}

export default Contact
