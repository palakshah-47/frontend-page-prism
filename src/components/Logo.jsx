import { Link } from 'react-router-dom'
import logo from '../assets/logo.svg'

const Logo = () => {
  return (
    <div className="flex-shrink-0">
      <Link to="/">
        <img className="h-8" src={logo} alt="Page Prism" />
      </Link>
    </div>
  )
}

export default Logo
