import {Link} from 'react-router-dom'
import './index.css'

const Header = () => (
    <header>
        <Link to="/" className='header-link'>
                Customer Management System
        </Link>
        <nav>
            <Link to="/" className='header-link'>
                <button type='button'>Home</button>
            </Link>
        </nav>
    </header>
)

export default Header