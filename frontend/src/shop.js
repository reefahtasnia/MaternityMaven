import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './CSS/home.css';
import './CSS/shop.css';
import axios from 'axios';




const Shop = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [checkboxes, setCheckboxes] = useState({
    all: false,
    maternity: false,
    baby: false,
    food: false,
    clothes: false
  });

  const navigate = useNavigate();

  const getUserFromLocalStorage = () => {
    const userString = localStorage.getItem("user");
    try {
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error("Failed to parse user from local storage:", error);
      return null;
    }
  };

  const auth = getUserFromLocalStorage();
  const userId = auth ? auth.userId : null;
  console.log("Retrieved userId:", userId); // Debug log the userId

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        console.log("eh" ,response.data);
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
     if(products.length == 0) return ;
      console.log("Products:", products);
  },[products]);


  const addToCart = async (product) => {
    try {
      await axios.post('http://localhost:5000/api/cart', {
        productId: product.PRODUCTID,
        title: product.PRODUCT_NAME,
        price: product.PRICE,
        quantity: '1',
        userid: userId 
      });
      setCart([...cart, product]);
      alert("Item added to cart succesfully!");
    } catch (error) {
      alert("Item already added to cart");
      console.error('Error adding product to cart:', error);
    }
  };
  
  
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    if (name === 'all') {
      setCheckboxes({
        all: checked,
        maternity: checked,
        baby: checked,
        food: checked,
        clothes: checked
      });
    } else {
      setCheckboxes((prevCheckboxes) => ({
        ...prevCheckboxes,
        [name]: checked,
        all: false
      }));
    }
  };

  return (
    <div className="container-fluid pt-5">
      <div className="row px-xl-5">
        <div className="col-lg-3 col-md-12">
          <div className="border-bottom mb-4 pb-4">
            <h5 className="font-weight-semi-bold mb-4">Categories</h5>
            <form>
              <div className="custom-control custom-checkbox d-flex align-items-center justify-content-between mb-3">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id="price-all"
                  name="all"
                  checked={checkboxes.all}
                  onChange={handleCheckboxChange}
                />
                <label className="custom-control-label" htmlFor="price-all">All</label>
                <span className="badge border font-weight-normal">1000</span>
              </div>
              <div className="custom-control custom-checkbox d-flex align-items-center justify-content-between mb-3">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id="price-1"
                  name="maternity"
                  checked={checkboxes.maternity}
                  onChange={handleCheckboxChange}
                />
                <label className="custom-control-label" htmlFor="price-1">Maternity products</label>
                <span className="badge border font-weight-normal">150</span>
              </div>
              <div className="custom-control custom-checkbox d-flex align-items-center justify-content-between mb-3">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id="price-2"
                  name="baby"
                  checked={checkboxes.baby}
                  onChange={handleCheckboxChange}
                />
                <label className="custom-control-label" htmlFor="price-2">Baby products & toys</label>
                <span className="badge border font-weight-normal">295</span>
              </div>
              <div className="custom-control custom-checkbox d-flex align-items-center justify-content-between mb-3">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id="price-3"
                  name="food"
                  checked={checkboxes.food}
                  onChange={handleCheckboxChange}
                />
                <label className="custom-control-label" htmlFor="price-3">Food</label>
                <span className="badge border font-weight-normal">246</span>
              </div>
              <div className="custom-control custom-checkbox d-flex align-items-center justify-content-between mb-3">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id="price-4"
                  name="clothes"
                  checked={checkboxes.clothes}
                  onChange={handleCheckboxChange}
                />
                <label className="custom-control-label" htmlFor="price-4">Clothes</label>
                <span className="badge border font-weight-normal">145</span>
              </div>
            </form>
          </div>
        </div>

        <div className="col-lg-9 col-md-12">
          <div className="row pb-3">
            <div className="col-12 pb-1">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <form className="input-group" style={{ maxWidth: '300px' }}>
                  <input type="text" className="form-control" placeholder="Search by name" />
                  <div className="input-group-append">
                    <button className="btn btn-outline-secondary text-dark" type="button">
                      Search
                    </button>
                  </div>
                </form>
                <Link to="/cart">
            <button className="btn btn-primary ml-3">Cart</button>
          </Link>
              </div>
            </div>
              { products.length>0 ? products.map((product, index) => (
              <div className="col-lg-4 col-md-6 col-sm-12 pb-1" key={index}>
                <div className="card product-item border-0 mb-4">
                  <div className="card-header product-img position-relative overflow-hidden bg-transparent border p-0">
                    <img className="img-fluid w-100" src={product.IMAGE} alt={product.PRODUCT_NAME} />
                  </div>
                  <div className="card-body border-left border-right text-center p-0 pt-4 pb-3">
                    <h6 className="text-truncate mb-3">{product.PRODUCT_NAME}</h6>
                    <div className="d-flex justify-content-center">
                      <h6>Price: Tk {product.PRICE}</h6>
                    </div>
                  </div>
                  <div className="card-footer d-flex justify-content-between bg-light border">
                    <button onClick={() => addToCart(product)} className="btn btn-sm text-dark p-0">
                      <i className="fas fa-shopping-cart text-primary mr-1"></i>Add To Cart
                    </button>
                  </div>
                </div>
              </div>
            )): <h1>Loading...</h1>}
            <div className="col-12 pb-1">
              <nav aria-label="Page navigation">
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;