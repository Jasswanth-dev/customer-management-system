import {useState, useEffect} from 'react';
import { useParams, Link, useNavigate} from "react-router-dom";
import {notifySuccess,notifyError} from '../Notify'
import Header from '../Header'
import Loader from '../Loader'
import API from '../../api';
import Popup from 'reactjs-popup';
import './index.css';

const apiConstantInitialStatus = {
    success: "success",
    inprogress: 'inprogress',
    failure: 'failure'
}

const CustomerDetails = () => {
    const {id} = useParams();
    const navigate = useNavigate();

    const [apiStatus, setApiStatus] = useState(apiConstantInitialStatus.inprogress)
    const [addresses, setAddresses] = useState([]);
    const [customer, setCustomer] = useState({
        id,
        first_name: "",
        last_name: "",
        phone_number: ""
    })

    useEffect(() => {
        API.get(`/api/customers/${id}`)
            .then(response => {
                setCustomer(response.data.data);
                API.get(`/api/customers/${id}/addresses`)
                    .then(response => {
                        setAddresses(response.data.data);
                        setApiStatus(apiConstantInitialStatus.success)
                        
                    })
                    .catch(error => {
                        setApiStatus(apiConstantInitialStatus.failure)
                        console.error('There was an error fetching the customers address!', error);
                    });
            })
            .catch(error => {
                notifyError(error.response.data.error_message)
                console.error('There was an error fetching the customers!', error);
                navigate('/')
            });
    },[id, navigate]);

    const onDelete = (id, close) => {
        API.delete(`/api/addresses/${id}`)
            .then(response => {
                const newAddressesList = () => addresses.filter(each => each.id !== id);
                setAddresses(newAddressesList)
                notifySuccess(response.data.message)
            })
            .catch(error => {
                notifyError('Failed to Delete Address')
                console.error('There was an error deleting the customer!', error);
            });
        close();
    }

    return (
        <div className='bg-container'>
            <Header/>
            <div className='main-content'>
            <h1 className='main-heading'>Customer Details</h1>
            {apiStatus === apiConstantInitialStatus.inprogress && <Loader/>}
            {apiStatus === apiConstantInitialStatus.success &&
                <>
                    <table className='user-details-table'>
                        <tbody>
                            <tr>
                                <th>Customer ID:</th>
                                <td>{customer.id}</td>
                            </tr>
                            <tr>
                                <th>First Name:</th>
                                <td>{customer.first_name}</td>
                            </tr>
                            <tr>
                                <th>Last Name:</th>
                                <td>{customer.last_name}</td>
                            </tr>
                            <tr>
                                <th>Mobile Number:</th>
                                <td>{customer.phone_number}</td>
                            </tr>
                        </tbody>
                    </table>
                    <Link to={`/customer/${id}/address/new`}>
                        <button type="button" className='btn'>
                            Add New Address
                        </button>
                    </Link>
                    <h2>Addresses:</h2>
                    <table border="1" cellPadding="10">
                        <thead>
                            <tr>
                                <th>Address ID</th>
                                <th>Address</th>
                                <th>City</th>
                                <th>State</th>
                                <th>Pincode</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {addresses.map(address => (
                                <tr key={address.id}>
                                    <td>{address.id}</td>
                                    <td>{address.address_details}</td>
                                    <td>{address.city}</td>
                                    <td>{address.state}</td>
                                    <td>{address.pin_code}</td>
                                    <td>
                                        <Link to={`/customer/${address.customer_id}/address/${address.id}`}>
                                            <button type='button' className='btn btn-green'>Edit</button>
                                        </Link>  
                                        <Popup
                                            trigger={<button className="btn btn-red"> Delete </button>}
                                            modal
                                        >
                                            {close => (
                                                <div className="modal">
                                                    <div className="header"> Are you sure you want to delete the Customer Address </div>
                                                    <div className="content">
                                                        <span className='sub-heading'>Customer ID:</span> {`${address.customer_id}`},<br/>
                                                        <span className='sub-heading'>Address:</span> {`${address.address_details}`},<br/>
                                                        <span className='sub-heading'>City:</span> {`${address.city}`},<br/>
                                                        <span className='sub-heading'>State:</span> {`${address.state}`},
                                                        <span className='sub-heading'>Pincode:</span> {`${address.pin_code}`},
                                                    </div>
                                                    <div className="actions">
                                                        <button type='button' className='modal-btn btn btn-red' onClick={ () => onDelete(address.id,close)}>
                                                            Delete
                                                        </button>
                                                        <button
                                                            type='button'
                                                            className="modal-btn btn"
                                                            onClick={close}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </Popup>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            }
            </div>
        </div>
    )
}

export default CustomerDetails