import React, { useState, useEffect, useCallback } from "react";  
import { Connection, PublicKey, Transaction, SystemProgram, clusterApiUrl } from "@solana/web3.js";
import "./App.css";  // Import the CSS file
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import debounce from "lodash/debounce"; // For debouncing quantity updates
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faHome, faShoppingCart, faClipboardList, faHeadset, faSun, faMoon, faCartPlus, faTrash } from '@fortawesome/free-solid-svg-icons';


// Firebase configuration (untouched)
const firebaseConfig = {
  apiKey: "AIzaSyAW3MoEd0v5CqPAKMozHk5ta-d0N-cbtbI",
  authDomain: "onlinestore-d7ec6.firebaseapp.com",
  projectId: "onlinestore-d7ec6",
  storageBucket: "onlinestore-d7ec6.firebasestorage.app",
  messagingSenderId: "139634849830",
  appId: "1:139634849830:web:49cd29fbdb23fbaad58ee7",
  measurementId: "G-7YQKQH6BF0"
};

// Initialize Firebase (untouched)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const analytics = getAnalytics(app);

// Configurable recipient wallet address (replace with actual address in production)
const RECIPIENT_WALLET_ADDRESS = "YOUR_WALLET_ADDRESS"; // Placeholder; use environment variables in production

// Sample product data (consider fetching from a backend or decentralized storage in production)
const PRODUCTS = [
  {  
    id: 1, 
    name: "HP Elitebook", 
    price: 0.5, 
    image: "public/HP_Elitebook_1.jpg", 
    description: "A powerful laptop for professionals with a sleek design and long battery life.",
    brand: "HP",
    colors: ["Silver", "Black"],
    sizes: ["13-inch", "15-inch"],
    storage: ["256GB", "512GB", "1TB"],
    models: ["Elitebook 830", "Elitebook 850"],
    discountedPrice: 0.45,
    dateAdded: "2023-01-15",
    piecesRemaining: 10,
    type: "PC"
  },
  { 
    id: 2, 
    name: "Mac Book", 
    price: 0.2, 
    image: "/cap.png",
    description: "A premium laptop with excellent performance and macOS integration.",
    brand: "Mac",
    colors: ["Silver", "Space Gray", "Gold"],
    sizes: ["13-inch", "16-inch"],
    storage: ["256GB", "512GB", "1TB"],
    models: ["MacBook Air", "MacBook Pro"],
    discountedPrice: 0.18,
    dateAdded: "2023-02-10",
    piecesRemaining: 5,
    type: "PC"
  },
  { 
    id: 3, 
    name: "HP Z-Book", 
    price: 1, 
    image: "/public/HP Z-Book 1.jpg",
    description: "A powerful laptop for professionals with a sleek design and long battery life.",
    brand: "HP",
    colors: ["Silver", "Black"],
    sizes: ["13-inch", "15-inch"],
    storage: ["256GB", "512GB", "1TB"],
    models: ["Elitebook 830", "Elitebook 850"],
    discountedPrice: 0.9,
    dateAdded: "2023-03-05",
    piecesRemaining: 8,
    type: "PC"
  },
  { 
    id: 4, 
    name: "Geo Book", 
    price: 1, 
    image: "/sneakers.png",
    description: "A budget-friendly laptop with decent performance.",
    brand: "Geo",
    type: "PC"
  },
  { 
    id: 5, 
    name: "Protege", 
    price: 1, 
    image: "/sneakers.png",
    description: "A versatile laptop for everyday use.",
    brand: "Protege"
  },
  { 
    id: 6, 
    name: "Mac Book Air", 
    price: 1, 
    image: "/sneakers.png",
    description: "A lightweight and powerful laptop.",
    brand: "Mac"
  },
  { 
    id: 7, 
    name: "Dell Latitude", 
    price: 1, 
    image: "/sneakers.png",
    description: "A reliable laptop for business professionals.",
    brand: "Dell"
  },
  { 
    id: 8, 
    name: "Toshiba Protege", 
    price: 1, 
    image: "/sneakers.png",
    description: "A durable laptop with good performance.",
    brand: "Toshiba"
  },
  { 
    id: 9, 
    name: "ASUS V", 
    price: 1, 
    image: "/sneakers.png",
    description: "A high-performance laptop for gaming and work.",
    brand: "ASUS"
  },
  { 
    id: 10, 
    name: "HP Prototype", 
    price: 1, 
    image: "/sneakers.png",
    description: "An experimental laptop with cutting-edge features.",
    brand: "HP"
  },
  { 
    id: 11, 
    name: "Thinkpad", 
    price: 1, 
    image: "/sneakers.png",
    description: "A robust laptop for business and personal use.",
    brand: "Thinkpad"
  },
  { 
    id: 12, 
    name: "HP Pavillion", 
    price: 1, 
    image: "/sneakers.png",
    description: "A stylish laptop with good performance.",
    brand: "HP"
  },
  { 
    id: 13, 
    name: "HP Pro-Book", 
    price: 1, 
    image: "/sneakers.png",
    description: "A professional-grade laptop with excellent features.",
    brand: "HP"
  },
  { 
    id: 14, 
    name: "Note Book", 
    price: 1, 
    image: "/sneakers.png",
    description: "A simple and affordable laptop.",
    brand: "Note Book"
  },
  { 
    id: 15, 
    name: "COMPAQ", 
    price: 1, 
    image: "/sneakers.png",
    description: "A reliable laptop for everyday use.",
    brand: "COMPAQ"
  },
  { 
    id: 16, 
    name: "Samsung", 
    price: 1, 
    image: "/sneakers.png",
    description: "A sleek and powerful laptop.",
    brand: "Samsung"
  },
  { 
    id: 17, 
    name: "Sony", 
    price: 1, 
    image: "/sneakers.png",
    description: "A premium laptop with excellent features.",
    brand: "Sony"
  },
  { 
    id: 18, 
    name: "Lenovo", 
    price: 1, 
    image: "/sneakers.png",
    description: "A versatile laptop for work and play.",
    brand: "Lenovo"
  },
  { 
    id: 19, 
    name: "Toshiba", 
    price: 1, 
    image: "/sneakers.png",
    description: "A durable laptop with good performance.",
    brand: "Toshiba"
  },
  { 
    id: 20, 
    name: "DELL", 
    price: 1, 
    image: "/sneakers.png",
    description: "A reliable laptop for business professionals.",
    brand: "Dell"
  },
];

// Pagination settings
const PRODUCTS_PER_PAGE = 10;

const Settings = ({ isOpen, onClose, onSave, settings }) => {
  const [localSettings, setLocalSettings] = useState({ ...settings });

  const handleChange = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="settings-modal">
      <div className="settings-content">
        <h2>Settings</h2>
        
        <div>
          <label>
            Theme:
            <select 
              value={localSettings.theme}
              onChange={(e) => handleChange('theme', e.target.value)}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System Default</option>
            </select>
          </label>
        </div>

        <div>
          <label>
            Currency:
            <select 
              value={localSettings.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
            >
              <option value="SOL">SOL</option>
              <option value="USDC">USDC (Coming Soon)</option>
            </select>
          </label>
        </div>

        <button onClick={() => onSave(localSettings)}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

const USDC_TO_SOL_RATE = 0.1; // Example conversion rate, replace with actual rate

const CATEGORIES = [
  "HP",
  "Mac",
  "Dell",
  "Toshiba",
  "ASUS",
  "Thinkpad",
  "Samsung",
  "Sony",
  "Lenovo",
  "COMPAQ",
  "Geo",
  "Protege",
  "Note Book"
];

const CartPage = ({ cart, getTotalPrice, settings, checkout, loading, removeFromCart, updateQuantity }) => {
  return (
    <div>
      <h2>Cart</h2>
      {cart.length === 0 ? (
        <p>No items in the cart.</p>
      ) : (
        <div className="cart-items">
          {cart.map((item) => (
            <div key={item.id} className="cart-item">
              <img src={item.image} alt={item.name} className="cart-item-image" />
              <div className="cart-item-details">
                <h3>{item.name}</h3>
                <p>Price: {item.price} {settings.currency}</p>
                <div className="quantity-controls">
                  <button 
                    className="quantity-button" 
                    onClick={() => updateQuantity(item.id, -1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="quantity-display">{item.quantity}</span>
                  <button 
                    className="quantity-button" 
                    onClick={() => updateQuantity(item.id, 1)}
                  >
                    +
                  </button>
                </div>
                <p>Total: {item.price * item.quantity} {settings.currency}</p>
                <button 
                  className="remove-from-cart" 
                  onClick={() => removeFromCart(item.id)}
                >
                  <FontAwesomeIcon icon={faTrash} /> Remove
                </button>
              </div>
            </div>
          ))}
          <div className="total-price">
            <h3>Total Price: {getTotalPrice()} {settings.currency}</h3>
          </div>
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status"></div>
              <span className="visually-hidden">Processing Transaction...</span>
            </div>
          ) : (
            <button onClick={checkout} className="proceed-to-payment-btn">
              Proceed to Payment
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const FLASH_SALE_PRODUCTS = [
  {  
    id: 1, 
    name: "HP Elitebook", 
    price: 0.5, 
    image: "public/HP_Elitebook_1.jpg", 
    description: "A powerful laptop for professionals with a sleek design and long battery life.",
    brand: "HP"
  },
  { 
    id: 2, 
    name: "Mac Book", 
    price: 0.2, 
    image: "/cap.png",
    description: "A premium laptop with excellent performance and macOS integration.",
    brand: "Mac"
  },
  { 
    id: 3, 
    name: "HP Z-Book", 
    price: 1, 
    image: "/public/HP Z-Book 1.jpg",
    description: "A powerful laptop for professionals with a sleek design and long battery life.",
    brand: "HP"
  }
];

const Store = () => {
  const { publicKey, sendTransaction, connect, disconnect } = useWallet();
  const [cart, setCart] = useState(() => {
    // Load cart from localStorage on initial render
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addedToCartMessage, setAddedToCartMessage] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    theme: localStorage.getItem('theme') || 'system',
    currency: 'SOL' // Default currency
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(""); // New state for search query
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [activePage, setActivePage] = useState("home"); // New state for active page
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Check for user's preferred color scheme or saved preference
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let theme = settings.theme;
    
    if (theme === 'system') {
      theme = prefersDarkScheme ? 'dark' : 'light';
    }

    setDarkMode(theme === 'dark');
    
    auth.onAuthStateChanged((user) => {
      setUser(user);
    });
  }, [settings.theme]);

  useEffect(() => {
    // Persist cart to localStorage whenever it changes
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % FLASH_SALE_PRODUCTS.length);
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(slideInterval);
  }, []);

  const handlePrevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + FLASH_SALE_PRODUCTS.length) % FLASH_SALE_PRODUCTS.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % FLASH_SALE_PRODUCTS.length);
  };

  // Filter products based on search query and selected category
  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesSearchQuery = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? product.brand === selectedCategory : true;
    return matchesSearchQuery && matchesCategory;
  });

  // Reset currentPage to 1 when search query or selected category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const toggleMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.body.classList.toggle("dark-mode", newMode);
    document.body.classList.toggle("light-mode", !newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    // Add animation for theme change
    document.body.classList.add('theme-transition');
    setTimeout(() => {
      document.body.classList.remove('theme-transition');
    }, 500);
  };

  const saveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('theme', newSettings.theme);
    setSettingsOpen(false);
  };


  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error("Error during Google sign-in: ", error.message);
      alert("An error occurred while signing in.");
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item.id === product.id);
      if (existingProduct) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });

    const totalQuantity = cart.filter((item) => item.id === product.id).reduce((sum, item) => sum + item.quantity, 0) + 1;
    setAddedToCartMessage(`${totalQuantity} of ${product.name} added to cart`);

    setTimeout(() => setAddedToCartMessage(""), 2000);
  };

  // Debounced quantity update function
  const debouncedUpdateQuantity = useCallback(
    debounce((id, change) => {
      setCart(cart.map((item) => 
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + change) } : item
      ));
    }, 300),
    [cart]
  );

  const updateQuantity = (id, change) => {
    debouncedUpdateQuantity(id, change);
  };

  const getTotalPrice = () => {
    const totalPriceInSol = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    return settings.currency === 'SOL' ? totalPriceInSol : totalPriceInSol / USDC_TO_SOL_RATE;
  };

  const getPrice = (price) => {
    return settings.currency === 'SOL' ? price : price / USDC_TO_SOL_RATE;
  };

  const checkout = async () => {
    if (!publicKey) {
      alert("Please connect your wallet first!");
      return;
    }

    if (cart.every((item) => item.quantity === 0)) {
      alert("Add items to cart first!");
      return;
    }

    // Confirmation step
    const confirmCheckout = window.confirm(
      `You are about to send ${getTotalPrice()} SOL. This transaction is irreversible. Proceed?`
    );
    if (!confirmCheckout) return;

    setLoading(true);
    try {
      // Use devnet for development; switch to mainnet-beta in production
      const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
      const transaction = new Transaction();
      const recipient = new PublicKey(RECIPIENT_WALLET_ADDRESS);

      const totalPrice = getTotalPrice();
      const sendSolInstruction = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: recipient,
        lamports: Math.round(totalPrice * 1e9), // Round to avoid precision errors
      });

      transaction.add(sendSolInstruction);
      const signature = await sendTransaction(transaction, connection);

      // Wait for transaction confirmation
      await connection.confirmTransaction(signature, "confirmed");
      alert(`Transaction successful! Signature: ${signature}\nView on Solana Explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
      setCart([]); // Clear cart after successful transaction
      localStorage.removeItem('cart');
    } catch (error) {
      console.error(error);
      if (error.message.includes("insufficient funds")) {
        alert("Transaction failed: Insufficient funds in your wallet.");
      } else if (error.message.includes("invalid public key")) {
        alert("Transaction failed: Invalid wallet address.");
      } else {
        alert("Transaction failed: An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  // Pagination logic (updated to use filtered products)
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

  const handleCategoryClick = (category) => {
    document.body.classList.add('fade-out');
    setTimeout(() => {
      setSelectedCategory(category);
      document.body.classList.remove('fade-out');
    }, 500);
  };

  const renderPageContent = () => {
    switch (activePage) {
      case "home":
        return (
          <>
            {categoriesOpen && (
              <div className="categories-dropdown animate-slide-down">
                {CATEGORIES.map((category, index) => (
                  <button 
                    key={index} 
                    className="category-button" 
                    onClick={() => handleCategoryClick(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}

            <Settings 
              isOpen={settingsOpen}
              onClose={() => setSettingsOpen(false)}
              onSave={saveSettings}
              settings={settings}
            />

            {/* Add search bar */}
            <div className="search-bar mb-6">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                aria-label="Search products"
              />
            </div>

            <div className="flash-sale-container">
              <button className="flash-sale-toggle flash-sale-toggle-left" onClick={handlePrevSlide}>
                &#9664;
              </button>
              <div className="flash-sale-slides" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                {FLASH_SALE_PRODUCTS.map((product) => (
                  <div key={product.id} className="flash-sale-slide">
                    <img src={product.image} alt={product.name} />
                    <h2>{product.name}</h2>
                    <p>{product.description}</p>
                    <p>{product.price} SOL</p>
                    <button className="add-to-cart" onClick={() => addToCart(product)}>
                      <FontAwesomeIcon icon={faCartPlus} /> Add to Cart
                    </button>
                  </div>
                ))}
              </div>
              <button className="flash-sale-toggle flash-sale-toggle-right" onClick={handleNextSlide}>
                &#9654;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {currentProducts.map((product) => {
                const cartItem = cart.find((item) => item.id === product.id);
                const quantity = cartItem ? cartItem.quantity : 0;

                return (
                  <div key={product.id} className={`product-card animate-fade-in ${cartItem ? 'added' : ''}`} onClick={() => setExpandedProduct(product)}>
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-40 object-cover rounded-lg" 
                      loading="lazy" // Lazy loading for performance
                    />
                    <h2>{product.name}</h2>
                    <p>{getPrice(product.price)} {settings.currency}</p>

                    <div className="quantity-controls">
                      <button 
                        className="quantity-button" 
                        onClick={(e) => { e.stopPropagation(); updateQuantity(product.id, -1); }}
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      
                      <span className="quantity-display">{quantity}</span>

                      <button 
                        className="quantity-button" 
                        onClick={(e) => { e.stopPropagation(); updateQuantity(product.id, 1); }}
                      >
                        +
                      </button>
                    </div>

                    <div className="button-group">
                      <button 
                        className="add-to-cart stylish-button" 
                        onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                      >
                        <FontAwesomeIcon icon={faCartPlus} /> Add to Cart
                      </button>
                      {cartItem && (
                        <button 
                          className="remove-from-cart" 
                          onClick={(e) => { e.stopPropagation(); removeFromCart(product.id); }}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      )}
                    </div>

                    {cartItem && (
                      <div className="total-cost">
                        Total: {getPrice(cartItem.quantity * product.price)} {settings.currency}
                      </div>
                    )}

                    {addedToCartMessage && product.name === addedToCartMessage.split(" ")[1] && (
                      <div className="check-mark-message">
                        <span className="mr-2">✔</span>
                        <span>{addedToCartMessage}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {expandedProduct && (
              <div className="product-detail-modal animate-fade-in" onClick={() => setExpandedProduct(null)}>
                <div className="product-detail-content" onClick={(e) => e.stopPropagation()}>
                  <button className="close-button" onClick={() => setExpandedProduct(null)}>Close</button>
                  <img 
                    src={expandedProduct.image} 
                    alt={expandedProduct.name} 
                    className="product-detail-image" 
                  />
                  <h2>{expandedProduct.name}</h2>
                  <p>{expandedProduct.description}</p>
                  <p>Price: {getPrice(expandedProduct.price)} {settings.currency}</p>
                  <p>Discounted Price: {getPrice(expandedProduct.discountedPrice)} {settings.currency}</p>
                  <p>Date Added: {expandedProduct.dateAdded}</p>
                  <p>Pieces Remaining: {expandedProduct.piecesRemaining}</p>
                  <p>Storage: {expandedProduct.storage.join(", ")}</p>
                  <p>Colors: {expandedProduct.colors.join(", ")}</p>
                  <p>Models: {expandedProduct.models.join(", ")}</p>

                  {(() => {
                    const cartItem = cart.find((item) => item.id === expandedProduct.id);
                    const quantity = cartItem ? cartItem.quantity : 0;

                    return (
                      <>
                        <div className="quantity-controls small">
                          <button 
                            className="quantity-button small" 
                            onClick={() => updateQuantity(expandedProduct.id, -1)}
                            disabled={quantity <= 1}
                          >
                            -
                          </button>
                          
                          <span className="quantity-display small">{quantity}</span>

                          <button 
                            className="quantity-button small" 
                            onClick={() => updateQuantity(expandedProduct.id, 1)}
                          >
                            +
                          </button>
                        </div>

                        <div className="button-group">
                          <button 
                            className="add-to-cart small stylish-button" 
                            onClick={() => addToCart(expandedProduct)}
                          >
                            <FontAwesomeIcon icon={faCartPlus} /> Add to Cart
                          </button>
                          {cartItem && (
                            <button 
                              className="remove-from-cart small" 
                              onClick={() => removeFromCart(expandedProduct.id)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="bg-gray-500 p-2 rounded-lg mr-2"
              >
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="bg-gray-500 p-2 rounded-lg ml-2"
              >
                Next
              </button>
            </div>

            <div className="mt-4">
              <h2>Total: {getTotalPrice()} {settings.currency}</h2>
            </div>

            {loading ? (
              <>
                <div className="mt-4 text-center">
                  <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status"></div>
                  <span className="visually-hidden">Processing Transaction...</span>
                </div>
                <p>Processing Transaction...</p>
              </>
            ) : (
              cart.length > 0 && (
                <button
                  onClick={checkout}
                  className={`checkout-btn fixed bottom-4 right-4 ${cart.every((item) => item.quantity === 0) ? 'disabled' : ''}`}
                  disabled={cart.every((item) => item.quantity === 0)}
                >
                  Checkout
                </button>
              )
            )}
          </>
        );
      case "pendingOrders":
        return <div>Pending Orders Page</div>;
      case "cart":
        return (
          <CartPage 
            cart={cart} 
            getTotalPrice={getTotalPrice} 
            settings={settings} 
            checkout={checkout} 
            loading={loading} 
            removeFromCart={removeFromCart} 
            updateQuantity={updateQuantity} 
          />
        );
      case "customerCare":
        return <div>Customer Care Page</div>;
      default:
        return <div>Home Page</div>;
    }
  };

  return (
    <div className={`min-h-screen p-6 ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <header>
        <h1>
          SHOP-LIKE-<span className="flaming-i">A</span>-PRO
        </h1>
        
        <button className={`theme-toggle ${darkMode ? 'dark-mode' : 'light-mode'}`} onClick={toggleMode}>
          <FontAwesomeIcon icon={darkMode ? faSun : faMoon} className="icon" />
        </button>
      </header>

      <div className="relative">
        <button aria-label="Toggle Menu" onClick={() => setMenuOpen(!menuOpen)} className="bg-gray-700 p-2 rounded-lg">☰</button>
        {menuOpen && (
          <div className="dropdown-menu absolute right-0 mt-2 w-48 bg-gray-800 p-2 rounded-lg shadow-lg animate-fade-in">
            <button onClick={() => setSettingsOpen(true)} className="p-2 hover:bg-gray-700 w-full text-left">Settings</button>
            <button className="p-2 hover:bg-gray-700 w-full text-left">Account</button>
            <button onClick={() => setCategoriesOpen(!categoriesOpen)} className="p-2 hover:bg-gray-700 w-full text-left">Categories</button>
            <button className="p-2 hover:bg-gray-700 w-full text-left">About</button>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <button onClick={logout} className="bg-red-500 p-2 rounded-lg hover:bg-red-600">Logout</button>
        ) : (
          <button onClick={signInWithGoogle} className="bg-yellow-500 p-2 rounded-lg hover:bg-yellow-600">Login with Google</button>
        )}
        {publicKey ? (
          <button onClick={disconnect} className="bg-red-500 p-2 rounded-lg hover:bg-red-600">Logout Wallet</button>
        ) : (
          <button onClick={connect} className="bg-green-500 p-2 rounded-lg hover:bg-green-600">Login Wallet</button>
        )}
        <WalletMultiButton />
        <button className="bg-blue-500 p-2 rounded-lg hover:bg-blue-600">
          <FontAwesomeIcon icon={faBell} />
        </button> {/* Notification button */}
      </div>

      <div className="page-toggle-container">
        <button onClick={() => setActivePage("home")} className={`page-toggle ${activePage === "home" ? "active" : ""}`}>
          <FontAwesomeIcon icon={faHome} /> Home
        </button>
        <button onClick={() => setActivePage("pendingOrders")} className={`page-toggle ${activePage === "pendingOrders" ? "active" : ""}`}>
          <FontAwesomeIcon icon={faClipboardList} /> Pending Orders
        </button>
        <button onClick={() => setActivePage("cart")} className={`page-toggle ${activePage === "cart" ? "active" : ""}`}>
          <FontAwesomeIcon icon={faShoppingCart} /> Cart
        </button>
        <button onClick={() => setActivePage("customerCare")} className={`page-toggle ${activePage === "customerCare" ? "active" : ""}`}>
          <FontAwesomeIcon icon={faHeadset} /> Customer Care
        </button>
      </div>

      {renderPageContent()}
    </div>
  );
};

const App = () => {
  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ];

  return (
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
        <Store />
      </WalletModalProvider>
    </WalletProvider>
  );
};

export default App;