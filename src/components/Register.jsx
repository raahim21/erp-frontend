import React, { useState } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import Spinner from "./Spinner.jsx";
import { API_BASE_URL } from "../../config.js";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "",
  });
  const [error, setError] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const navigate = useNavigate();

  const roleOptions = [
    { value: "admin", label: "Admin" },
    { value: "manager", label: "Manager" },
    { value: "staff", label: "Staff" },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (selectedOption) => {
    setFormData({ ...formData, role: selectedOption?.value || "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setRegisterLoading(true);
      let req = await fetch(`${API_BASE_URL}/api/auth/register`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        method: "POST",
      });
      let res = await req.json();
      if (!res.ok) {
        setError(res.message);
      }
      navigate("/");
    } catch (err) {
      setError("Registration failed. Try a different username.");
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="bg-secondary-bg p-6 rounded-lg shadow-md max-w-md mx-auto mt-12">
      <h2 className="text-2xl text-accent-dark mb-4">Register</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {registerLoading ? (
        <Spinner />
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-text-dark mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-2 border border-text-dark rounded bg-primary-bg text-accent-dark"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-text-dark mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 border border-text-dark rounded bg-primary-bg text-accent-dark"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-text-dark mb-1">Role</label>
            <Select
              options={roleOptions}
              onChange={handleRoleChange}
              placeholder="Select a role"
              className="text-black"
              required
            />
          </div>
          <button
            type="submit"
            disabled={registerLoading}
            className="bg-accent-light text-accent-dark px-4 py-2 rounded disabled:opacity-50"
          >
            Register
          </button>
        </form>
      )}
      <p className="mt-4 text-text-dark">
        Already have an account?{" "}
        <a href="/login" className="text-accent-light hover:underline">
          Login
        </a>
      </p>
    </div>
  );
};

export default Register;
