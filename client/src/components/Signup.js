import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';
import axios from 'axios';
import Validation from './Validation';

function Signup() {
    const [values, setValues] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});

    const navigate = useNavigate();

    const handleInput = (event) => {
        setValues(prev => ({...prev, [event.target.name] : event.target.value}))
    };

    const handleSubmit = async(event) => {
        event.preventDefault();
        setErrors(Validation(values));

        if(Object.keys(errors).length === 0) {
            axios.post('http://localhost:8081/signup', values)
            .then(res => {
                console.log(res);  
                navigate('/login');
            })
            .catch(err => console.log(err));
        }
    };

    return (
        <div className="form">
            <div>
                <h2>Sign up</h2>
                <form onSubmit={handleSubmit}>
                    <div className="login">
                        <label htmlFor='username'>Username</label>
                        <input type="text" placeholder='Enter Username' name='username' onChange={handleInput} />
                        {errors.username && <span>{errors.username}</span>}
                    </div>
                    <div className="login">
                        <label htmlFor='email'>Email</label>
                        <input type="email" placeholder='Enter Email' name='email' onChange={handleInput} />
                        {errors.email && <span>{errors.email}</span>}
                    </div>
                    <div className="login">
                        <label htmlFor='password'>Password</label>
                        <input type="password" placeholder='Enter Password' name='password' onChange={handleInput} />
                        {errors.password && <span>{errors.password}</span>}
                    </div>
                    <button type='submit' className="btn">Sign up</button>
                    <p>로그인 하러가기</p>
                    <Link to="/login">Log in</Link>
                </form>
            </div>
        </div>
    )
}

export default Signup