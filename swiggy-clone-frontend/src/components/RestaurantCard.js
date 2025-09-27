import React from 'react';
import { Link } from 'react-router-dom';

const RestaurantCard = ({ restaurant }) => {
  const { id, name, cuisine, rating, deliveryTime, costForTwo, imageUrl } = restaurant;

  return (
    <Link to={`/restaurant/${id}`} className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-md transform transition-transform duration-300 hover:scale-105 hover:shadow-xl block">
      <img className="p-4 rounded-t-lg object-cover h-48 w-full" src={imageUrl} alt={name} />
      <div className="px-5 pb-5">
        <h5 className="text-xl font-semibold tracking-tight text-gray-900">{name}</h5>
        <p className="text-sm text-gray-600 truncate">{cuisine}</p>
        <div className="flex items-center mt-2.5 mb-5">
          <div className="flex items-center">
            <svg aria-hidden="true" className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <title>Rating star</title>
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.368-2.448a1 1 0 00-1.175 0l-3.368 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z"></path>
            </svg>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded ml-3">{rating}</span>
          </div>
          <span className="text-gray-600 mx-2">|</span>
          <span className="text-gray-600">{deliveryTime} MINS</span>
          <span className="text-gray-600 mx-2">|</span>
          <span className="text-gray-600">₹{costForTwo} FOR TWO</span>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;