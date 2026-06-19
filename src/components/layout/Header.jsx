import { NavLink } from 'react-router-dom'
import { useCart } from '../../context/useCart'
import '../../styles/layout.css'
import '../../styles/cart.css'

export default function Header() {
  const { count } = useCart()

  return (
    <header className="site-header">
      <NavLink to="/" className="site-header__brand">
        Screen<span>Sage</span>
      </NavLink>
      <nav className="site-header__nav" aria-label="Main navigation">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `site-header__link${isActive ? ' site-header__link--active' : ''}`
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/browse"
          className={({ isActive }) =>
            `site-header__link${isActive ? ' site-header__link--active' : ''}`
          }
        >
          Browse
        </NavLink>
        <NavLink
          to="/suggest"
          className={({ isActive }) =>
            `site-header__link${isActive ? ' site-header__link--active' : ''}`
          }
        >
          Suggest
        </NavLink>
        <NavLink
          to="/cart"
          className={({ isActive }) =>
            `site-header__link site-header__cart${isActive ? ' site-header__link--active' : ''}`
          }
        >
          Cart
          {count > 0 && (
            <span className="site-header__cart-badge" aria-label={`${count} items in cart`}>
              {count}
            </span>
          )}
        </NavLink>
      </nav>
    </header>
  )
}