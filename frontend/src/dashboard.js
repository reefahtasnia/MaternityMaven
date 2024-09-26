import React from "react";
import "./CSS/home.css";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import medicalHistory from "./CSS/assets/medical_history2.png";
import doctorPatient from "./CSS/assets/doctor and patient.png";
import reminders from "./CSS/assets/reminders.png";
import pregnancyShop from "./CSS/assets/pregnancy_shop.png";
import pregnancyResources from "./CSS/assets/pregnancy_resources.png";
import pregnancyPillow from "./CSS/assets/pregnancypillow.jpeg";
import prenatalVitamins from "./CSS/assets/prenatal_vitamins2.jpg";
import diaper from "./CSS/assets/diaper3.jpeg";
import babyWipes from "./CSS/assets/baby_wipes2.jpg";
import maternityDress from "./CSS/assets/maternity_dress.png";
import stretchMarkOil from "./CSS/assets/stretch_mark_oil2.jpg";
import babyShoes from "./CSS/assets/shoes2.jpg";
import babyClothes from "./CSS/assets/onesie.jpg";
import babyToys from "./CSS/assets/hanging_toy2.jpg";
import calorieTracker from "./CSS/assets/calorietracker.png";
import backgroundSVG from './CSS/assets/dasboardbg2.png';

const Dashboard = () => {
  return (
    <div style={{
        backgroundImage: `url(${backgroundSVG})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh"
      }}>
      <section className="feature">
        <div className="container py-5">
          <div className="row py-5 justify-content-center">
            <div className="col-lg-6 m-auto text-center">
              <h1>DASHBOARD </h1>
            </div>
          </div>
          <div className="row justify-content-center">
            {features.map((feature, index) => (
              <div className="col-md-6 col-lg-4 mb-4" key={index}>
                <div className="card border-0 h-100">
                  <div className="card-body text-center">
                    <img
                      src={feature.image}
                      alt=""
                      className="img-fluid"
                      style={{
                        maxWidth: "150px",
                        height: "auto",
                        marginBottom: "15px",
                        marginTop: "10px",
                      }}
                    />
                    <h5>{feature.title}</h5>
                    <p>{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="featured_products pt-5 pb-5">
            <div className="col-lg-5 m-auto text-center">
              <h1>OUR SHOP</h1>
        </div>
      </section>
      <div className="carousel-container">
        <Carousel responsive={responsive}>
          <div>
            <div className="card2">
              <img src={pregnancyPillow} className="product--image" alt="..." />
              <h2>Pregnancy Pillow</h2>
              <p className="price">Tk. 500</p>
              <p>
                {/* <button>Add to Cart</button> */}
              </p>
            </div>
          </div>
          <div>
            <div className="card2">
              <img
                src={prenatalVitamins}
                className="product--image"
                alt="..."
              />
              <h2>Prenatal Vitamins</h2>
              <p className="price">Tk. 500</p>
              <p>
                {/* <button>Add to Cart</button> */}
              </p>
            </div>
          </div>
          <div>
            <div className="card2">
              <img src={diaper} className="product--image" alt="..." />
              <h2>Diapers</h2>
              <p className="price">Tk. 500</p>
              <p>
                {/* <button>Add to Cart</button> */}
              </p>
            </div>
          </div>
          <div>
            <div className="card2">
              <img src={babyWipes} className="product--image" alt="..." />
              <h2>Baby Wipes</h2>
              <p className="price">Tk. 500</p>
              <p>
                {/* <button>Add to Cart</button> */}
              </p>
            </div>
          </div>
          <div>
            <div className="card2">
              <img src={maternityDress} className="product--image" alt="..." />
              <h2>Maternity Dress</h2>
              <p className="price">Tk. 500</p>
              <p>
                {/* <button>Add to Cart</button> */}
              </p>
            </div>
          </div>
          <div>
            <div className="card2">
              <img src={babyClothes} className="product--image" alt="..." />
              <h2>Baby Clothes</h2>
              <p className="price">Tk. 500</p>
              <p>
                {/* <button>Add to Cart</button> */}
              </p>
            </div>
          </div>
          <div>
            <div className="card2">
              <img src={babyShoes} className="product--image" alt="..." />
              <h2>Baby Shoes</h2>
              <p className="price">Tk. 500</p>
              <p>
                {/* <button>Add to Cart</button> */}
              </p>
            </div>
          </div>
          <div>
            <div className="card2">
              <img src={babyToys} className="product--image" alt="..." />
              <h2>Baby's Hanging Toy</h2>
              <p className="price">Tk. 500</p>
              <p>
                {/* <button>Add to Cart</button> */}
              </p>
            </div>
          </div>
          <div>
            <div className="card2">
              <img src={stretchMarkOil} className="product--image" alt="..." />
              <h2>Stretch Mark Oil</h2>
              <p className="price">Tk. 500</p>
              <p>
                {/* <button>Add to Cart</button> */}
              </p>
            </div>
          </div>
        </Carousel>
        ;
        <button>View More</button>
      </div>
    </div>
  );
};

const features = [
  {
    image: medicalHistory,
    title: "Medical History",
    description: "Log your medical history into your own account.",
  },
  {
    image: doctorPatient,
    title: "Book Appointments",
    description: "Schedule an appointment with your doctor.",
  },
  {
    image: reminders,
    title: "Medicine Reminders",
    description: "Set reminders so your memory gap doesn't affect your health.",
  },
  {
    image: pregnancyShop,
    title: "Shop for Supplies",
    description:
      "Find all your necessities related to your and your newborn's health",
  },
  {
    image: calorieTracker,
    title: "Calorie Tracker",
    description: "Keep track of calories consumed in a day.",
  },
  {
    image: pregnancyResources,
    title: "Information",
    description:
      "Find advice and information on your and your newborn's health",
  },
];

const products = [
  [
    {
      image: pregnancyPillow,
      title: "Pregnancy Pillow",
    },
    {
      image: prenatalVitamins,
      title: "Vitamins",
    },
    {
      image: diaper,
      title: "Diapers",
    },
  ],
  [
    {
      image: babyWipes,
      title: "Baby Wipes",
    },
    {
      image: maternityDress,
      title: "Maternity Dresses",
    },
    {
      image: stretchMarkOil,
      title: "Stretch Mark Oil",
    },
  ],
  [
    {
      image: babyClothes,
      title: "Baby Clothes",
    },
    {
      image: babyShoes,
      title: "Baby Shoes",
    },
    {
      image: babyToys,
      title: "Baby Hanging Toy",
    },
  ]
];
const responsive = {
  superLargeDesktop: {
    // the naming can be any, depends on you.
    breakpoint: { max: 4000, min: 1024 },
    items: 4,
  },
  desktop: {
    breakpoint: { max: 1024, min: 800 },
    items: 3,
  },
  tablet: {
    breakpoint: { max: 800, min: 464 },
    items: 2,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
  },
};

export default Dashboard;
