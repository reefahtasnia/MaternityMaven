import React, { useState, useEffect } from "react";
import "./CSS/calorie.css";

const CalorieTracker = () => {
  const [date, setDate] = useState("");
  const [foodItem, setFoodItem] = useState("");
  const [calories, setCalories] = useState(0);
  const [servings, setServings] = useState(1);
  const [mealtype, setMealtype] = useState("");
  const [totalCalories, setTotalCalories] = useState(0);
  const [foodList, setFoodList] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

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
  console.log("Retrieved userId:", userId);

  useEffect(() => {
    setDefaultDate();
  }, []);

  const setDefaultDate = () => {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
    updateCalorieDisplay(today);
  };

  const updateCalorieDisplay = async (selectedDate) => {
    try {
      const response = await fetch(
        `http://localhost:5000/calorie-data/${selectedDate}`
      );
      const data = await response.json();
      console.log("Fetched food data:", data);
      updateFoodList(data);

      const totalResponse = await fetch(
        `http://localhost:5000/totalcal/${selectedDate}?userId=${userId}`
      );
      const totalData = await totalResponse.json();
      if (totalData && totalData.total_calories !== undefined) {
        setTotalCalories(totalData.total_calories);
      } else {
        console.error("Unexpected totalData format:", totalData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const updateFoodList = (data) => {
    if (Array.isArray(data)) {
      console.log("Updating food list with data:", data);
      setFoodList(data);
    } else {
      console.error("Food data is not an array:", data);
      setFoodList([]);
    }
  };

  const handleInputChange = async (event) => {
    const query = event.target.value;
    setFoodItem(query);

    if (query.length > 0) {
      try {
        const response = await fetch(
          `http://localhost:5000/search-food-items?query=${query}`
        );
        const filteredSuggestions = await response.json();
        setSuggestions(filteredSuggestions);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = async (suggestion) => {
    setFoodItem(suggestion.food_name);
    setSuggestions([]);
    setShowSuggestions(false);

    try {
      const response = await fetch(
        `http://localhost:5000/search-food-items?query=${suggestion.food_name}`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        setCalories(data[0].calories || 0);
      } else {
        setCalories(0);
      }
    } catch (error) {
      console.error("Error fetching calories for selected food item:", error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!calories) {
      alert(
        "Please select a food item from the suggestions to fetch calories."
      );
      return;
    }

    const totalCaloriesForFood = calories * servings;

    try {
      const responsePost = await fetch("http://localhost:5000/calories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          foodItem: foodItem.toLowerCase(),
          userId,
          servings,
          calories: totalCaloriesForFood,
          mealtype,
          date,
        }),
      });

      if (responsePost.ok) {
        updateCalorieDisplay(date);
        clearForm();
      } else {
        alert("Error submitting data.");
      }
    } catch (error) {
      console.error("Error submitting user data:", error);
    }
  };

  const handleDelete = async (foodItem) => {
    try {
      const response = await fetch("http://localhost:5000/user-data", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date_of_entry: date, foodItem }),
      });

      if (response.ok) {
        updateCalorieDisplay(date);
      } else {
        alert("Error deleting data.");
      }
    } catch (error) {
      console.error("Error deleting user data:", error);
    }
  };

  const clearForm = () => {
    setFoodItem("");
    setCalories(0);
    setServings(1);
    setMealtype("");
    setShowSuggestions(false);
  };

  const handleMealtypeChange = (event) => {
    setMealtype(event.target.value);
  };

  return (
    <div className="calorie-tracker">
      <div className="container">
        <h1>Calorie Counter</h1>
        <form id="calorie-form" onSubmit={handleSubmit}>
          <label htmlFor="date">Date:</label>
          <input
            type="date"
            id="date"
            name="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              updateCalorieDisplay(e.target.value);
            }}
            required
          />

          <label htmlFor="food-item">Food Item:</label>
          <div className="search-box">
            <input
              type="text"
              placeholder="Search for food"
              value={foodItem}
              onChange={handleInputChange}
              className="search-input"
              required
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="suggestions-container">
                {suggestions.map((item, index) => (
                  <p
                    key={`${item.food_name}-${index}`}
                    onClick={() => handleSuggestionClick(item)}
                  >
                    {item.food_name} ({item.calories} calories)
                  </p>
                ))}
              </div>
            )}
          </div>

          <label htmlFor="servings">Servings:</label>
          <input
            type="number"
            id="servings"
            name="servings"
            value={servings}
            onChange={(e) => setServings(Number(e.target.value))}
            required
          />

          <label htmlFor="mealtype">Meal Type:</label>
          <select
            id="mealtype"
            name="mealtype"
            value={mealtype}
            onChange={handleMealtypeChange}
            required
          >
            <option value="">Select Meal Type</option>
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
          </select>

          <button type="submit">Add</button>
          <button type="button">Plan a Custom Diet</button>
        </form>

        <h2>
          Total Calories: <span id="total-calories">{totalCalories}</span>
        </h2>

        <div className="food-list">
          <h3>Food Log</h3>
          {foodList.length > 0 ? (
            <ul>
              {foodList.map((item, index) => (
                //key={`${item.food_name}-${index}`}
                <li key={`${item.foodItem}-${index}`}>
                  {item.foodItem} ({item.calories} calories)
                  <button
                    onClick={() => handleDelete(item.foodItem)}
                    className="delete-btn"
                  >
                    &#x2715; {/* Cross mark */}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No food items logged yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalorieTracker;
