import React from "react";

const Label = ({ children, htmlFor, required = false, className = "" }) => (
    <label htmlFor={htmlFor} className={`mb-2 block text-sm font-semibold text-gray-700 ${className}`}>
        {children}
        {required && <span className="ml-1 text-red-500">*</span>}
    </label>
);
export default Label;
