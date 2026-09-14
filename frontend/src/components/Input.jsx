import React from "react";
const Input = ({
    label, 
    type = "text",
    name,
    placeholder = "",
    value = "",
    onChange,
    required = false,
    disabled = false,
}) => {
    return (
        <div>
            <label htmlFor={name} className="mb-2 block text-sm font-semibold text-gray-700">
                {label}
            </label>
            <input type={type} id={name}
                name={name} placeholder={placeholder}
                value={value} onChange={onChange}
                required={required} disabled={disabled}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 placeholder-gray-400 outline-none transition duration-200 hover:border-gray-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 disabled:cursor-not-allowed disabled:bg-gray-100" />
        </div>
    );
};
export default Input;
