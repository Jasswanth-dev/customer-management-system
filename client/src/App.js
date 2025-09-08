import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer} from 'react-toastify';

import CustomerList from './components/CustomerList'
import CustomerForm from './components/CustomerForm'
import CustomerDetails from "./components/CustomerDetails";
import AddressForm from "./components/AddressForm"
import NotFound from './components/NotFound'


const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<CustomerList/>} />
      <Route path="/customer/new" element={<CustomerForm/>}/>
      <Route path="/customer/:id" element={<CustomerForm/>}/>
      <Route path="/customer/details/:id" element={<CustomerDetails/>}/>
      <Route path="/customer/:customer_id/address/new" element={<AddressForm/>}/>
      <Route path="/customer/:customer_id/address/:id" element={<AddressForm/>}/>
      <Route path="/notfound" element={<NotFound/>}/>
      <Route path="*" element={<Navigate to="/notfound" replace/>} />
    </Routes>
    <ToastContainer/>
  </BrowserRouter>
)

export default App