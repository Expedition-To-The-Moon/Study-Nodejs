import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';
import axios from 'axios';

function Login() {
    const [values, setValues] = useState({
        email: '',
        password: ''
    });
    const [message, setMessage] = useState('');
    
    const navigate = useNavigate();

    const handleInput = (event) => {
        setValues(prev => ({...prev, [event.target.name] : [event.target.value]}))
    };
    axios.defaults.withCredentials = true;

    // useEffect(() => {
    //     axios.get('http://localhost:4000/')
    //     .then(res => {
    //         if(res.data.valid) {
    //             navigate('/');
    //         } else {
    //             navigate('/login');
    //         }
    //     })
    //     .catch(err => console.log(err));
    // },[]);   

    const handleSubmit = (event) => {
        event.preventDefault();
        axios.post('http://localhost:4000/login', values)
        .then(res => {
            console.log("뭐냐", res.data.Status)
            if(res.data.Status === "Success") {
                window.location.href = '/';
            } else {
                // alert("No Record");
                setMessage(res.data.message);
            }
            console.log(res);
        })
        .catch(err => console.log(err));
    };

 
  return (
    <div className="form">
        <div>
            <h2>Log in</h2>
            <form onSubmit={handleSubmit}>
                <div className="login">
                    <label htmlFor='email'>Email</label>
                    <input type="email" placeholder='Enter Email' name='email' onChange={handleInput} />
                </div>
                <div className="login">
                    <label htmlFor='password'>Password</label>
                    <input type="password" placeholder='Enter Password' name='password' onChange={handleInput}  />
                </div>
                <button type='submit' className="btn">Log in</button>
                <p>비밀번호 재발급하려면</p>
                <Link to="/email">Find Password</Link>
                <p>회원가입 하려면</p>
                <Link to="/signup">Create Account</Link>
            </form>
        </div>
    </div>
  )
}

export default Login
