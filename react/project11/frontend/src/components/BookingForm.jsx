import { useState } from "react";

function BookingForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    date: "",
    time: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required.";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email.";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required.";
    if (!formData.date) newErrors.date = "Appointment date is required.";
    if (!formData.time) newErrors.time = "Appointment time is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess(false);
    if (validate()) {
      setSuccess(true);
      console.log("Booking Successful!", formData);
      setFormData({ fullName: "", email: "", phone: "", date: "", time: "" });
    }
  };

  return (
    <div className="container">
      <h2>Appointment Booking</h2>
      <form onSubmit={handleSubmit}>
        <label>Full Name:</label>
        <input name="fullName" value={formData.fullName} onChange={handleChange} />
        {errors.fullName && <p style={{ color: "red" }}>{errors.fullName}</p>}

        <label>Email:</label>
        <input name="email" value={formData.email} onChange={handleChange} />
        {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}

        <label>Phone Number:</label>
        <input name="phone" value={formData.phone} onChange={handleChange} />
        {errors.phone && <p style={{ color: "red" }}>{errors.phone}</p>}

        <label>Appointment Date:</label>
        <input type="date" name="date" value={formData.date} onChange={handleChange} />
        {errors.date && <p style={{ color: "red" }}>{errors.date}</p>}

        <label>Appointment Time:</label>
        <input type="time" name="time" value={formData.time} onChange={handleChange} />
        {errors.time && <p style={{ color: "red" }}>{errors.time}</p>}

        <button type="submit">Book Appointment</button>
      </form>
      {success && <p style={{ color: "green" }}>Appointment booked successfully!</p>}
    </div>
  );
}

export default BookingForm;
