import React from "react";
import SearchBar from "./SearchBar";

const NavigationBar: React.FC = () => {
  return (
    <>
      <nav className="navbar justify-content-between navbar-dark bg-primary">
        <a className="navbar-brand" href="/">
          Home Media
        </a>
        <SearchBar />
      </nav>
      <br />
    </>
  );
};

export default NavigationBar;
