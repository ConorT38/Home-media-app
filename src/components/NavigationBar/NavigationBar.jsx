import React, { Component } from "react";
import SearchBar from "./SearchBar";

class NavigationBar extends Component {
  state = {};

  render() {
    return (
      <React.Fragment>
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
          <a className="navbar-brand" href="/">
            Home Media
          </a>
          <SearchBar />
        </nav>
        <br />
      </React.Fragment>
    );
  }
}

export default NavigationBar;
