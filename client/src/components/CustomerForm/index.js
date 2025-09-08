import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {notifySuccess,notifyError} from '../Notify'
import Header from '../Header'
import Loader from '../Loader'
import API from '../../api';
import './index.css'

const apiConstantInitialStatus = {
  initial: 'initial',
  success: "success",
  inprogress: 'inprogress',
  failure: 'failure'
}

const CustomerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [apiStatus, setApiStatus] = useState(apiConstantInitialStatus.initial)
  const [customerData, setCustomerData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: ""
  });

  useEffect(() => {
    if (id) {
      setApiStatus(apiConstantInitialStatus.inprogress)
      API.get(`/api/customers/${id}`)
      .then(response => {
          const customer = response.data.data
          const existingCustomerData = {
              firstName: customer.first_name,
              lastName: customer.last_name,
              phoneNumber: customer.phone_number
          }
          setCustomerData(existingCustomerData)
          setApiStatus(apiConstantInitialStatus.success)
      })
      .catch(error => {
          console.error('There was an error fetching the customers!', error);
          setApiStatus(apiConstantInitialStatus.failure)
      });
      return;
    }
    setApiStatus(apiConstantInitialStatus.success)
  }, [id]);

  const handleChange = (e) => {
    setCustomerData({ ...customerData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (id !== undefined && customerData.firstName !== "" && customerData.lastName !== "" && customerData.phoneNumber !== "") {
      setApiStatus(apiConstantInitialStatus.inprogress)
      API.put(`/api/customers/${id}`, {
            first_name: customerData.firstName,
            last_name: customerData.lastName,
            phone_number: customerData.phoneNumber,
        })
        .then(response => {
            notifySuccess(response.data.message);
        })
        .catch(error => {
            notifyError('Customer Details Not Updated')
            console.error(error);
        });
    } else if (customerData.firstName !== "" && customerData.lastName !== "" && customerData.phoneNumber !== "") {
      API.post(`/api/customers`, {
            first_name: customerData.firstName,
            last_name: customerData.lastName,
            phone_number: customerData.phoneNumber,
        })
        .then(response => {
          console.error(response)
          notifySuccess(response.data.message);
        })
        .catch(error => {
          notifyError('Customer Not Created');
          console.error(error);
        });
    }
    navigate('/',{replace: true})
  };

  return (
    <div className="bg-container">
      <Header/>
      {apiStatus === apiConstantInitialStatus.inprogress && <Loader/>}
      {apiStatus === apiConstantInitialStatus.success &&
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <h1 className="main-heading">{id ? "Edit Customer" : "Create Customer"}</h1>
            <div>
              <label>First Name: </label>
              <input
                type="text"
                name="firstName"
                value={customerData.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>Last Name: </label>
              <input
                type="text"
                name="lastName"
                value={customerData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>Mobile Number </label>
              <input
                type="text"
                name="phoneNumber"
                value={customerData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>
            <br/>

            <div className="form-btn-container">
              <button type="button" className="btn btn-red">Cancel</button>
              <button type="submit" className="btn btn-green">{id ? "Update" : "Create"}</button>
            </div>
          </form>
        </div>
      }
    </div>
  );
}


export default CustomerForm