import React from 'react';

const TextField = ({ label, name, type = 'text', formik }) => {
  const hasError = formik.touched[name] && formik.errors[name];

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-gray-700 text-sm font-bold mb-2">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values[name]}
        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${hasError ? 'border-red-500' : ''}`}
      />
      {hasError && (
        <p className="text-red-500 text-xs italic">{formik.errors[name]}</p>
      )}
    </div>
  );
};

export default TextField;