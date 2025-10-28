import React, { useState, useEffect } from "react";
import UserSearch from "./UsersSearchBar";
import { API_BASE_URL } from "../../config";

const ShiftForm = () => {
  const [employees, setEmployees] = useState([]);

  
  
  useEffect(() => {
    const fetchEmployees = async () => {
      const res = await fetch(`${API_BASE_URL}/api/auth/users`, { credentials: "include" }); // your API route
      let data = await res.json();
      setEmployees(data);
    };
    fetchEmployees();
  }, []);

  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    requiredPositions: [{ jobPosition: "", count: 1 }],
    assignedEmployees: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePositionChange = (index, e) => {
    console.log(e.target, index);
    const { name, value } = e.target;
    const updatedPositions = formData.requiredPositions;
    updatedPositions[index] = { ...updatedPositions[index], [name]: value };
    setFormData((prev) => ({ ...prev, requiredPositions: updatedPositions }));
  };

  const addPosition = () => {
    setFormData((prev) => ({
      ...prev,
      requiredPositions: [
        ...prev.requiredPositions,
        { jobPosition: "", count: 1 },
      ],
    }));
  };

  const removePosition = (index) => {
    setFormData((prev) => ({
      ...prev,
      requiredPositions: prev.requiredPositions.filter((_, i) => i !== index),
    }));
  };

  const handleEmployeeChange = (e) => {
    const selected = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setFormData((prev) => ({ ...prev, assignedEmployees: selected }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let req = await fetch(`${API_BASE_URL}/api/shifts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(formData),
    });
    let res = await req.json();
    console.log(res);
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Create Shift</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Start Time</label>
          <input
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">End Time</label>
          <input
            type="time"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <UserSearch />
        <div className="mb-4">
          <label className="block text-gray-700">Required Positions</label>
          {formData.requiredPositions.map((position, index) => (
            <div key={index} className="flex space-x-2 mb-2">
              <input
                type="text"
                name="jobPosition"
                value={position.jobPosition}
                onChange={(e) => handlePositionChange(index, e)}
                placeholder="Job Position (e.g., Cashier)"
                required
                className="flex-1 p-2 border rounded"
              />
              <input
                type="number"
                name="count"
                value={position.count}
                onChange={(e) => handlePositionChange(index, e)}
                min="1"
                required
                className="w-20 p-2 border rounded"
              />
              <button
                type="button"
                onClick={() => removePosition(index)}
                className="bg-red-500 text-white px-2 py-1 rounded"
                disabled={formData.requiredPositions.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addPosition}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add Position
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Assigned Employees</label>
          <select
            multiple
            name="assignedEmployees"
            value={formData.assignedEmployees}
            onChange={handleEmployeeChange}
            className="w-full p-2 border rounded"
          >
            {/* Replace with actual employee data from your backend */}

            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.username} ({emp.jobPosition})
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default ShiftForm;
