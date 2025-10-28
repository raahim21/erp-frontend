import React, { useState } from "react";
import AsyncSelect from "react-select/async";
import debounce from "lodash.debounce";

import { API_BASE_URL } from "../../config";
  


function UserSearch({ onSelect, defaultValue, isMulti }) {
  const [error, setError] = useState("");

  const fetchUsers = async (inputValue) => {
    if (!inputValue) return [];

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/auth/users-all?username=${encodeURIComponent(
          inputValue
        )}`,
        { credentials: "include" }
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.msg || `Failed to fetch users: ${res.status}`
        );
      }
      const data = await res.json();
      return data.users.map((user) => ({
        label: `${user.username} (${user.jobPosition || "No position"})`,
        value: user._id,
      }));
    } catch (err) {
      setError(err.message);
      return [];
    }
  };

  const debouncedFetch = debounce((inputValue, callback) => {
    fetchUsers(inputValue).then(callback);
  }, 500);

  const loadOptions = (inputValue) => {
    return new Promise((resolve) => {
      debouncedFetch(inputValue, resolve);
    });
  };

  return (
    <div>
      {error && <p className="text-red-500 text-sm mb-1">{error}</p>}
      <AsyncSelect
        cacheOptions
        loadOptions={loadOptions}
        onChange={onSelect}
        defaultValue={defaultValue}
        isMulti={isMulti}
        placeholder="Search users..."
        noOptionsMessage={() => "No users found"}
        loadingMessage={() => "Searching..."}
        className="react-select-container"
        classNamePrefix="react-select"
      />
    </div>
  );
}

export default UserSearch;
