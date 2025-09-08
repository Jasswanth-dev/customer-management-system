import { BarLoader } from "react-spinners";
import './index.css'

const Loader = () => (
    <div className="loader-container">
        <p>Loading . . .</p>
        <BarLoader />
    </div>
);

export default Loader;