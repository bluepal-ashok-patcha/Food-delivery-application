import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Typography, Box } from '@mui/material';
import { fetchOrders } from '../../store/slices/orderSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import OrderCard from '../../components/orders/OrderCard';
import EmptyOrdersCard from '../../components/orders/EmptyOrdersCard';

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchOrders({ userId: user.id }));
    }
  }, [dispatch, user]);

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading orders..." />;
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, fontSize: '20px' }}>
        Your Orders
      </Typography>
      {orders.length === 0 ? (
        <EmptyOrdersCard />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </Box>
      )}
    </Container>
  );
};

export default OrdersPage;
