import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../redux/slices/authSlice.js";

const Login = () => {
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.auth);

    const validateField = (name, value) => {
        let message = "";

        if (name === "email") {
            if (!value.trim()) {
                message = "Email is required"
            } else if (!/^[\w.-]+@[A-Za-z\d.-]+\.[A-Za-z]{2,}$/.test(value)) {
                message = "Invalid Email format"
            }
        }
        if (name === "password") {
            if (!value.trim()) {
                message = "Password is required"
            } else if (value.length < 6) {
                message = "Password must be at least 6 characters"
            }
        }
        return message;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev, [name]: value
        }))

        setFieldErrors((prev) => ({ ...prev, [name]: "" }))
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const message = validateField(name, value);

        setFieldErrors((prev) => ({ ...prev, [name]: message }))
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const emailError = validateField("email", form.email);
        const passwordError = validateField("password", form.password);

        if (emailError || passwordError) {
            setFieldErrors({
                "email": emailError,
                "password": passwordError
            })
            return;
        }

        try {
            await dispatch(loginUser(form)).unwrap();
            toast.success("Login successful!");
            navigate("/");
        } catch (err) {
            toast.error(err.message || "Login failed");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box slide-in">
                <h2>Login</h2>
                {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="input-wrapper">
                        <span className="input-icon">📧</span>
                        <input type="email" name="email" placeholder="Email" onChange={handleChange} onBlur={handleBlur} required />
                    </div>
                    {fieldErrors.email && <p style={{ color: 'red' }}>{fieldErrors.email}</p>}
                    <div className="input-wrapper">
                        <span className="input-icon">🔒</span>
                        <input type="password" name="password" placeholder="Password" onChange={handleChange} onBlur={handleBlur} required />
                    </div>
                    {fieldErrors.password && <p style={{ color: 'red' }}>{fieldErrors.password}</p>}
                    <button type="submit" disabled={loading}>
                        {loading ? <span className="spinner"></span> : "Login"}
                    </button>
                </form>
                <p>Don't have an account? <a href="/register">Register</a></p>
            </div>
        </div>
    );

}

export default Login;