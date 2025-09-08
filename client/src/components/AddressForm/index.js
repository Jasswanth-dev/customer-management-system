import React, {useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {notifySuccess,notifyError} from '../Notify'
import Header from '../Header'
import Loader from '../Loader'
import API from "../../api"

const apiConstantInitialStatus = {
    success: "success",
    inprogress: 'inprogress',
    failure: 'failure'
}

const AddressForm = (props) => {
  const [apiStatus, setApiStatus] = useState(apiConstantInitialStatus.inprogress)
  const {customer_id, id} = useParams();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    customer_id, 
    address_details: "",
    city: "",
    state: "",
    pin_code: "" 
  });

  useEffect(() => {
    if (id) {
      API.get(`/api/customers/${customer_id}/addresses`)
      .then(response => {
          const addresses = response.data.data;
          const requiredAddress = addresses.find(each => each.id === parseInt(id));
          if (requiredAddress !== undefined){
            setAddress(requiredAddress);
            setApiStatus(apiConstantInitialStatus.success);
          }
      })
      .catch(error => {
          console.error('There was an error fetching the customers!', error);
          setApiStatus(apiConstantInitialStatus.failure)
      });
      return;
    }
    setApiStatus(apiConstantInitialStatus.success)
  }, [customer_id, id]);

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (id !== undefined && address.address_details !== "" && address.city !== "" && address.state !== "" && address.pin_code !== "") {
      API.put(`/api/addresses/${id}`, address)
        .then(res => {
            notifySuccess(res.data.message);
        })
        .catch(error => {
            notifyError('Address Not Updated');
            console.error(error);
        });
    }else if (address.address_details !== "" && address.city !== "" && address.state !== "" && address.pin_code !== "") {
      API.post(`/api/customer/${customer_id}/addresses`, address)
        .then(response => {
            notifySuccess(response.data.message);
        })
        .catch(error => {
            console.error(error);
            notifyError('Address Not Created')
        });
    }
    navigate(`/customer/details/${customer_id}`, { replace: true });
  };

  return (
    <div className="bg-container">
      <Header/>
      <div className="form-container">
        {apiStatus === apiConstantInitialStatus.inprogress && <Loader/>}
        {apiStatus === apiConstantInitialStatus.success &&
          <form onSubmit={handleSubmit}>
            <h1 className="main-heading">Add a New Address</h1>
            <div>
              <label>Customer ID: </label>
              <input
                type="text"
                name="id"
                value={address.customer_id}
                readOnly
              />
            </div>

            <div>
              <label>Address: </label>
              <input
                type="text"
                name="address_details"
                value={address.address_details}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>City:</label>
              <input
                type="text"
                name="city"
                value={address.city}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>State:</label>
              <input
                type="text"
                name="state"
                value={address.state}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>Pincode:</label>
              <input
                type="text"
                name="pin_code"
                value={address.pin_code}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-btn-container">
              <button type="button" className="btn btn-red">Cancel</button>
              <button type="submit" className="btn btn-green">{id ? "Update" : "Create"}</button>
            </div>
          </form>
        }
      </div>
    </div>
  );
};


export default AddressForm;