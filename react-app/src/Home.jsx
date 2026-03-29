import "./App.css";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

function Home() {

  const navigate = useNavigate();

  const watches = [
    {
      title: "Chrono X",
      img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30"
    },
    {
      title: "Steel Edge",
      img: "https://images.unsplash.com/photo-1518544801976-3e159e50e5bb"
    },
    {
      title: "Midnight Pro",
      img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"
    },
    {
      title: "Titan Luxe",
      img: "https://images.unsplash.com/photo-1524805444758-089113d48a6d"
    }
  ];

  const shirts = [
    {
      title: "Black Core",
      img: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf"
    },
    {
      title: "Crimson Fit",
      img: "https://images.unsplash.com/photo-1520975916090-3105956dac38"
    },
    {
      title: "Shadow Wear",
      img: "https://images.unsplash.com/photo-1600180758890-6b94519a8ba6"
    },
    {
      title: "Urban Prime",
      img: "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4"
    }
  ];

  return (

    <>
      {/* SECOND NAVBAR WITH XP */}
      <Navbar />

      <div className="netflix-home">

        {/* HERO */}
        <section className="home-hero">

          <div className="hero-content">

            <h1 className="hero-title">
              VIVEKX <span>COLLECTION</span>
            </h1>

            <p>
              Premium watches & shirts curated with confidence
            </p>

            <button onClick={() => navigate("/products")}>
              Shop Now
            </button>

          </div>

        </section>


        {/* WATCHES */}
        <section className="row">

          <h2>Trending Watches</h2>

          <div className="row-posters">

            {watches.map((item, index) => (

              <Link
                to={`/product/${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                className="card-link"
                key={index}
              >

                <div className="poster-card product-card">

                  <img src={item.img} alt={item.title} />

                  <span>{item.title}</span>

                </div>

              </Link>

            ))}

          </div>

        </section>


        {/* SHIRTS */}
        <section className="row">

          <h2>Premium Shirts</h2>

          <div className="row-posters">

            {shirts.map((item, index) => (

              <Link
                to={`/product/${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                className="card-link"
                key={index}
              >

                <div className="poster-card shirt product-card">

                  <img src={item.img} alt={item.title} />

                  <span>{item.title}</span>

                </div>

              </Link>

            ))}

          </div>

        </section>


        <img
          src="/dark/arrow.png"
          className="side-arrow"
          alt="Decorative Arrow"
        />

      </div>

    </>

  );

}

export default Home;