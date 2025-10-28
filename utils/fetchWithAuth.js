export const fetchWithAuth = async (url, options = {}) => {
  try {
    const headers = {
      ...options.headers,
      "Content-Type": "application/json", // Ensure JSON content type for POST/PUT
    };

    const res = await fetch(url, {
      credentials: "include", // Send cookies for authentication
      ...options,
      headers,
    });

    // Handle 304 status as success (no change in data)
    if (res.status === 304) {
      return { orders: [], totalPages: 1, totalResults: 0 }; // Default response for issue orders
    }

    if (!res.ok) {
      let errorMessage = "Something went wrong";
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch (jsonError) {
        // Handle cases where response has no body (e.g., 304, 204, or server error)
        errorMessage = res.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    // Parse JSON response for successful requests
    return await res.json();
  } catch (err) {
    console.error("Fetch error:", err.message);
    throw err;
  }
};
