

import { useState, useEffect, useContext } from "react";
import { useDispatch } from "react-redux";
import { DarkModeContext } from "../context/DarkmodeContext.jsx";

export default function SearchBar({
  setSearchAction,
  placeholder = "Search...",
}) {
  const dispatch = useDispatch();
  const { darkMode } = useContext(DarkModeContext);
  const [localTerm, setLocalTerm] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      dispatch(setSearchAction(localTerm));
    }, 500); // wait 500ms after typing stops
    return () => clearTimeout(handler);
  }, [localTerm, dispatch, setSearchAction]);

  return (
    <input
      type="text"
      placeholder={placeholder}
      value={localTerm}
      onChange={(e) => setLocalTerm(e.target.value)}
      className={`border rounded px-3 py-1 w-full mt-2 h-10 ${
        darkMode
          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
      } focus:ring-2 focus:ring-blue-500`}
    />
  );
}
