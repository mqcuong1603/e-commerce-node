// src/pages/HomePage.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLandingPageProducts } from '../store/product.slice';
import ProductCard from '../components/product/ProductCard';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const dispatch = useDispatch();
  const { newProducts, bestSellers, categoryProducts, isLoading } = useSelector((state) => state.product);

  useEffect(() => {
    dispatch(fetchLandingPageProducts());
  }, [dispatch]);

  return (
    <main className="main-content">
      {/* Category Navigation */}
      <section className="container-fluid bg-light py-3 mb-4 category-nav">
        <div className="container">
          <div className="row">
            <div className="col-12 d-flex justify-content-between overflow-auto">
              <Link to="/products" className="category-item text-center mx-2">
                <div className="category-icon">
                  <i className="bi bi-laptop"></i>
                </div>
                <div className="category-name">Laptops</div>
              </Link>
              {/* Add more category items here */}
            </div>
          </div>
        </div>
      </section>

      {/* Main Slider/Banner Section */}
      <section className="container mb-4">
        <div id="mainCarousel" className="carousel slide" data-bs-ride="carousel">
          <div className="carousel-inner">
            <div className="carousel-item active">
              <img src="/api/placeholder/1200/400" className="d-block w-100" alt="Special Offers" />
              <div className="carousel-caption d-none d-md-block">
                <h5>Special Offers</h5>
                <p>Discover amazing deals on computer components</p>
              </div>
            </div>
            {/* More carousel items */}
          </div>
          <button className="carousel-control-prev" type="button" data-bs-target="#mainCarousel" data-bs-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#mainCarousel" data-bs-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </section>

      {/* New Products Section */}
      <section className="container mb-5">
        <div className="section-header">
          <h2>New Arrivals</h2>
          <p>Check out our latest products</p>
        </div>
        <div id="new-products">
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading new products...</p>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
              {newProducts?.map(product => (
                <div className="col" key={product._id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="container mb-5">
        <div className="section-header">
          <h2>Best Sellers</h2>
          <p>Our most popular products</p>
        </div>
        <div id="best-sellers">
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading best sellers...</p>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
              {bestSellers?.map(product => (
                <div className="col" key={product._id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Category Products */}
      {!isLoading && categoryProducts && Object.keys(categoryProducts).map(categoryId => (
        <section className="container mb-5" key={categoryId}>
          <div className="section-header">
            <h2>{categoryProducts[categoryId].category.name}</h2>
            <p>Browse our selection of {categoryProducts[categoryId].category.name.toLowerCase()}</p>
          </div>
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
            {categoryProducts[categoryId].products.map(product => (
              <div className="col" key={product._id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <Link to={`/products/category/${categoryProducts[categoryId].category.slug}`} className="btn btn-outline-primary">
              View All {categoryProducts[categoryId].category.name}
            </Link>
          </div>
        </section>
      ))}
    </main>
  );
};

export default HomePage;