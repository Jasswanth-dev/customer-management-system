import Header from '../Header'
import './index.css'

const NotFound = () => (
    <div className='bg-container'>
      <Header/>
        <div className='not-found'>
            <h1>404</h1>
            <p>The page you are looking is not found</p>
        </div>
      
    </div>
)

export default NotFound