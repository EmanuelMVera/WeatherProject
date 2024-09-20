import "./styles/NavBar.css";
import CitySearch from "./CitySearch";
import DropdownMenu from "./DropdownMenu";

const NavBar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src="../../public/weather-icon.svg" alt="Logo" />
      </div>
      <div className="navbar-search">
        <CitySearch />
      </div>
      <div className="navbar-menu">
        <DropdownMenu />
      </div>
    </nav>
  );
};

export default NavBar;
