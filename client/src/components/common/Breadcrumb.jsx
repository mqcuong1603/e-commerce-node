// src/components/common/Breadcrumb.jsx
import React from "react";
import { Link } from "react-router-dom";

const Breadcrumb = ({ items }) => {
  return (
    <nav aria-label="breadcrumb" className="mb-4">
      <ol className="breadcrumb">
        {items.map((item, index) => (
          <li
            key={index}
            className={`breadcrumb-item ${!item.url ? "active" : ""}`}
          >
            {item.url ? <Link to={item.url}>{item.name}</Link> : item.name}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
