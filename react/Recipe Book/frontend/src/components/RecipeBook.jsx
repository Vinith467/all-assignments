import { useState } from "react";

function RecipeBook() {
  const [recipes, setRecipes] = useState([]);
  const [recipe, setRecipe] = useState({ title: "", ingredients: "" });

  // Handle input changes
  const handleChange = (e) => {
    setRecipe({ ...recipe, [e.target.name]: e.target.value });
  };

  // Add new recipe
  const handleAddRecipe = (e) => {
    e.preventDefault();
    if (!recipe.title || !recipe.ingredients) {
      alert("Please fill in all fields!");
      return;
    }
    setRecipes([...recipes, recipe]);
    setRecipe({ title: "", ingredients: "" });
  };

  // Delete recipe
  const handleDelete = (index) => {
    const newList = recipes.filter((_, i) => i !== index);
    setRecipes(newList);
  };

  return (
    <div className="container">
      <h2>🍳 Recipe Book</h2>

      {/* Add Recipe Form */}
      <form onSubmit={handleAddRecipe}>
        <label>Recipe Title:</label>
        <input
          name="title"
          value={recipe.title}
          onChange={handleChange}
          placeholder="Enter recipe title"
        />

        <label>Ingredients:</label>
        <textarea
          name="ingredients"
          value={recipe.ingredients}
          onChange={handleChange}
          placeholder="List ingredients..."
          rows="3"
        ></textarea>

        <button type="submit">Add Recipe</button>
      </form>

      {/* Display Recipes */}
      <h3 style={{ marginTop: "20px" }}>All Recipes</h3>
      {recipes.length === 0 ? (
        <p>No recipes added yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {recipes.map((r, index) => (
            <li
              key={index}
              style={{
                background: "#f1f1f1",
                marginBottom: "10px",
                padding: "10px",
                borderRadius: "8px",
              }}
            >
              <strong>{r.title}</strong>
              <p>{r.ingredients}</p>
              <button
                onClick={() => handleDelete(index)}
                style={{
                  backgroundColor: "#e74c3c",
                  color: "white",
                  border: "none",
                  padding: "6px 10px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RecipeBook;
