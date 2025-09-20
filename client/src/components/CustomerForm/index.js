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
    first_name: "",
    last_name: "",
    phone_number: ""
  });

  useEffect(() => {
    if (id) {
      setApiStatus(apiConstantInitialStatus.inprogress)
      API.get(`/api/customers/${id}`)
      .then(response => {
          setCustomerData(response.data.data)
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

  const handleMobileInput = (e) => {
    if (e.target.value.length <= 10 && !isNaN(e.target.value)) {
      setCustomerData({ ...customerData, [e.target.name]: e.target.value });
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (id !== undefined && customerData.first_name !== "" && customerData.last_name !== "" && customerData.phone_number !== "") {
      setApiStatus(apiConstantInitialStatus.inprogress)
      API.put(`/api/customers/${id}`, customerData)
        .then(response => {
            notifySuccess(response.data.message);
        })
        .catch(error => {
            notifyError('Customer Details Not Updated')
            console.error(error);
        });
    } else if (customerData.first_name !== "" && customerData.last_name !== "" && customerData.phone_number !== "") {
      API.post(`/api/customers`, {
            first_name: customerData.first_name,
            last_name: customerData.last_name,
            phone_number: customerData.phone_number,
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
                name="first_name"
                value={customerData.first_name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>Last Name: </label>
              <input
                type="text"
                name="last_name"
                value={customerData.last_name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label>Mobile Number </label>
              <input
                type="text"
                name="phone_number"
                value={customerData.phone_number}
                onChange={handleMobileInput}
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