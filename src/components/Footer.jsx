import './Footer.css'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__brand">
          <a href="#" className="footer__logo">
            <span className="footer__logo-icon">◆</span>
            NeuralFlow
          </a>
          <p className="footer__tagline">
            AI-powered tools for the modern team.
          </p>
        </div>

        <div className="footer__links">
          <div className="footer__column">
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="footer__column">
            <h4>Company</h4>
            <a href="#">About</a>
            <a href="#">Blog</a>
            <a href="#">Careers</a>
          </div>
          <div className="footer__column">
            <h4>Legal</h4>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <p>&copy; {currentYear} NeuralFlow. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
