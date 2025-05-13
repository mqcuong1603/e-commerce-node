// src/pages/ProductsPage.jsx
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchBrands } from '../store/product.slice';
import ProductCard from '../components/product/ProductCard';
import Pagination from '../components/common/Pagination';
import Breadcrumb from '../components/common/Breadcrumb';

const ProductsPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { products, brands, pagination, isLoading } = useSelector((state) => state.product);
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page')) || 1
  });

  useEffect(() => {
    // Fetch brands for filter dropdown
    dispatch(fetchBrands());
    
    // Update search params from filters
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.brand) params.brand = filters.brand;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.sort) params.sort = filters.sort;
    if (filters.page > 1) params.page = filters.page;
    
    setSearchParams(params);
    
    // Fetch products with filters
    dispatch(fetchProducts({
      category: slug,
      ...filters
    }));
  }, [dispatch, slug, filters, setSearchParams]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Reset to page 1 when filters change
    }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    // The useEffect will handle the API call
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      sort: 'newest',
      page: 1
    });
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
    window.scrollTo(0, 0);
  };

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: slug ? 'Categories' : 'Products', url: slug ? '/products' : null },
    slug ? { name: slug.charAt(0).toUpperCase() + slug.slice(1), url: null } : null
  ].filter(Boolean);

  return (
    <main className="main-content py-5">
      <div className="container">
        <Breadcrumb items={breadcrumbItems} />

        <div className="row">
          {/* Filters Sidebar */}
          <div className="col-lg-3">
            <div className="filters-sidebar">
              <h4>Filters</h4>
              <form id="filter-form" onSubmit={handleFilterSubmit}>
                <div className="mb-3">
                  <label htmlFor="search" className="form-label">Search</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="search" 
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="brand-select" className="form-label">Brand</label>
                  <select 
                    className="form-select" 
                    id="brand-select" 
                    name="brand"
                    value={filters.brand}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Brands</option>
                    {brands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Price Range</label>
                  <div className="price-range d-flex">
                    <input 
                      type="number" 
                      className="form-control me-2" 
                      id="min-price" 
                      name="minPrice"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={handleFilterChange}
                    />
                    <span className="align-self-center mx-2">-</span>
                    <input 
                      type="number" 
                      className="form-control ms-2" 
                      id="max-price" 
                      name="maxPrice"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>
                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary">Apply Filters</button>
                  <button type="button" className="btn btn-outline-secondary" onClick={handleClearFilters}>
                    Clear Filters
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Products */}
          <div className="col-lg-9">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 id="products-title">{slug ? `${slug.charAt(0).toUpperCase() + slug.slice(1)}` : 'All Products'}</h2>
              <div className="d-flex align-items-center">
                <label htmlFor="sort-select" className="me-2">Sort by:</label>
                <select 
                  className="form-select form-select-sm" 
                  id="sort-select"
                  name="sort"
                  value={filters.sort}
                  onChange={handleFilterChange}
                >
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name_asc">Name: A to Z</option>
                  <option value="name_desc">Name: Z to A</option>
                  <option value="bestselling">Best Selling</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

            <div id="products-container">
              {isLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading products...</p>
                </div>
              ) : products.length > 0 ? (
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                  {products.map(product => (
                    <div className="col" key={product._id}>
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-search display-1 text-muted"></i>
                  <p className="mt-3">No products found matching your criteria.</p>
                  <button className="btn btn-outline-primary mt-2" onClick={handleClearFilters}>
                    Clear Filters
                  </button>
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <Pagination 
                currentPage={filters.page} 
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProductsPage;