import React from "react";
import "./Header.css";
import liskLogo from "../assets/lisk-snake.png";


const Header = () => {
  return (
    <div className="Header">
      <img src={liskLogo} alt="lisk " />
    </div>
    
  );
};
export default Header;
