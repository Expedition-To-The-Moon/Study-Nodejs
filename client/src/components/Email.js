import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../App.css';
import { Link, useNavigate } from 'react-router-dom';

function Email() {
    const [values, setValues] = useState({
        username: '',
        email: ''
    });
    const [message, setMessage] = useState('');

    const navigate = useNavigate();

    const handleInput = (event) => {
        setValues(prev => ({...prev, [event.target.name] : event.target.value}))
    }

    const handleSubmit = async(event) => {
        event.preventDefault();
        axios.post('http://localhost:4000/send', values)
        .then(res => {
            if(res.data.ok === true) {
                console.log("이메일이 성공적으로 전송되었습니다.");
                navigate('/login');
            } else {
                alert("존재하지 않는 이메일입니다.");
                setMessage(res.data.message);
            }
            console.log(res);
        })
        .catch(err => console.log(err));
    };

    return (
        <div className="form">
            <div>
                <h2>Find Password</h2>
                <form onSubmit={handleSubmit}>
                    <div className="login">
                        <label htmlFor='password'>Username</label>
                        <input type="text" placeholder='Enter Username' name='username' onChange={handleInput}  />
                    </div>
                    <div className="login">
                        <label htmlFor='email'>Email</label>
                        <input type="email" placeholder='Enter Email' name='email' onChange={handleInput} />
                    </div>
                    <button type='submit' className="btn">Send Email</button>
                    <p>회원가입 하려면</p>
                    <Link to="/signup">Create Account</Link>
                </form>
            </div>
        </div>
    )
}

export default Email