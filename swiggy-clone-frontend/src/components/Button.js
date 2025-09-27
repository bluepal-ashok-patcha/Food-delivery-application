import React from 'react';

const Button = ({ children, onClick, type = 'button', variant = 'primary', fullWidth = false, disabled = false }) => {
  const baseClasses = "text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-300";

  const variants = {
    primary: "bg-orange-500 hover:bg-orange-600",
    secondary: "bg-gray-500 hover:bg-gray-600",
    danger: "bg-red-500 hover:bg-red-600",
  };

  const widthClass = fullWidth ? "w-full" : "";
  const disabledClass = disabled ? "opacity-50 cursor-not-allowed" : "";

  const classes = `${baseClasses} ${variants[variant]} ${widthClass} ${disabledClass}`;

  return (
    <button
      type={type}
      onClick={onClick}
      className={classes}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;