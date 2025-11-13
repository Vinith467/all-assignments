import React from "react";
import "./Blog.css";
import blogImage from "../assets/images.jpg";
const Blog = () => {
  const title = "10 Tips for Effective Time Management";
  const author = "John Doe";
  const description =
    "In today's fast-paced world, effective time management is crucial for success. Learn 10 tips to improve your time management skills and boost productivity.";
  const imageUrl = blogImage;

  return (
    <div className="container"
      style={{
        maxWidth: "800px",
        margin: "24px auto",
        padding: "18px",
        borderRadius: "10px",
        backgroundColor: "gray",
        color: "white",
        display: "flex",
        gap: "16px",
        alignItems: "flex-start",
      }}
    >
      <img className="img" src={imageUrl} alt="author img" />
      <div className="content">
        <h2
          style={{
            fontSize: "20px",
            margin: "0 0 6px 0",
            lineHeight: 1.2,
          }}
        >
          {title}
        </h2>
        <p>
          <strong>Author:</strong>
          {author}
        </p>
        <p>{description}</p>
      </div>
    </div>
  );
};
export default Blog;
