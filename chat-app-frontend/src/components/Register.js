import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../redux/slices/authSlice";

const Register = () => {
    const [form, setForm] = useState({ username: "", email: "", password: "" });
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.auth);

    const validateField = (name, value) =>{
        let message = "";
        
        if (name === "username"){
            if(!value.trim()){
                message = "Username is required"
            }else if(value.length < 3){
                message = "Username must be at least 3 characters"
            }
        }

        if (name === "email"){
            if(!value.trim()){
                message = "Email is required"
            }else if(!/^[\w.-]+@[A-Za-z\d.-]+\.[A-Za-z]{2,}$/.test(value)){
                message = "Invalid email format"
            }
        }

        if (name === "password"){
            if (!value.trim()){
                message = "Password is required"
            }else if(value.length < 6){
                message = "Password must be at least 6 characters"
            }
        }
        return message
    };

    const handleBlur = (e) =>{
        const {name, value} = e.target;
        const message = validateField(name, value);

        setFieldErrors((prev)=>({...prev, [name] : message}))
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }))

        setFieldErrors((prev)=>({...prev, [name] : ""}))
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const usernameError = validateField("username", form.username);
        const emailError = validateField("email", form.email);
        const passwordError = validateField("password", form.password);

        if (usernameError || emailError || passwordError){
            setFieldErrors({
                username : usernameError,
                email : emailError,
                password : passwordError
            })
            return
        };

        try {
            await dispatch(registerUser(form)).unwrap();
            toast.success("Registration successful");
            navigate("/");
        } catch (err) {
            setError(err || "Registration failed");
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-box slide-in">
                <h2>Register</h2>
                {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="input-wrapper">
                        <span className="input-icon">👤</span>
                        <input type="text" name="username" placeholder="Username" onChange={handleChange} onBlur={handleBlur} required />
                    </div>
                    {fieldErrors.username && <p style={{color : 'red'}}>{fieldErrors.username}</p>}
                    <div className="input-wrapper">
                        <span className="input-icon">📧</span>
                        <input type="email" name="email" placeholder="Email" onChange={handleChange} onBlur={handleBlur} required />
                    </div>
                    {fieldErrors.email && <p style={{color : 'red'}}>{fieldErrors.email}</p>}
                    <div className="input-wrapper">
                        <span className="input-icon">🔒</span>
                        <input type="password" name="password" placeholder="Password" onChange={handleChange} onBlur={handleBlur} required />
                    </div>
                    {fieldErrors.password && <p style={{color : 'red'}}>{fieldErrors.password}</p>}
                    <button type="submit" disabled={loading}>
                        {loading ? <span className="spinner"></span> : "Register"}
                    </button>
                </form>
                <p>Already have an account? <a href="/login">Login</a></p>
            </div>
        </div>
    );
}

export default Register;