import React, { useState, useEffect } from "react";
import "./CSS/calorie.css";

const CalorieTracker = () => {
  const [date, setDate] = useState("");
  const [foodItem, setFoodItem] = useState("");
  const [servings, setServings] = useState(1); // State for servings
  const [mealtype, setMealtype] = useState(""); // State for meal type
  const [totalCalories, setTotalCalories] = useState(0);
  const [foodList, setFoodList] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false); // For showing suggestions

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
        `http://localhost:3000/user-data/${selectedDate}`
      );
      const data = await response.json();
      updateFoodList(data);

      const totalResponse = await fetch(
        `http://localhost:3000/user-data2/${selectedDate}`
      );
      const totalData = await totalResponse.json();
      setTotalCalories(totalData);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const updateFoodList = (data) => {
    if (Array.isArray(data)) {
      setFoodList(data);
    } else {
      setFoodList([]);
    }
  };

  const handleInputChange = async (event) => {
    const query = event.target.value;
    setFoodItem(query); // Set the input value to whatever the user types

    if (query.length > 0) {
      try {
        const response = await fetch(
          `http://localhost:5000/search-food-items?query=${query}`
        ); // Fetch matching results from backend
        const filteredSuggestions = await response.json();
        console.log("Fetched Suggestions:", filteredSuggestions);
        setSuggestions(filteredSuggestions); // Update suggestions with the fetched data
        setShowSuggestions(true); // Show suggestions when there is input
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false); // Hide suggestions when input is empty
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setFoodItem(suggestion.food_name); // Set the clicked suggestion to the input field
    setSuggestions([]); // Clear suggestions
    setShowSuggestions(false); // Hide suggestions after selection
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const lowerCaseFoodItem = foodItem.toLowerCase();

    try {
      const response = await fetch("http://localhost:3000/calories");
      const data = await response.json();
      const foodData = data.find(
        (item) => item.food_name.toLowerCase() === lowerCaseFoodItem
      );

      if (!foodData) {
        alert("Food item not found in the database.");
        return;
      }

      const calories = foodData.calories * servings; // Multiply calories by servings
      const responsePost = await fetch("http://localhost:3000/user-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date_of_entry: date,
          foodItem: lowerCaseFoodItem,
          calories,
          servings, // Include servings in the data
          mealtype, // Include meal type in the data
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
      const response = await fetch("http://localhost:3000/user-data", {
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
    setServings(1); // Reset servings
    setMealtype(""); // Reset meal type
    setShowSuggestions(false); // Hide suggestions
  };

  const handleMealtypeChange = (event) => {
    setMealtype(event.target.value); // Correctly update meal type
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
            onChange={handleMealtypeChange} // Correct handler
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
      </div>
    </div>
  );
};

export default CalorieTracker;
