import { useState } from 'react'
import './Navbar.css'

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contact', label: 'Contact' },
]

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <header className="navbar">
      <div className="navbar__container">
        <a href="#" className="navbar__logo" onClick={closeMenu}>
          <span className="navbar__logo-icon">◆</span>
          NeuralFlow
        </a>

        <nav
          className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}
          aria-label="Main navigation"
        >
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={closeMenu}>
              {link.label}
            </a>
          ))}

          <a
            href="#contact"
            className="navbar__mobile-cta"
            onClick={closeMenu}
          >
            Get Started
          </a>
        </nav>

        <div className="navbar__actions">
          <a href="#contact" className="navbar__btn navbar__btn--primary">
            Get Started
          </a>
        </div>

        <button
          type="button"
          className="navbar__menu-btn"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
    </header>
  )
}

export default Navbar
