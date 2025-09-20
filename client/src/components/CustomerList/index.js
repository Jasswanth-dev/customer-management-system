// client/src/pages/CustomerListPage.js
import React, { useState, useEffect } from 'react';
import {Link, useNavigate} from 'react-router-dom'
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

    const navigate = useNavigate();


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
                <div className='pagination'>
                    <button type='button' onClick={onClear} className='button'>Clear</button>
                    <Popup
                        trigger={<button className="button"> filter </button>}
                        position="bottom left"
                    >
                        <div className='filter-bg-container'>
                            <label htmlFor='sortby'>sortby:</label><br/>
                            <select id="sortBy" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                                <option value="id">id</option>
                                <option value="first_name">First Name</option>
                                <option value="last_name">Last Name</option>
                            </select><br/>
                            <label htmlFor='order'>Order:</label>
                            <button id='order' type='button' onClick={() => {order === 'asc' ? setOrder('desc') : setOrder("asc")}}>{order === 'asc' ? "ASC" : "DESC"}</button>
                        </div>
                    </Popup>
                    <input id="search" type='search' value={search} onChange={onSearch} placeholder='Search'/>
                </div>
                
                {apiStatus === apiConstantInitialStatus.inprogress && <Loader/>}
                {apiStatus === apiConstantInitialStatus.success &&
                    <>
                        <table>
                            <thead>
                                <tr>
                                    <th>Id</th>
                                    <th>First Name</th>
                                    <th>Last name</th>
                                    <th>Phone Number</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map(customer => (
                                    <tr key={customer.id} className='customer-row' onClick={() => navigate(`/customer/details/${customer.id}`)}>
                                        <td>{customer.id}</td>
                                        <td>{customer.first_name}</td>
                                        <td>{customer.last_name}</td>
                                        <td>{customer.phone_number}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div>
                            <Link to="/customer/new">
                                <button type='button'>
                                    Add Customer 
                                </button>
                            </Link>
                        </div>
                        <div className="pagination-controls">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                            >
                                Prev
                            </button>
                            <span> {page}/{totalPages} </span>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(page + 1)}
                            >
                                Next
                            </button>
                            <select value={limit} onChange={e => {setLimit(Number(e.target.value)); setPage(1);}}>
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                            </select>
                        </div>
                    </>
                }
            </div>
        </div>
    );
}

export default CustomerListPage;

