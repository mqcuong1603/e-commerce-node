// src/pages/OrderHistoryPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import OrderService from '../services/order.service';
import { formatPrice, formatDate } from '../utils/formatters';
import Pagination from '../components/common/Pagination';
import { toast } from 'react-toastify';

const OrderHistoryPage = () => {
  const { isLoggedIn } = useSelector(state => state.auth);
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  
  useEffect(() => {
    // Redirect to login if not logged in
    if (!isLoggedIn) {
      navigate('/login', { state: { from: '/orders' } });
      return;
    }
    
    fetchOrders(pagination.page);
  }, [isLoggedIn, navigate, pagination.page]);
  
  const fetchOrders = async (page) => {
    setLoading(true);
    try {
      const response = await OrderService.getUserOrders({ page, limit: pagination.limit });
      setOrders(response.data.orders);
      setPagination(response.data.pagination);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch orders');
      toast.error('Failed to load your orders');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };
  
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'bg-warning';
      case 'confirmed': return 'bg-info';
      case 'processing': return 'bg-primary';
      case 'shipping': return 'bg-primary';
      case 'delivered': return 'bg-success';
      case 'cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };
  
  if (loading && orders.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading your orders...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }
  
  return (
    <main className="main-content py-5">
      <div className="container">
        <h1 className="mb-4">Order History</h1>
        
        {orders.length === 0 ? (
          <div className="card text-center p-5">
            <h4 className="mb-4">You don't have any orders yet</h4>
            <p className="mb-4">Once you place an order, it will appear here.</p>
            <Link to="/products" className="btn btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <>
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Your Orders</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Order Number</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Items</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order._id}>
                          <td>{order.orderNumber}</td>
                          <td>{formatDate(order.createdAt)}</td>
                          <td>{formatPrice(order.total)}</td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(order.status.status)}`}>
                              {order.status.status.charAt(0).toUpperCase() + order.status.status.slice(1)}
                            </span>
                          </td>
                          <td>{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</td>
                          <td>
                            <Link 
                              to={`/orders/${order._id}`} 
                              className="btn btn-sm btn-outline-primary me-2"
                            >
                              View
                            </Link>
                            {['pending', 'confirmed'].includes(order.status.status) && (
                              <button 
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => navigate(`/orders/${order._id}?cancel=true`)}
                              >
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Pagination 
                currentPage={pagination.page} 
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default OrderHistoryPage;