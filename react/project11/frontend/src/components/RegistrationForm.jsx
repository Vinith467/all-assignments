import { useState } from "react";

function RegistrationForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required.";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email.";
    }

    if (!formData.password) newErrors.password = "Password is required.";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Confirm password is required.";
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess(false);
    if (validate()) {
      setSuccess(true);
      console.log("Registration Successful!", formData);
      setFormData({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "" });
    }
  };

  return (
    <div className="container">
      <h2>User Registration</h2>
      <form onSubmit={handleSubmit}>
        <label>First Name:</label>
        <input name="firstName" value={formData.firstName} onChange={handleChange} />
        {errors.firstName && <p style={{ color: "red" }}>{errors.firstName}</p>}

        <label>Last Name:</label>
        <input name="lastName" value={formData.lastName} onChange={handleChange} />
        {errors.lastName && <p style={{ color: "red" }}>{errors.lastName}</p>}

        <label>Email:</label>
        <input name="email" value={formData.email} onChange={handleChange} />
        {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}

        <label>Password:</label>
        <input type="password" name="password" value={formData.password} onChange={handleChange} />
        {errors.password && <p style={{ color: "red" }}>{errors.password}</p>}

        <label>Confirm Password:</label>
        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />
        {errors.confirmPassword && <p style={{ color: "red" }}>{errors.confirmPassword}</p>}

        <button type="submit">Register</button>
      </form>
      {success && <p style={{ color: "green" }}>Registration Successful!</p>}
    </div>
  );
}

export default RegistrationForm;
