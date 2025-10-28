import React from "react";
import Spinner from "./Spinner.jsx";

const FullPageSpinner = () => {
  return (
    <div className="fixed inset-0 bg-accent-dark bg-opacity-75 flex items-center justify-center z-50">
      <Spinner />
    </div>
  );
};

export default FullPageSpinner;
