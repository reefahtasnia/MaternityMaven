import React, { useState, useEffect } from "react";
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css"; // Import the CSS for the progress bar
import "./CSS/calorie.css"; // Your custom CSS file

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
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [lipids, setLipids] = useState(0);
  const [trimester, setTrimester] = useState("");

  const maxCalories = 2000; // Set a daily calorie goal (for example)

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

  // Load saved nutritional data from localStorage on page load
  useEffect(() => {
    setDefaultDate();
    loadNutritionalData(); // Load saved values from localStorage
  }, []);

  const setDefaultDate = () => {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
    updateCalorieDisplay(today);
  };

  // Function to load nutritional data from localStorage
  const loadNutritionalData = () => {
    const savedProtein = localStorage.getItem("protein");
    const savedCarbs = localStorage.getItem("carbs");
    const savedLipids = localStorage.getItem("lipids");

    if (savedProtein) setProtein(Number(savedProtein));
    if (savedCarbs) setCarbs(Number(savedCarbs));
    if (savedLipids) setLipids(Number(savedLipids));
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
          mealtype, // Send mealtype to backend
          date,
        }),
      });

      if (responsePost.ok) {
        updateCalorieDisplay(date);
        setFoodList((prevList) => [
          ...prevList,
          { foodItem, calories: totalCaloriesForFood, mealtype }, // Store mealtype in frontend state
        ]);
        clearForm();
      } else {
        alert("Error submitting data.");
      }
    } catch (error) {
      console.error("Error submitting user data:", error);
    }

    try {
      const response = await fetch(
        `http://localhost:5000/getnutri/${foodItem.toLowerCase()}`
      );

      if (response.ok) {
        const nutritionData = await response.json();
        console.log(nutritionData); // Log the fetched data to see if it's correct

        // Check if the response is an array and contains at least one item
        if (Array.isArray(nutritionData) && nutritionData.length > 0) {
          const {
            protein: newProtein,
            carbohydrates: newCarbs,
            fat: newLipids,
          } = nutritionData[0]; // Access the first item in the array

          // Log to confirm the fetched values
          console.log(
            "Fetched Protein:",
            newProtein,
            "Carbs:",
            newCarbs,
            "Lipids:",
            newLipids
          );

          // Update the state for protein, carbs, and lipids and save to localStorage
          setProtein((prevProtein) => {
            const updatedProtein = prevProtein + newProtein * servings;
            localStorage.setItem("protein", updatedProtein); // Save to localStorage
            return updatedProtein;
          });
          setCarbs((prevCarbs) => {
            const updatedCarbs = prevCarbs + newCarbs * servings;
            localStorage.setItem("carbs", updatedCarbs); // Save to localStorage
            return updatedCarbs;
          });
          setLipids((prevLipids) => {
            const updatedLipids = prevLipids + newLipids * servings;
            localStorage.setItem("lipids", updatedLipids); // Save to localStorage
            return updatedLipids;
          });
        } else {
          console.error("No nutritional data found.");
        }
      } else {
        console.error("Failed to fetch nutritional data.");
      }
    } catch (error) {
      console.error("Error fetching nutritional data:", error);
    }
  };

  const handleDelete = async (foodItem, mealtype) => {
    console.log(mealtype);
    // Find the mealtype of the foodItem from the foodList
    // const itemToDelete = foodList.find((item) => item.foodItem === foodItem);
    //const mealtype = itemToDelete?.mealtype || ""; // Ensure mealtype exists

    try {
      // Fetch the nutritional information for the food item before deletion
      const response = await fetch(
        `http://localhost:5000/getnutri/${foodItem.toLowerCase()}`
      );

      if (response.ok) {
        const nutritionData = await response.json();

        if (Array.isArray(nutritionData) && nutritionData.length > 0) {
          const {
            protein: deletedProtein,
            carbohydrates: deletedCarbs,
            fat: deletedLipids,
          } = nutritionData[0]; // Access the first item in the array

          // Update the state for protein, carbs, and lipids after deletion
          setProtein((prevProtein) => {
            const updatedProtein = prevProtein - deletedProtein * servings;
            localStorage.setItem("protein", updatedProtein); // Save to localStorage
            return updatedProtein;
          });

          setCarbs((prevCarbs) => {
            const updatedCarbs = prevCarbs - deletedCarbs * servings;
            localStorage.setItem("carbs", updatedCarbs); // Save to localStorage
            return updatedCarbs;
          });

          setLipids((prevLipids) => {
            const updatedLipids = prevLipids - deletedLipids * servings;
            localStorage.setItem("lipids", updatedLipids); // Save to localStorage
            return updatedLipids;
          });
        } else {
          console.error(
            "No nutritional data found for the item being deleted."
          );
        }
      } else {
        console.error("Failed to fetch nutritional data for deletion.");
      }

      // Now delete the food item entry
      const deleteResponse = await fetch(`http://localhost:5000/delfood`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date,
          foodItem,
          //mealtype, // Pass mealtype along with foodItem, date, and userId
          userId,
        }),
      });

      if (deleteResponse.ok) {
        updateCalorieDisplay(date); // Update the displayed calorie data
        setFoodList((prevList) =>
          prevList.filter((item) => item.foodItem !== foodItem)
        ); // Remove the deleted item from the state
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
    setShowSuggestions(false);
    setMealtype("");
  };

  const handleMealtypeChange = (event) => {
    setMealtype(event.target.value); // Update the state when the user selects a meal type
  };

  // Debugging logs
  console.log("Protein:", protein, "Carbs:", carbs, "Lipids:", lipids);

  const proteinPercent = totalCalories
    ? ((protein * 4) / totalCalories) * 100
    : 0; // 4 kcal per gram of protein
  const carbsPercent = totalCalories ? ((carbs * 4) / totalCalories) * 100 : 0; // 4 kcal per gram of carbs
  const lipidsPercent = totalCalories
    ? ((lipids * 9) / totalCalories) * 100
    : 0; // 9 kcal per gram of lipids

  // Debugging logs
  console.log("Protein:", protein, "Carbs:", carbs, "Lipids:", lipids);

  return (
    <div className="calorie-tracker">
      <div className="container">
        <h1>Calorie Counter</h1>
        <form id="calorie-form" onSubmit={handleSubmit}>
          {/* <label htmlFor="date">Date:</label>
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
          /> */}

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

        {/* Circular Multi-Progress Bar for Protein, Carbs, Lipids and Calories */}
        <div className="progress-circle-wrapper">
          <div
            className="progress-circle-container"
            style={{ width: 200, height: 200, margin: "30px auto" }}
          >
            <CircularProgressbarWithChildren
              value={(totalCalories / maxCalories) * 100}
              styles={buildStyles({
                pathColor: "#e91e63", // Pink for total calories
                trailColor: "#f0f0f0",
                strokeLinecap: "butt",
              })}
            >
              {/* Protein layer */}
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  zIndex: 3, // Ensure protein layer is on top
                }}
              >
                <CircularProgressbarWithChildren
                  value={proteinPercent}
                  styles={buildStyles({
                    pathColor: "#4CAF50", // Green for protein
                    trailColor: "transparent", // Transparent to layer correctly
                  })}
                />
              </div>

              {/* Carbs layer */}
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  zIndex: 2, // Carbs layer below protein
                }}
              >
                <CircularProgressbarWithChildren
                  value={carbsPercent}
                  styles={buildStyles({
                    pathColor: "#2196F3", // Blue for carbs
                    trailColor: "transparent", // Transparent to layer correctly
                  })}
                />
              </div>

              {/* Lipids layer */}
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  zIndex: 1, // Lipids layer below protein and carbs
                }}
              >
                <CircularProgressbarWithChildren
                  value={lipidsPercent}
                  styles={buildStyles({
                    pathColor: "#FFC107", // Yellow for lipids
                    trailColor: "transparent", // Transparent to layer correctly
                  })}
                />
              </div>

              {/* Inner text showing total calories */}
              <div style={{ fontSize: 20, marginTop: -5 }}>
                <strong>{totalCalories} Cal</strong>
              </div>
            </CircularProgressbarWithChildren>
          </div>

          {/* Legend Section */}
          <div className="legend-container">
            <div className="legend-item">
              <div
                className="legend-color"
                style={{ backgroundColor: "#4CAF50" }} // Green for protein
              ></div>
              <span>Protein: {protein}</span>
            </div>
            <div className="legend-item">
              <div
                className="legend-color"
                style={{ backgroundColor: "#2196F3" }} // Blue for carbs
              ></div>
              <span>Carbohydrates: {carbs}</span>
            </div>
            <div className="legend-item">
              <div
                className="legend-color"
                style={{ backgroundColor: "#FFC107" }} // Yellow for lipids
              ></div>
              <span>Fat: {lipids}</span>
            </div>
          </div>
        </div>

        <div className="food-list">
          <h3>Food Log</h3>
          {foodList.length > 0 ? (
            <ul>
              {foodList.map((item, index) => (
                <li key={`${item.foodItem}-${index}`}>
                  {item.foodItem} ({item.calories} calories) - {item.mealtype}
                  <button
                    onClick={() => handleDelete(item.foodItem)} // Only pass foodItem; mealtype is derived in handleDelete
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
