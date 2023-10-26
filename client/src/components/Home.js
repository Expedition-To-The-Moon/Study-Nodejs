import axios from 'axios';
import '../App.css';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Home() {
  const [auth, setAuth] = useState(false);
  const [name, setName] = useState('');
  const [Message, setMessage] = useState('');

  const navigate = useNavigate();

  axios.defaults.withCredentials = true

  useEffect(() => {
    axios.get('http://localhost:4000/')
    .then(res => {
      if(res.data.Status === "Success") {
        setAuth(true);
        setName(res.data.username);
      } else {
        setAuth(false);
        setMessage(res.data.Message);
        // navigate('/login');
      }
    })
    .catch(err => console.log(err));
  },[]);

  const handleLogout = () => {
    axios.get('http://localhost:4000/logout')
    .then(res => {
      if(res.data.Status === "Success") {
        window.location.reload(true);
      } else {
        alert("Error");
      }
    })
    .catch(err => console.log(err));
  };

  return (
    <>
      <div className="form">
        {
          auth ?
          <div>
            <h3>Welcone {name}</h3>
            <button onClick={handleLogout}>Logout</button>
          </div>
          :
          <div>
            <h3>{Message}</h3>
            <Link to="/login">Login</Link> |
            <Link to="/signup">Sign up</Link> |
            <Link to="/email">find password</Link> 
          </div>
        }
      </div>
    </>
  ) 
}

export default Home