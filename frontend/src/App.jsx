import { useEffect, useState } from "react";
import "./App.css";
import Login from "./Login";
const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/products";

function App() {
  // =========================================
  // PRODUCT STATES
  // =========================================

  const [products, setProducts] = useState([]);

  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [finish, setFinish] = useState("");
  const [thickness, setThickness] = useState("");
  const [price, setPrice] = useState("");
  const [availableQuantity, setAvailableQuantity] =
    useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  const [editingProduct, setEditingProduct] =
    useState(null);

  const [productImage, setProductImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [dashboardError, setDashboardError] =
    useState("");
  // =========================================
  // AUTH
  // =========================================

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [showLogin, setShowLogin] = useState(false);
  const [showDashboard, setShowDashboard] =
    useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  // =========================================
  // LOGIN
  // =========================================

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setShowLogin(false);
  };

  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setShowDashboard(false);
  };

  // =========================================
  // FETCH PRODUCTS
  // =========================================

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(
            "Failed to fetch products"
          );
        }

        const data = await response.json();

        setProducts(data.products || []);
      } catch (error) {
        console.error(
          "Fetch products error:",
          error
        );

        setError(
          "Unable to load collection right now."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // =========================================
  // ADD PRODUCT
  // =========================================

  const handleAddProduct = async (e) => {
    e.preventDefault();

    try {
      setDashboardError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Your login session has expired. Please login again."
        );
      }

      if (!selectedFile) {
        throw new Error(
          "Please select a product image."
        );
      }

      const formData = new FormData();

      formData.append("name", productName);
      formData.append("category", category);
      formData.append("description", description);
      formData.append("finish", finish);
      formData.append("thickness", thickness);
      formData.append("price", price);
      formData.append(
        "availableQuantity",
        availableQuantity
      );
      formData.append("image", selectedFile);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      console.log("ADD PRODUCT RESPONSE:", data);

      if (response.status === 401) {
        handleLogout();

        throw new Error(
          "Your login session has expired. Please login again."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          "Failed to add product"
        );
      }

      setProducts((prevProducts) => [
        data.product,
        ...prevProducts,
      ]);

      setProductName("");
      setCategory("");
      setDescription("");
      setFinish("");
      setThickness("");
      setPrice("");
      setAvailableQuantity("");
      setProductImage(null);
      setSelectedFile(null);

      setDashboardError(
        "Product added successfully."
      );

    } catch (error) {
      console.error(
        "Add product error:",
        error
      );

      setDashboardError(error.message);
    }
  };

  // =========================================
  // UPDATE PRODUCT
  // =========================================

  const handleUpdateProduct = async (e) => {
    e.preventDefault();

    try {
      setDashboardError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Your login session has expired. Please login again."
        );
      }

      const formData = new FormData();

      formData.append(
        "name",
        editingProduct.name
      );

      formData.append(
        "category",
        editingProduct.category
      );

      formData.append(
        "description",
        editingProduct.description || ""
      );

      formData.append(
        "finish",
        editingProduct.finish
      );

      formData.append(
        "thickness",
        editingProduct.thickness
      );

      formData.append(
        "price",
        editingProduct.price
      );

      formData.append(
        "availableQuantity",
        editingProduct.availableQuantity
      );

      if (editingProduct.newImageFile) {
        formData.append(
          "image",
          editingProduct.newImageFile
        );
      }

      const response = await fetch(
        `${API_URL}/${editingProduct._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      console.log(
        "UPDATE PRODUCT RESPONSE:",
        data
      );

      if (response.status === 401) {
        handleLogout();

        throw new Error(
          "Your login session has expired. Please login again."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          "Failed to update product"
        );
      }

      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === data.product._id
            ? data.product
            : product
        )
      );

      setEditingProduct(null);

      setDashboardError(
        "Product updated successfully."
      );

    } catch (error) {
      console.error(
        "Update product error:",
        error
      );

      setDashboardError(error.message);
    }
  };
  // =========================================
  // DELETE PRODUCT
  // =========================================

  const handleDeleteProduct = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    try {
      setDashboardError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Your login session has expired. Please login again."
        );
      }

      const response = await fetch(
        `${API_URL}/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log(
        "DELETE PRODUCT RESPONSE:",
        data
      );

      if (response.status === 401) {
        handleLogout();

        throw new Error(
          "Your login session has expired. Please login again."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          "Failed to delete product"
        );
      }

      setProducts((prevProducts) =>
        prevProducts.filter(
          (product) =>
            product._id !== id
        )
      );

      if (selectedProduct?._id === id) {
        setSelectedProduct(null);
      }

      if (editingProduct?._id === id) {
        setEditingProduct(null);
      }

      setDashboardError(
        "Product deleted successfully."
      );

    } catch (error) {
      console.error(
        "Delete product error:",
        error
      );

      setDashboardError(error.message);
    }
  };

  // =========================================
  // FILTER
  // =========================================

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter(
        (product) =>
          product.category ===
          selectedCategory
      );

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="site">

      {/* =====================================
          NAVBAR
      ===================================== */}

      <nav className="navbar">

        {/* BRAND */}

        <a
          href="#home"
          className="brand"
          onClick={() => setMenuOpen(false)}
        >
          <span className="brand-top">
            MANOJ
          </span>

          <span className="brand-bottom">
            MARBLE
          </span>
        </a>


        {/* DESKTOP NAVIGATION */}

        <div className="desktop-nav">

          <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="#collection" onClick={() => setMenuOpen(false)}>Collection</a>
          <a href="#visit" onClick={() => setMenuOpen(false)}>Visit Us</a>


          {!user && (
            <button
              type="button"
              className="nav-owner-btn"
              onClick={() => setShowLogin(true)}
            >
              Owner
            </button>
          )}


          {user?.role === "owner" && (
            <>
              <button
                type="button"
                className="nav-dashboard-btn"
                onClick={() =>
                  setShowDashboard(true)
                }
              >
                Dashboard
              </button>

              <button
                type="button"
                className="nav-logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}

        </div>


        {/* MOBILE MENU BUTTON */}

        <button
          type="button"
          className={
            menuOpen
              ? "menu-toggle open"
              : "menu-toggle"
          }
          onClick={() =>
            setMenuOpen((prev) => !prev)
          }
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>


        {/* MOBILE MENU */}

        <div
          className={
            menuOpen
              ? "mobile-menu open"
              : "mobile-menu"
          }
        >

          <a
            href="#home"
            onClick={() => setMenuOpen(false)}
          >
            Home
          </a>

          <a
            href="#collection"
            onClick={() => setMenuOpen(false)}
          >
            Collection
          </a>

          <a
            href="#visit"
            onClick={() => setMenuOpen(false)}
          >
            Visit Us
          </a>


          {!user && (
            <button
              type="button"
              className="mobile-owner-btn"
              onClick={() => {
                setMenuOpen(false);
                setShowLogin(true);
              }}
            >
              Owner Login
            </button>
          )}


          {user?.role === "owner" && (
            <>
              <button
                type="button"
                className="mobile-dashboard-btn"
                onClick={() => {
                  setMenuOpen(false);
                  setShowDashboard(true);
                }}
              >
                Dashboard
              </button>

              <button
                type="button"
                className="mobile-logout-btn"
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
              >
                Logout
              </button>
            </>
          )}

        </div>

      </nav>

      {/* =====================================
          LOGIN MODAL
      ===================================== */}

      {showLogin && (
        <div className="overlay">

          <div className="login-modal">

            <button
              type="button"
              className="close-btn"
              onClick={() =>
                setShowLogin(false)
              }
            >
              ×
            </button>

            <Login
              onLogin={handleLogin}
            />

          </div>
        </div>
      )}


      {/* =====================================
          HOME / HERO
      ===================================== */}

      <section
        className="hero"
        id="home"
      >

        <div className="hero-copy">

          <p className="eyebrow">
            PREMIUM MARBLE • GRANITE
          </p>

          <h1>
            Timeless Stone.
            <br />
            Exceptional Spaces.
          </h1>

          <p className="hero-description">
            Discover premium Indian and Italian
            marble, granite   selected
            for elegant homes, apartments and
            commercial spaces.
          </p>


          <div className="hero-actions">

            <button
              type="button"
              className="btn-primary"
              onClick={() =>
                document
                  .getElementById("collection")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              Explore Collection
            </button>


            <button
              type="button"
              className="btn-secondary"
              onClick={() =>
                document
                  .getElementById("visit")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              Visit Showroom
            </button>

          </div>

        </div>


        <div className="hero-image-area">

          <div className="hero-image-frame">

            <div className="hero-brand-visual">

              <div className="brand-visual-content">

                <span className="brand-visual-small">
                  ESTABLISHED IN RAJKOT
                </span>

                <h2>
                  MANOJ
                  <br />
                  MARBLE
                </h2>

                <span className="brand-visual-line" />

                <p>
                  Premium Marble
                  <br />
                  Granite
                </p>

              </div>

            </div>

          </div>

          <div className="hero-badge">

            <span>
              CRAFTED FOR
            </span>

            <strong>
              BEAUTIFUL SPACES
            </strong>

          </div>

        </div>

      </section>


      {/* =====================================
          COLLECTION
      ===================================== */}

      <section
        className="collection-section"
        id="collection"
      >

        <div className="section-intro">

          <div className="collection-heading">

            <div className="collection-line" />

            <p className="eyebrow">
              OUR COLLECTION
            </p>

            <div className="collection-line" />

          </div>

          <h2>
            Stone, Selected
            <br />
            With Purpose.
          </h2>

          <p>
            Natural beauty, distinctive finishes and
            premium surfaces chosen for elegant spaces.
          </p>

        </div>


        <div className="filters">

          {[
            "All",
            "Indian Marble",
            "Italian Marble",
            "Granite",

          ].map((item) => (

            <button
              key={item}
              type="button"
              className={
                selectedCategory === item
                  ? "filter active"
                  : "filter"
              }
              onClick={() =>
                setSelectedCategory(item)
              }
            >
              {item}
            </button>

          ))}

        </div>


        {error && (
          <div className="error-box">
            {error}
          </div>
        )}


        {loading ? (

          <div className="loading">
            Loading collection...
          </div>

        ) : (

          <div className="product-grid">

            {filteredProducts.length > 0 ? (

              filteredProducts.map(
                (product) => (

                  <article
                    key={product._id}
                    className="product-card"
                  >

                    <div className="product-image-wrap">

                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="product-image"
                        />
                      ) : (
                        <div className="image-empty">
                          No Image
                        </div>
                      )}

                    </div>


                    <div className="product-card-body">

                      <p className="product-category">
                        {product.category}
                      </p>

                      <h3>
                        {product.name}
                      </h3>

                      <p className="product-description">
                        {product.description ||
                          "Premium material for elegant spaces."}
                      </p>


                      <div className="product-meta">

                        <div>
                          <span>
                            FINISH
                          </span>

                          <strong>
                            {product.finish}
                          </strong>
                        </div>

                        <div>
                          <span>
                            THICKNESS
                          </span>

                          <strong>
                            {product.thickness}
                          </strong>
                        </div>

                        <div>
                          <span>
                            PRICE
                          </span>

                          <strong>
                            ₹{product.price}
                          </strong>
                        </div>

                      </div>


                      <button
                        type="button"
                        className="details-btn"
                        onClick={() =>
                          setSelectedProduct(
                            product
                          )
                        }
                      >
                        View Details
                      </button>

                    </div>

                  </article>

                )

              )

            ) : (

              !error && (
                <div className="empty">
                  No products available in this category.
                </div>
              )

            )}

          </div>
        )}

      </section>


      {/* =====================================
          VISIT US
      ===================================== */}

      <section
        className="visit-section"
        id="visit"
      >

        <div className="visit-wrapper">

          <div className="visit-content">

            <p className="eyebrow light">
              VISIT MANOJ MARBLE
            </p>

            <h2>
              Come See The
              <br />
              Collection Yourself.
            </h2>

            <p>
              The best way to choose marble is
              to see the slab, colour and finish
              in person. Visit our showroom and
              explore the collection with us.
            </p>

            <div className="visit-actions">

              <a
                href="https://www.google.com/maps/place/Manoj+marble+shop+tiles,+indian+marble+and+Italian+marble/@22.2648086,70.7440485,21z/data=!4m14!1m7!3m6!1s0x3959cb006cf3d4a9:0x77a850235a2cd7b3!2sManoj+marble+shop+tiles,+indian+marble+and+Italian+marble!8m2!3d22.2647683!4d70.7441164!16s%2Fg%2F11zjl7mqcb!3m5!1s0x3959cb006cf3d4a9:0x77a850235a2cd7b3!8m2!3d22.2647683!4d70.7441164!16s%2Fg%2F11zjl7mqcb?entry=ttu&g_ep=EgoyMDI2MDkwMi4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noreferrer"
                className="visit-btn light-btn"
              >
                Get Directions
              </a>

              <a
                href="tel:+917887799111"
                className="visit-btn dark-btn"
              >
                Call Us
              </a>

            </div>

          </div>


          <div className="visit-panel">

            <div className="panel-label">
              SHOWROOM
            </div>

            <div className="panel-row">
              <span>
                Location
              </span>

              <strong>
                Manoj Marble,
                Golder Park,Opp.White Heaven,Nr.Sunshine College,New Feet Ring Road, Rajkot, Gujarat 360005.
              </strong>
            </div>

            <div className="panel-row">
              <span>
                Hours
              </span>

              <strong>
                Monday – Sunday, 9:00 AM – 9:00 PM
              </strong>
            </div>

            <div className="panel-row">
              <span>
                Phone
              </span>

              <strong>
                +91 78877 99111
              </strong>
            </div>

            <div className="panel-bottom">
              Premium Marble · Granite
            </div>

          </div>

        </div>

      </section>


      {/* =====================================
          VIEW DETAILS
      ===================================== */}

      {selectedProduct && (

        <div className="overlay">

          <div className="details-modal">

            <button
              type="button"
              className="close-btn"
              onClick={() =>
                setSelectedProduct(null)
              }
            >
              ×
            </button>


            <div className="details-image">

              {selectedProduct.image ? (
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                />
              ) : (
                <div className="image-empty">
                  No Image
                </div>
              )}

            </div>


            <div className="details-content">

              <p className="product-category">
                {selectedProduct.category}
              </p>

              <h2>
                {selectedProduct.name}
              </h2>

              <p>
                {selectedProduct.description ||
                  "Premium material for elegant spaces."}
              </p>


              <div className="details-grid">

                <div>
                  <span>
                    Finish
                  </span>

                  <strong>
                    {selectedProduct.finish}
                  </strong>
                </div>

                <div>
                  <span>
                    Thickness
                  </span>

                  <strong>
                    {selectedProduct.thickness}
                  </strong>
                </div>

                <div>
                  <span>
                    Price
                  </span>

                  <strong>
                    ₹{selectedProduct.price} / sq.ft
                  </strong>
                </div>

                <div>
                  <span>
                    Available
                  </span>

                  <strong>
                    {selectedProduct.availableQuantity} sq.ft
                  </strong>
                </div>

              </div>

            </div>

          </div>

        </div>
      )}


      {/* =====================================
          OWNER DASHBOARD
      ===================================== */}

      {user?.role === "owner" &&
        showDashboard && (

          <div className="overlay dashboard-overlay">

            <div className="dashboard">

              <div className="dashboard-top">
                {dashboardError && (
                  <div
                    className={
                      dashboardError.includes(
                        "successfully"
                      )
                        ? "dashboard-message success"
                        : "dashboard-message error"
                    }
                  >
                    {dashboardError}
                  </div>
                )}

                <div>
                  <p className="dashboard-eyebrow">
                    OWNER AREA
                  </p>

                  <h2>
                    Product Management
                  </h2>

                  <p>
                    Manage the materials displayed
                    on the Manoj Marble website.
                  </p>
                </div>


                <button
                  type="button"
                  className="close-btn dashboard-close"
                  onClick={() =>
                    setShowDashboard(false)
                  }
                >
                  ×
                </button>

              </div>


              <form
                className="admin-form"
                onSubmit={handleAddProduct}
              >

                <div className="form-title">
                  Add New Product
                </div>


                <div className="form-grid">

                  <div className="form-group full">

                    <label>
                      Product Photo
                    </label>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {

                        const file =
                          e.target.files[0];

                        if (file) {

                          setSelectedFile(file);

                          setProductImage(
                            URL.createObjectURL(
                              file
                            )
                          );
                        }
                      }}
                      required
                    />


                    {productImage && (
                      <img
                        src={productImage}
                        alt="Preview"
                        className="admin-preview"
                      />
                    )}

                  </div>


                  <div className="form-group">

                    <label>
                      Product Name
                    </label>

                    <input
                      type="text"
                      placeholder="e.g. Statuario"
                      value={productName}
                      onChange={(e) =>
                        setProductName(
                          e.target.value
                        )
                      }
                      required
                    />

                  </div>


                  <div className="form-group">

                    <label>
                      Category
                    </label>

                    <select
                      value={category}
                      onChange={(e) =>
                        setCategory(
                          e.target.value
                        )
                      }
                      required
                    >

                      <option value="">
                        Select Category
                      </option>

                      <option value="Indian Marble">
                        Indian Marble
                      </option>

                      <option value="Italian Marble">
                        Italian Marble
                      </option>

                      <option value="Granite">
                        Granite
                      </option>



                    </select>

                  </div>


                  <div className="form-group">

                    <label>
                      Finish
                    </label>

                    <input
                      type="text"
                      placeholder="Polished"
                      value={finish}
                      onChange={(e) =>
                        setFinish(
                          e.target.value
                        )
                      }
                      required
                    />

                  </div>


                  <div className="form-group">

                    <label>
                      Thickness
                    </label>

                    <input
                      type="text"
                      placeholder="18 mm"
                      value={thickness}
                      onChange={(e) =>
                        setThickness(
                          e.target.value
                        )
                      }
                      required
                    />

                  </div>


                  <div className="form-group">

                    <label>
                      Price / sq.ft
                    </label>

                    <input
                      type="number"
                      placeholder="180"
                      value={price}
                      onChange={(e) =>
                        setPrice(
                          e.target.value
                        )
                      }
                      required
                    />

                  </div>


                  <div className="form-group">

                    <label>
                      Available Quantity
                    </label>

                    <input
                      type="number"
                      placeholder="450"
                      value={availableQuantity}
                      onChange={(e) =>
                        setAvailableQuantity(
                          e.target.value
                        )
                      }
                      required
                    />

                  </div>


                  <div className="form-group full">

                    <label>
                      Description
                    </label>

                    <textarea
                      placeholder="Describe the material..."
                      value={description}
                      onChange={(e) =>
                        setDescription(
                          e.target.value
                        )
                      }
                      required
                    />

                  </div>

                </div>


                <button
                  type="submit"
                  className="admin-submit"
                >
                  Add Product
                </button>

              </form>


              <div className="dashboard-products">

                <div className="form-title">
                  Existing Products
                </div>

                {products.length === 0 ? (

                  <p className="dashboard-empty">
                    No products added yet.
                  </p>

                ) : (

                  <div className="admin-product-list">

                    {products.map(
                      (product) => (

                        <div
                          className="admin-product-row"
                          key={product._id}
                        >

                          {product.image ? (
                            <img
                              src={
                                product.image
                              }
                              alt={
                                product.name
                              }
                            />
                          ) : (
                            <div className="admin-thumb-empty">
                              —
                            </div>
                          )}


                          <div className="admin-product-info">

                            <strong>
                              {product.name}
                            </strong>

                            <span>
                              {product.category}
                            </span>

                          </div>


                          <button
                            type="button"
                            className="row-edit"
                            onClick={() =>
                              setEditingProduct(
                                product
                              )
                            }
                          >
                            Edit
                          </button>


                          <button
                            type="button"
                            className="row-delete"
                            onClick={() =>
                              handleDeleteProduct(
                                product._id
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>

                      )
                    )}

                  </div>

                )}

              </div>

            </div>

          </div>
        )}


      {/* =====================================
          EDIT PRODUCT MODAL
      ===================================== */}

      {user?.role === "owner" &&
        editingProduct && (

          <div className="overlay">

            <div className="edit-modal">

              <button
                type="button"
                className="close-btn"
                onClick={() =>
                  setEditingProduct(null)
                }
              >
                ×
              </button>


              <div className="edit-head">
                <p className="dashboard-eyebrow">
                  OWNER AREA
                </p>

                <h2>
                  Edit Product
                </h2>
              </div>


              <form
                className="admin-form"
                onSubmit={
                  handleUpdateProduct
                }
              >

                <div className="form-grid">

                  <div className="form-group full">

                    <label>
                      Product Photo
                    </label>


                    {editingProduct.image && (
                      <img
                        src={
                          editingProduct.image
                        }
                        alt={
                          editingProduct.name
                        }
                        className="admin-preview"
                      />
                    )}


                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {

                        const file =
                          e.target.files[0];

                        if (file) {

                          setEditingProduct({
                            ...editingProduct,
                            newImageFile:
                              file,
                            image:
                              URL.createObjectURL(
                                file
                              ),
                          });

                        }
                      }}
                    />

                  </div>


                  <div className="form-group">

                    <label>
                      Product Name
                    </label>

                    <input
                      type="text"
                      value={
                        editingProduct.name
                      }
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          name:
                            e.target.value,
                        })
                      }
                      required
                    />

                  </div>


                  <div className="form-group">

                    <label>
                      Category
                    </label>

                    <select
                      value={
                        editingProduct.category
                      }
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          category:
                            e.target.value,
                        })
                      }
                      required
                    >

                      <option value="Indian Marble">
                        Indian Marble
                      </option>

                      <option value="Italian Marble">
                        Italian Marble
                      </option>

                      <option value="Granite">
                        Granite
                      </option>



                    </select>

                  </div>


                  <div className="form-group">

                    <label>
                      Finish
                    </label>

                    <input
                      type="text"
                      value={
                        editingProduct.finish
                      }
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          finish:
                            e.target.value,
                        })
                      }
                      required
                    />

                  </div>


                  <div className="form-group">

                    <label>
                      Thickness
                    </label>

                    <input
                      type="text"
                      value={
                        editingProduct.thickness
                      }
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          thickness:
                            e.target.value,
                        })
                      }
                      required
                    />

                  </div>


                  <div className="form-group">

                    <label>
                      Price / sq.ft
                    </label>

                    <input
                      type="number"
                      value={
                        editingProduct.price
                      }
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          price:
                            e.target.value,
                        })
                      }
                      required
                    />

                  </div>


                  <div className="form-group">

                    <label>
                      Available Quantity
                    </label>

                    <input
                      type="number"
                      value={
                        editingProduct.availableQuantity
                      }
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          availableQuantity:
                            e.target.value,
                        })
                      }
                      required
                    />

                  </div>


                  <div className="form-group full">

                    <label>
                      Description
                    </label>

                    <textarea
                      value={
                        editingProduct.description ||
                        ""
                      }
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          description:
                            e.target.value,
                        })
                      }
                      required
                    />

                  </div>

                </div>


                <button
                  type="submit"
                  className="admin-submit"
                >
                  Save Changes
                </button>

              </form>

            </div>

          </div>
        )}


      {/* =====================================
          FOOTER
      ===================================== */}

      <footer className="footer">

        <div className="footer-inner">

          <div>

            <a
              href="#home"
              className="footer-brand"
            >
              MANOJ MARBLE
            </a>

            <p>
              Premium Marble · Granite
            </p>

          </div>


          <div className="footer-links">

            <a href="#home">
              Home
            </a>

            <a href="#collection">
              Collection
            </a>

            <a href="#visit">
              Visit Us
            </a>

          </div>

        </div>


        <div className="footer-bottom">

          <span>
            Rajkot, Gujarat
          </span>

          <span>
            © 2026 Manoj Marble
          </span>

        </div>

      </footer>

    </div>
  );
}

export default App;