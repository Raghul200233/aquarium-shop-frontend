import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, FreeMode } from 'swiper/modules';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Helmet } from 'react-helmet-async';
import config from '../config';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// Add this at the very top of your HomePage component, before any other code
console.log('🔥 API_URL from config:', config.API_URL);

const categories = [
  { 
    id: 1, 
    name: 'Fish Medicines', 
    image: 'https://www.cloningaquapets.com/cdn/shop/files/Medicine_Aquatic_Remedies_Paracidol-1.png?v=1766323044&width=1214',
    color: 'from-red-400 to-pink-500', 
    description: 'Antibiotics, parasite treatments, water conditioners' 
  },
  { 
    id: 2, 
    name: 'Aquarium Tanks', 
    image: 'https://images-cdn.ubuy.co.in/68fe2ae49ba0ad9b060e73cf-aqueon-aquarium-fish-tank-starter-kit.jpg',
    color: 'from-blue-400 to-cyan-500', 
    description: 'Nano tanks, full setups, rimless aquariums' 
  },
  { 
    id: 3, 
    name: 'Filters', 
    image: 'https://m.media-amazon.com/images/I/71I8ZgzfbTL.jpg',
    color: 'from-gray-400 to-slate-500', 
    description: 'Canister filters, hang-on-back, sponge filters' 
  },
  { 
    id: 4, 
    name: 'Heaters', 
    image: 'https://images-cdn.ubuy.com.sa/65d717eeb24a80201f70479d-aomota-premium-aquarium-heater-stick.jpg',
    color: 'from-orange-400 to-red-500', 
    description: 'Submersible heaters, thermostats, temperature controllers' 
  },
  { 
    id: 5, 
    name: 'Fish Foods', 
    image: 'https://theaquariumguide.com/wp-content/uploads/2017/01/Food-for-Aquarium-Fish-600x460.jpg',
    color: 'from-yellow-400 to-amber-500', 
    description: 'Flakes, pellets, frozen food, auto-feeders' 
  },
  { 
    id: 6, 
    name: 'Aquarium Lights', 
    image: 'https://images-cdn.ubuy.co.in/694a40a1b165aa3c8a0a4ec6-weaverbird-aquarium-light-fish-tank-led.jpg',
    color: 'from-yellow-300 to-yellow-500', 
    description: 'LED lights, timers, plant grow lights' 
  },
  { 
    id: 7, 
    name: 'Planted Tank Lights', 
    image: 'https://aquacadabra.com/cdn/shop/articles/AdobeStock_21630484_90187f6b-5a0d-44f6-be08-b552c58f22be.jpg?v=1763737082',
    color: 'from-green-400 to-emerald-500', 
    description: 'RGB lights, high-intensity plant LEDs' 
  },
  { 
    id: 8, 
    name: 'Live Fishes', 
    image: 'https://freshwateraquatica.org/cdn/shop/collections/aquarium_fishes_online_marine_aquatica_16.webp?v=1694014249&width=535',
    color: 'from-purple-400 to-pink-500', 
    description: 'Freshwater fish, tropical fish, guppies, tetras' 
  },
  { 
    id: 9, 
    name: 'Aquarium Accessories', 
    image: 'https://freshwateraquatica.org/cdn/shop/collections/74ccaca7870088badafcc4d7c1d825a8.webp?v=1694014502&width=535  ',
    color: 'from-teal-400 to-cyan-600', 
    description: 'Nets, thermometers, cleaning tools, decorations' 
  },
  { 
    id: 10, 
    name: 'Aquarium Stones and Sands', 
    image: 'https://freshwateraquatica.org/cdn/shop/collections/547485c0bc5f41c9aa423a65b60b8e2d.jpg?v=1694014832&width=535',
    color: 'from-stone-400 to-amber-600', 
    description: 'Substrate gravel, coloured stones, planted tank sand' 
  }
];

const HomePage = () => {
  console.log('API URL:', process.env.REACT_APP_API_URL);

  // eslint-disable-next-line no-unused-vars
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState({});
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState({});
  // eslint-disable-next-line no-unused-vars
  const [newArrivals, setNewArrivals] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [newArrivalsLoading, setNewArrivalsLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
    fetchNewArrivals();
    // eslint-disable-next-line
    categories.forEach(category => {
      fetchProductsByCategory(category.name);
    });
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/products/featured`);
      console.log('Featured products:', response.data);
      setFeaturedProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      setFeaturedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchNewArrivals = async () => {
    try {
      const response = await axios.get(
        `${config.API_URL}/api/products?sort=createdAt&limit=8`
      );
      console.log('New arrivals response:', response.data);
      setNewArrivals(response.data.products || []);
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
      setNewArrivals([]);
    } finally {
      setNewArrivalsLoading(false);
    }
  };

  // eslint-disable-next-line
  const fetchProductsByCategory = async (categoryName) => {
    setCategoryLoading(prev => ({ ...prev, [categoryName]: true }));
    try {
      const response = await axios.get(
        `${config.API_URL}/api/products?category=${encodeURIComponent(categoryName)}&limit=4`
      );
      console.log(`${categoryName} products:`, response.data);
      setCategoryProducts(prev => ({
        ...prev,
        [categoryName]: response.data.products || []
      }));
    } catch (error) {
      console.error(`Error fetching ${categoryName} products:`, error);
    } finally {
      setCategoryLoading(prev => ({ ...prev, [categoryName]: false }));
    }
  };

  const heroSlides = [
    {
      id: 1,
      title: 'Welcome to Elite Aquarium',
      subtitle: 'Your One-Stop Shop for All Aquarium and Pet Needs',
      image: 'https://images.unsplash.com/photo-1646022109956-c64aded4705b?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cGxhbnRlZCUyMGFxdWFyaXVtfGVufDB8fDB8fHww',
      buttonText: 'Shop Now',
      buttonLink: '/products'
    },
    {
      id: 2,
      title: 'Fish Medicines',
      subtitle: 'Keep Your Fish Healthy with Quality Medications',
      image: 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/4cc8eaa5-84bf-40cc-a7de-19ae2f53e408/dgg87ct-0fe390b5-b7dd-4bdc-8c9d-e24870ace776.jpg/v1/fill/w_1280,h_720,q_75,strp/3d_desktop_aquarium_wallpaper_by_outback38_dgg87ct-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi80Y2M4ZWFhNS04NGJmLTQwY2MtYTdkZS0xOWFlMmY1M2U0MDgvZGdnODdjdC0wZmUzOTBiNS1iN2RkLTRiZGMtOGM5ZC1lMjQ4NzBhY2U3NzYuanBnIiwiaGVpZ2h0IjoiPD03MjAiLCJ3aWR0aCI6Ijw9MTI4MCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS53YXRlcm1hcmsiXSwid21rIjp7InBhdGgiOiIvd20vNGNjOGVhYTUtODRiZi00MGNjLWE3ZGUtMTlhZTJmNTNlNDA4L291dGJhY2szOC00LnBuZyIsIm9wYWNpdHkiOjk1LCJwcm9wb3J0aW9ucyI6MC40NSwiZ3Jhdml0eSI6ImNlbnRlciJ9fQ.xRO5dh-MCyp_5ha3WfeTtZbWe25B7VidckN1yADTUrM',
      buttonText: 'Browse Medicines',
      buttonLink: '/products?category=Fish%20Medicines'
    },
    {
      id: 3,
      title: 'Live Fishes',
      subtitle: 'Beautiful Tropical Fish Delivered to Your Door',
      image: 'https://a-z-animals.com/media/2021/09/fish-1024x535.jpg',
      buttonText: 'View Live Fishes',
      buttonLink: '/products?category=Live%20Fishes'
    },
    {
      id: 4,
      title: 'Complete Aquarium Sets',
      subtitle: 'Everything You Need to Start Your Aquarium',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      buttonText: 'View Tanks',
      buttonLink: '/products?category=Aquarium%20Tanks'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Elite Aquarium & Fish Accessories</title>
        <meta name="description" content="Shop live fishes, fish medicines, aquarium tanks, filters, heaters, fish foods, and lights. Best prices in India with fast shipping." />
      </Helmet>

      {/* Hero Slider */}
      <section className="hero-section">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          spaceBetween={0}
          slidesPerView={1}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation
          style={{ height: '100%' }}
        >
          {heroSlides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div className="hero-slide">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="hero-image"
                />
                <div className="hero-overlay">
                  <div className="hero-content">
                    <h1 className="hero-title">
                      {slide.title}
                    </h1>
                    <p className="hero-subtitle">
                      {slide.subtitle}
                    </p>
                    <Link
                      to={slide.buttonLink}
                      className="hero-button"
                    >
                      {slide.buttonText} →
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Categories Section - Now with Circular Images and Horizontal Swipe */}
      <section className="categories-section">
        <h2 className="section-title reveal">
          Shop by Category
        </h2>
        <Swiper
          modules={[FreeMode]}
          spaceBetween={20}
          freeMode={true}
          slidesPerView="auto"
          className="categories-swiper"
        >
          {categories.map((category) => (
            <SwiperSlide key={category.id} className="category-slide">
              <Link to={`/products?category=${encodeURIComponent(category.name)}`} className="category-circle-link">
                <div className="category-circle">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="category-circle-image"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
                    }}
                  />
                </div>
                <h3 className="category-circle-name">{category.name}</h3>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Featured Products */}
      <section className="featured-section">
        <div className="container">
          <h2 className="section-title reveal">
            Featured Products
          </h2>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <Swiper
                modules={[FreeMode]}
                spaceBetween={16}
                freeMode={true}
                breakpoints={{
                  0: { slidesPerView: 2 },
                  640: { slidesPerView: 3 },
                  1024: { slidesPerView: 4 }
                }}
                className="products-swiper"
              >
                {featuredProducts.length > 0 ? (
                  featuredProducts.map((product) => (
                    <SwiperSlide key={product._id}>
                      <ProductCard product={product} />
                    </SwiperSlide>
                  ))
                ) : (
                  <SwiperSlide><p className="no-products">No featured products available</p></SwiperSlide>
                )}
              </Swiper>

              <div className="view-all-container">
                <Link
                  to="/products"
                  className="view-all-button"
                >
                  View All Products
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="new-arrivals-section">
        <div className="container">
          <div className="section-header-with-link">
            <div>
              <h2 className="section-title-left">
                <span className="new-badge">✨</span> New Arrivals
              </h2>
              <p className="category-description">Fresh from the inventory - Latest products added</p>
            </div>
            <Link to="/products?sort=createdAt:desc" className="view-all-link">
              View All New Arrivals →
            </Link>
          </div>

          {newArrivalsLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <Swiper
                modules={[FreeMode]}
                spaceBetween={16}
                freeMode={true}
                breakpoints={{
                  0: { slidesPerView: 2 },
                  640: { slidesPerView: 3 },
                  1024: { slidesPerView: 4 }
                }}
                className="products-swiper"
              >
                {newArrivals.map((product) => (
                  <SwiperSlide key={product._id}>
                    <ProductCard product={product} />
                  </SwiperSlide>
                ))}
              </Swiper>

              <div className="view-all-container">
                <Link
                  to="/products?sort=createdAt:desc"
                  className="view-all-button"
                >
                  Browse All New Products
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Live Fishes Section */}
      <section className="category-section bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="container">
          <div className="category-header reveal">
            <div>
              <h2 className="section-title-left">🐟 Live Fishes</h2>
              <p className="category-description">Beautiful, healthy tropical fish for your aquarium</p>
            </div>
            <Link to="/products?category=Live%20Fishes" className="view-all-link">
              View All Live Fishes →
            </Link>
          </div>

          {categoryLoading['Live Fishes'] ? (
            <LoadingSpinner />
          ) : (
            <Swiper
              modules={[FreeMode]}
              spaceBetween={16}
              freeMode={true}
              breakpoints={{
                0: { slidesPerView: 2 },
                640: { slidesPerView: 3 },
                1024: { slidesPerView: 4 }
              }}
              className="products-swiper"
            >
              {categoryProducts['Live Fishes']?.length > 0 ? (
                categoryProducts['Live Fishes'].map((product) => (
                  <SwiperSlide key={product._id}>
                    <ProductCard product={product} />
                  </SwiperSlide>
                ))
              ) : (
                <SwiperSlide><p className="no-products">No live fishes available</p></SwiperSlide>
              )}
            </Swiper>
          )}
        </div>
      </section>

      {/* Rest of the sections remain the same... */}
      {/* Aquarium Tanks Section */}
      <section className="category-section">
        <div className="container">
          <div className="category-header reveal">
            <div>
              <h2 className="section-title-left">🏠 Aquarium Tanks</h2>
              <p className="category-description">Premium glass and acrylic aquariums for all sizes</p>
            </div>
            <Link to="/products?category=Aquarium%20Tanks" className="view-all-link">
              View All Tanks →
            </Link>
          </div>

          {categoryLoading['Aquarium Tanks'] ? (
            <LoadingSpinner />
          ) : (
            <Swiper
              modules={[FreeMode]}
              spaceBetween={16}
              freeMode={true}
              breakpoints={{
                0: { slidesPerView: 2 },
                640: { slidesPerView: 3 },
                1024: { slidesPerView: 4 }
              }}
              className="products-swiper"
            >
              {categoryProducts['Aquarium Tanks']?.length > 0 ? (
                categoryProducts['Aquarium Tanks'].map((product) => (
                  <SwiperSlide key={product._id}>
                    <ProductCard product={product} />
                  </SwiperSlide>
                ))
              ) : (
                <SwiperSlide><p className="no-products">No tanks available</p></SwiperSlide>
              )}
            </Swiper>
          )}
        </div>
      </section>

      {/* Fish Medicines Section */}
      <section className="category-section bg-gradient-to-r from-red-50 to-pink-50">
        <div className="container">
          <div className="category-header reveal">
            <div>
              <h2 className="section-title-left">💊 Fish Medicines</h2>
              <p className="category-description">Quality medications to keep your fish healthy</p>
            </div>
            <Link to="/products?category=Fish%20Medicines" className="view-all-link">
              View All Medicines →
            </Link>
          </div>

          {categoryLoading['Fish Medicines'] ? (
            <LoadingSpinner />
          ) : (
            <Swiper
              modules={[FreeMode]}
              spaceBetween={16}
              freeMode={true}
              breakpoints={{
                0: { slidesPerView: 2 },
                640: { slidesPerView: 3 },
                1024: { slidesPerView: 4 }
              }}
              className="products-swiper"
            >
              {categoryProducts['Fish Medicines']?.length > 0 ? (
                categoryProducts['Fish Medicines'].map((product) => (
                  <SwiperSlide key={product._id}>
                    <ProductCard product={product} />
                  </SwiperSlide>
                ))
              ) : (
                <SwiperSlide><p className="no-products">No medicines available</p></SwiperSlide>
              )}
            </Swiper>
          )}
        </div>
      </section>

      {/* Filters Section */}
      <section className="category-section">
        <div className="container">
          <div className="category-header reveal">
            <div>
              <h2 className="section-title-left">⚙️ Aquarium Filters</h2>
              <p className="category-description">Keep your water crystal clear with our filters</p>
            </div>
            <Link to="/products?category=Filters" className="view-all-link">
              View All Filters →
            </Link>
          </div>

          {categoryLoading['Filters'] ? (
            <LoadingSpinner />
          ) : (
            <Swiper
              modules={[FreeMode]}
              spaceBetween={16}
              freeMode={true}
              breakpoints={{
                0: { slidesPerView: 2 },
                640: { slidesPerView: 3 },
                1024: { slidesPerView: 4 }
              }}
              className="products-swiper"
            >
              {categoryProducts['Filters']?.length > 0 ? (
                categoryProducts['Filters'].map((product) => (
                  <SwiperSlide key={product._id}>
                    <ProductCard product={product} />
                  </SwiperSlide>
                ))
              ) : (
                <SwiperSlide><p className="no-products">No filters available</p></SwiperSlide>
              )}
            </Swiper>
          )}
        </div>
      </section>

      {/* Heaters Section */}
      <section className="category-section bg-gradient-to-r from-orange-50 to-red-50">
        <div className="container">
          <div className="category-header reveal">
            <div>
              <h2 className="section-title-left">🔥 Aquarium Heaters</h2>
              <p className="category-description">Maintain perfect temperature for your fish</p>
            </div>
            <Link to="/products?category=Heaters" className="view-all-link">
              View All Heaters →
            </Link>
          </div>

          {categoryLoading['Heaters'] ? (
            <LoadingSpinner />
          ) : (
            <Swiper
              modules={[FreeMode]}
              spaceBetween={16}
              freeMode={true}
              breakpoints={{
                0: { slidesPerView: 2 },
                640: { slidesPerView: 3 },
                1024: { slidesPerView: 4 }
              }}
              className="products-swiper"
            >
              {categoryProducts['Heaters']?.length > 0 ? (
                categoryProducts['Heaters'].map((product) => (
                  <SwiperSlide key={product._id}>
                    <ProductCard product={product} />
                  </SwiperSlide>
                ))
              ) : (
                <SwiperSlide><p className="no-products">No heaters available</p></SwiperSlide>
              )}
            </Swiper>
          )}
        </div>
      </section>

      {/* Fish Foods Section */}
      <section className="category-section">
        <div className="container">
          <div className="category-header reveal">
            <div>
              <h2 className="section-title-left">🍕 Fish Foods</h2>
              <p className="category-description">Nutritious foods for all types of fish</p>
            </div>
            <Link to="/products?category=Fish%20Foods" className="view-all-link">
              View All Foods →
            </Link>
          </div>

          {categoryLoading['Fish Foods'] ? (
            <LoadingSpinner />
          ) : (
            <Swiper
              modules={[FreeMode]}
              spaceBetween={16}
              freeMode={true}
              breakpoints={{
                0: { slidesPerView: 2 },
                640: { slidesPerView: 3 },
                1024: { slidesPerView: 4 }
              }}
              className="products-swiper"
            >
              {categoryProducts['Fish Foods']?.length > 0 ? (
                categoryProducts['Fish Foods'].map((product) => (
                  <SwiperSlide key={product._id}>
                    <ProductCard product={product} />
                  </SwiperSlide>
                ))
              ) : (
                <SwiperSlide><p className="no-products">No fish foods available</p></SwiperSlide>
              )}
            </Swiper>
          )}
        </div>
      </section>

      {/* Aquarium Lights Section */}
      <section className="category-section bg-gradient-to-r from-yellow-50 to-amber-50">
        <div className="container">
          <div className="category-header reveal">
            <div>
              <h2 className="section-title-left">💡 Aquarium Lights</h2>
              <p className="category-description">LED lights for beautiful aquarium displays</p>
            </div>
            <Link to="/products?category=Aquarium%20Lights" className="view-all-link">
              View All Lights →
            </Link>
          </div>

          {categoryLoading['Aquarium Lights'] ? (
            <LoadingSpinner />
          ) : (
            <Swiper
              modules={[FreeMode]}
              spaceBetween={16}
              freeMode={true}
              breakpoints={{
                0: { slidesPerView: 2 },
                640: { slidesPerView: 3 },
                1024: { slidesPerView: 4 }
              }}
              className="products-swiper"
            >
              {categoryProducts['Aquarium Lights']?.length > 0 ? (
                categoryProducts['Aquarium Lights'].map((product) => (
                  <SwiperSlide key={product._id}>
                    <ProductCard product={product} />
                  </SwiperSlide>
                ))
              ) : (
                <SwiperSlide><p className="no-products">No lights available</p></SwiperSlide>
              )}
            </Swiper>
          )}
        </div>
      </section>

      {/* Planted Tank Lights Section */}
      <section className="category-section bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="container">
          <div className="category-header reveal">
            <div>
              <h2 className="section-title-left">🌿 Planted Tank Lights</h2>
              <p className="category-description">Specialized lights for planted aquariums</p>
            </div>
            <Link to="/products?category=Planted%20Tank%20Lights" className="view-all-link">
              View All Planted Lights →
            </Link>
          </div>

          {categoryLoading['Planted Tank Lights'] ? (
            <LoadingSpinner />
          ) : (
            <Swiper
              modules={[FreeMode]}
              spaceBetween={16}
              freeMode={true}
              breakpoints={{
                0: { slidesPerView: 2 },
                640: { slidesPerView: 3 },
                1024: { slidesPerView: 4 }
              }}
              className="products-swiper"
            >
              {categoryProducts['Planted Tank Lights']?.length > 0 ? (
                categoryProducts['Planted Tank Lights'].map((product) => (
                  <SwiperSlide key={product._id}>
                    <ProductCard product={product} />
                  </SwiperSlide>
                ))
              ) : (
                <SwiperSlide><p className="no-products">No planted lights available</p></SwiperSlide>
              )}
            </Swiper>
          )}
        </div>
      </section>

      {/* Aquarium Accessories Section */}
      <section className="category-section bg-gradient-to-r from-teal-50 to-cyan-50">
        <div className="container">
          <div className="category-header reveal">
            <div>
              <h2 className="section-title-left">🪸 Aquarium Accessories</h2>
              <p className="category-description">Nets, cleaning tools, decorations &amp; more</p>
            </div>
            <Link to="/products?category=Aquarium%20Accessories" className="view-all-link">
              View All Accessories →
            </Link>
          </div>

          {categoryLoading['Aquarium Accessories'] ? (
            <LoadingSpinner />
          ) : (
            <Swiper
              modules={[FreeMode]}
              spaceBetween={16}
              freeMode={true}
              breakpoints={{
                0: { slidesPerView: 2 },
                640: { slidesPerView: 3 },
                1024: { slidesPerView: 4 }
              }}
              className="products-swiper"
            >
              {categoryProducts['Aquarium Accessories']?.length > 0 ? (
                categoryProducts['Aquarium Accessories'].map((product) => (
                  <SwiperSlide key={product._id}>
                    <ProductCard product={product} />
                  </SwiperSlide>
                ))
              ) : (
                <SwiperSlide><p className="no-products">No accessories available</p></SwiperSlide>
              )}
            </Swiper>
          )}
        </div>
      </section>

      {/* Aquarium Stones and Sands Section */}
      <section className="category-section bg-gradient-to-r from-stone-50 to-amber-50">
        <div className="container">
          <div className="category-header reveal">
            <div>
              <h2 className="section-title-left">🪨 Aquarium Stones and Sands</h2>
              <p className="category-description">Substrate gravel, coloured stones &amp; planted tank sand</p>
            </div>
            <Link to="/products?category=Aquarium%20Stones%20and%20Sands" className="view-all-link">
              View All Stones &amp; Sands →
            </Link>
          </div>

          {categoryLoading['Aquarium Stones and Sands'] ? (
            <LoadingSpinner />
          ) : (
            <Swiper
              modules={[FreeMode]}
              spaceBetween={16}
              freeMode={true}
              breakpoints={{
                0: { slidesPerView: 2 },
                640: { slidesPerView: 3 },
                1024: { slidesPerView: 4 }
              }}
              className="products-swiper"
            >
              {categoryProducts['Aquarium Stones and Sands']?.length > 0 ? (
                categoryProducts['Aquarium Stones and Sands'].map((product) => (
                  <SwiperSlide key={product._id}>
                    <ProductCard product={product} />
                  </SwiperSlide>
                ))
              ) : (
                <SwiperSlide><p className="no-products">No stones or sands available</p></SwiperSlide>
              )}
            </Swiper>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🚚</div>
            <h3 className="feature-title">Free Shipping</h3>
            <p className="feature-description">On orders above ₹999</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3 className="feature-title">Best Prices</h3>
            <p className="feature-description">Price match guarantee</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3 className="feature-title">Secure Payment</h3>
            <p className="feature-description">100% secure transactions</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🐠</div>
            <h3 className="feature-title">Live Arrival Guarantee</h3>
            <p className="feature-description">On all live fish orders</p>
          </div>
        </div>
      </section>

      {/* Add custom CSS for Swiper navigation and new styles */}
      <style>{`
        .swiper-button-next,
        .swiper-button-prev {
          color: white;
          background-color: rgba(0, 0, 0, 0.3);
          border-radius: 50%;
          width: 40px;
          height: 40px;
        }
        
        @media (min-width: 768px) {
          .swiper-button-next,
          .swiper-button-prev {
            width: 48px;
            height: 48px;
          }
        }
        
        .swiper-button-next::after,
        .swiper-button-prev::after {
          font-size: 1.125rem;
        }
        
        @media (min-width: 768px) {
          .swiper-button-next::after,
          .swiper-button-prev::after {
            font-size: 1.25rem;
          }
        }
        
        .swiper-pagination-bullet {
          background-color: white;
          opacity: 0.7;
          width: 8px;
          height: 8px;
        }
        
        @media (min-width: 768px) {
          .swiper-pagination-bullet {
            width: 12px;
            height: 12px;
          }
        }
        
        .swiper-pagination-bullet-active {
          background-color: #3b82f6;
          opacity: 1;
        }

        /* Categories Swiper Styles */
        .categories-swiper {
          padding: 20px 0 30px;
          width: 100%;
        }

        .category-slide {
          width: 140px !important;
          height: auto;
        }

        .category-circle-link {
          text-decoration: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .category-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          overflow: hidden; 
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          border: 3px solid transparent;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 3px;
        }

        .category-circle:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(102, 126, 234, 0.3);
        }

        .category-circle-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          border: 3px solid white;
        }

        .category-circle-name {
          font-size: 22px;
          font-weight: 600;
          color: #333;
          text-align: center;
          margin: 0;
          line-height: 1.3;
          transition: color 0.3s;
        }

        .category-circle-link:hover .category-circle-name {
          color: #667eea;
        }

        @media (min-width: 640px) {
          .category-slide {
            width: 160px !important;
          }
          .category-circle {
            width: 140px;
            height: 140px;
          }
        }

        @media (min-width: 1024px) {
          .category-slide {
            width: 180px !important;
          }
          .category-circle {
            width: 160px;
            height: 160px;
          }
          .category-circle-name {
            font-size: 22px;
          }
        }

        .category-section {
          padding: 60px 0;
        }

        .category-section:nth-child(even) {
          background: linear-gradient(to right, #f8fafc, #f1f5f9);
        }

        .category-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .section-title-left {
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 8px;
        }

        @media (min-width: 768px) {
          .section-title-left {
            font-size: 32px;
          }
        }

        .category-description {
          color: #6b7280;
          font-size: 16px;
        }

        .view-all-link {
          color: #2563eb;
          text-decoration: none;
          font-weight: 600;
          padding: 10px 20px;
          border: 2px solid #2563eb;
          border-radius: 8px;
          transition: all 0.3s;
        }

        .view-all-link:hover {
          background-color: #2563eb;
          color: white;
        }

        .no-products {
          text-align: center;
          color: #6b7280;
          padding: 40px;
          background-color: white;
          border-radius: 8px;
          grid-column: 1 / -1;
        }

        .bg-gradient-to-r {
          background: linear-gradient(to right, var(--from-color), var(--to-color));
        }

        .from-purple-50 { --from-color: #faf5ff; }
        .to-pink-50 { --to-color: #fdf2f8; }
        .from-red-50 { --from-color: #fef2f2; }
        .to-pink-50 { --to-color: #fdf2f8; }
        .from-orange-50 { --from-color: #fff7ed; }
        .to-red-50 { --to-color: #fef2f2; }
        .from-yellow-50 { --from-color: #fefce8; }
        .to-amber-50 { --to-color: #fffbeb; }
        .from-green-50 { --from-color: #f0fdf4; }
        .to-emerald-50 { --to-color: #ecfdf5; }
        
        .new-arrivals-section {
          padding: 60px 0;
          background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
        }

        .section-header-with-link {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .new-badge {
          font-size: 28px;
          margin-right: 10px;
          animation: sparkle 2s infinite;
        }

        @keyframes sparkle {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }

        .new-arrivals-section .products-grid {
          animation: fadeInUp 0.5s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .new-arrivals-section .product-card {
          position: relative;
          overflow: hidden;
        }

        .new-arrivals-section .product-card::before {
          content: 'NEW';
          position: absolute;
          top: 10px;
          left: 10px;
          background: linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%);
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          z-index: 2;
          animation: pulse 2s infinite;
          box-shadow: 0 4px 10px rgba(255, 71, 87, 0.3);
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        /* FIXED: Products Swiper Styles */
        .products-swiper {
          width: 100%;
          padding-bottom: 8px;
          overflow: visible !important;
        }

        .products-swiper .swiper-wrapper {
          display: flex;
          align-items: stretch;
        }

        .products-swiper .swiper-slide {
          height: auto !important;
          visibility: visible !important;
          opacity: 1 !important;
          display: block !important;
        }

        .products-swiper .swiper-slide > * {
          height: 100%;
        }

        /* FIXED: Image visibility styles */
        .product-image {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          max-width: 100%;
          height: auto;
        }

        .product-image.img-hidden {
          opacity: 0 !important;
          visibility: hidden !important;
          position: absolute;
        }

        .product-image.img-fade-in {
          opacity: 1 !important;
          visibility: visible !important;
          animation: fadeIn 0.3s ease-in;
          position: relative;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* FIXED: Image container */
        .image-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          min-height: 200px;
        }

        .product-image-container {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
          aspect-ratio: 1 / 1;
          min-height: 200px;
        }
      `}</style>
    </>
  );
};

export default HomePage;