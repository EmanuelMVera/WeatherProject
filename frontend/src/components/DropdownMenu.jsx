import { useState } from "react";
import "./styles/DropdownMenu.css";

const DropdownMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="dropdown-container">
      <button onClick={toggleDropdown} className="dropdown-toggle">
        {isOpen ? "▲" : "▼"}
      </button>

      {isOpen && (
        <div className="dropdown-content">
          <div className="card">Card 1</div>
          <div className="card">Card 2</div>
          <div className="card">Card 3</div>
          <div className="card">Card 4</div>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
