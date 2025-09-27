import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRestaurants } from '../redux/slices/restaurantSlice';
import RestaurantCard from '../components/RestaurantCard';
import ShimmerCard from '../components/ShimmerCard';

const Home = () => {
  const dispatch = useDispatch();
  const { list: restaurants, status, error } = useSelector((state) => state.restaurants);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchRestaurants());
    }
  }, [status, dispatch]);

  const renderShimmer = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {Array.from({ length: 8 }).map((_, index) => (
          <ShimmerCard key={index} />
        ))}
      </div>
    );
  };

  let content;

  if (status === 'loading' || status === 'idle') {
    content = renderShimmer();
  } else if (status === 'succeeded') {
    content = (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {restaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
    );
  } else if (status === 'failed') {
    content = <p className="text-center text-red-500">{`Error: ${error}`}</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Restaurants Near You</h1>
      {content}
    </div>
  );
};

export default Home;