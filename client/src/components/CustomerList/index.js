// client/src/pages/CustomerListPage.js
import React, { useState, useEffect } from 'react';
import {Link} from 'react-router-dom'
import {notifySuccess,notifyError} from '../Notify'
import Header from '../Header'
import Loader from '../Loader'
import API from '../../api';
import Popup from 'reactjs-popup';
import "./index.css"

const apiConstantInitialStatus = {
    success: "success",
    inprogress: 'inprogress',
    failure: 'failure'
}

const CustomerListPage = () => {
    const [apiStatus, setApiStatus] = useState(apiConstantInitialStatus.inprogress)
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState('id')
    const [order, setOrder] = useState('asc')
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);


    useEffect(() => {
        setApiStatus(apiConstantInitialStatus.inprogress);

        API.get(`/api/customers?search=${search}&sortBy=${sortBy}&order=${order}&page=${page}&limit=${limit}`)
            .then(response => {
                setCustomers(response.data.data || []);
                setTotalPages(response.data.pagination.totalPages || 1);
                setApiStatus(apiConstantInitialStatus.success);
            })
            .catch(error => {
                console.error('There was an error fetching the customers!', error);
                setCustomers([]);
                setApiStatus(apiConstantInitialStatus.failure);
            });
    }, [sortBy, order, page, limit, search]);


    const onDelete = (id, close) => {
        API.delete(`/api/customers/${id}`)
            .then(res => {
                notifySuccess(res.data.message);
                const newCustomersList = customers.filter(each => each.id !== id);
                setCustomers(newCustomersList);
            })
            .catch(error => {
                notifyError('Failed to Delete Customer')
                console.error('There was an error deleting the customer!', error);
            });
        close();
    }

    const onClear = () => {
        setSearch('');
        setSortBy('id');
        setOrder('asc');
    }

    const onSearch = (e) => {
        setPage(1);
        setSearch(e.target.value);
    }

    return (
        <div className='bg-container'>
            <Header/>
            <div className='main-content'>
            <h1 className='main-heading'>Customers List</h1>
            <div className='pagination-container'>
                <Link to="/customer/new">
                    <button type='button' className='btn'>
                        Add Customer 
                    </button>
                </Link>
                <div className='pagination'>
                    <label htmlFor='search'>Search:</label>
                    <input id="search" type='search' value={search} onChange={onSearch}/>
                    <label htmlFor='sortby'>sortby:</label>
                    <select id="sortBy" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                        <option value="id">id</option>
                        <option value="first_name">First Name</option>
                        <option value="last_name">Last Name</option>
                    </select>
                    <label htmlFor='order'>Order:</label>
                    <button id='order' type='button' onClick={() => {order === 'asc' ? setOrder('desc') : setOrder("asc")}}>{order === 'asc' ? "ASC" : "DESC"}</button>
                    <button type='button' onClick={onClear} className='btn clear-btn'>Clear</button>
                </div>
            </div>
            {apiStatus === apiConstantInitialStatus.inprogress && <Loader/>}
            {apiStatus === apiConstantInitialStatus.success &&
                <>
                    <table border="1" cellPadding="10">
                        <thead>
                            <tr>
                                <th>Customer ID</th>
                                <th>First Name</th>
                                <th>Customer Lastname</th>
                                <th>Phone Number</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map(customer => (
                                <tr key={customer.id}>
                                    <td>{customer.id}</td>
                                    <td>{customer.first_name}</td>
                                    <td>{customer.last_name}</td>
                                    <td>{customer.phone_number}</td>
                                    <td>
                                        <Link to={`/customer/details/${customer.id}`}>
                                            <button type='button' className='btn'>View</button>
                                        </Link>

                                        <Link to={`/customer/${customer.id}`}>
                                            <button type='button' className='btn btn-green'>Edit</button>
                                        </Link>
                                        
                                        <Popup
                                            trigger={<button className="btn btn-red"> Delete </button>}
                                            modal
                                        >
                                            {close => (
                                                <div className="modal">
                                                    <div className="header"> Are you sure you want to delete the Customer </div>
                                                    <div className="content">
                                                        <span className='sub-heading'>Customer ID:</span> {`${customer.id}`},<br/>
                                                        <span className='sub-heading'>First Name:</span> {`${customer.first_name}`},<br/>
                                                        <span className='sub-heading'>Last Name:</span> {`${customer.last_name}`},<br/>
                                                        <span className='sub-heading'>Phone Number:</span> {`${customer.phone_number}`},
                                                    </div>
                                                    <div className="actions">
                                                        <button type='button' className='modal-btn btn btn-red' onClick={ () => onDelete(customer.id,close)}>
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
                    <div className="pagination-controls">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                        >
                            Previous
                        </button>

                        <span> Page {page} of {totalPages} </span>

                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(page + 1)}
                        >
                            Next
                        </button>

                        <label>
                            Rows per page:
                            <select value={limit} onChange={e => {setLimit(Number(e.target.value)); setPage(1);}}>
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                            </select>
                        </label>
                    </div>
                </>
            }
            {customers.length === 0 && apiStatus === apiConstantInitialStatus.success && <h3 className='no-data'>No Customers Found</h3>}
        </div>
        </div>
    );
}

export default CustomerListPage;

