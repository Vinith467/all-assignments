import React, { useState } from "react";

const Contact = () => {
  // local form state (frontend-only)
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState(null);

  const update = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic front-end validation
    if (!form.name || !form.email || !form.message) {
      setStatus({ type: "error", message: "Please fill all fields." });
      return;
    }

    // Option A: mailto fallback (opens email client)
    // const mailto = `mailto:your.email@example.com?subject=Contact from ${encodeURIComponent(
    //   form.name
    // )}&body=${encodeURIComponent(form.message + "\n\nContact: " + form.email)}`;
    // window.location.href = mailto;
    // setStatus({ type: "success", message: "Opening your email client..." });

    // Option B: Post to an endpoint (Netlify Forms / serverless function)
    // For now we simulate success (replace with real endpoint when available)
    try {
      // Simulate network delay
      await new Promise((res) => setTimeout(res, 800));
      setStatus({ type: "success", message: "Message sent! I will get back to you soon." });
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setStatus({ type: "error", message: "Failed to send. Try again later." });
    }
  };

  return (
    <div className="contact-page">
      <h1 className="text-center mb-4">Contact</h1>

      <div className="row justify-content-center">
        <div className="col-md-7">
          <div className="card shadow-sm">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input name="name" value={form.name} onChange={update} className="form-control" />
                </div>

                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input name="email" value={form.email} onChange={update} className="form-control" type="email" />
                </div>

                <div className="mb-3">
                  <label className="form-label">Message</label>
                  <textarea name="message" value={form.message} onChange={update} className="form-control" rows="5" />
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <button type="submit" className="btn btn-primary">Send Message</button>

                  <div>
                    <a className="me-3" href="mailto:your.email@example.com">Email</a>
                    <a href="tel:+919876543210">Phone</a>
                  </div>
                </div>

                {status && (
                  <div className={`alert mt-3 ${status.type === "success" ? "alert-success" : "alert-danger"}`} role="alert">
                    {status.message}
                  </div>
                )}
              </form>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p>Prefer direct contact? You can email me at <a href="mailto:your.email@example.com">your.email@example.com</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
