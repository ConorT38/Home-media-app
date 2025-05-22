import React from "react";
import SearchBar from "./SearchBar";
import { Navbar, Container, Nav, NavDropdown } from "react-bootstrap";

const NavigationBar: React.FC = () => {
  return (
    <>
      <Navbar className="bg-body-tertiary">
        <Container>
          <Navbar.Brand href="/">
            <img
              alt=""
              src="/favicon.ico"
              width="30"
              height="30"
              className="d-inline-block align-top"
            />{' '}
            Home media
          </Navbar.Brand>
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="/movies">Movies</Nav.Link>
              <Nav.Link href="/shows">Shows</Nav.Link>
              <Nav.Link href="/images">Images</Nav.Link>
              <Nav.Link href="/torrents">Torrents</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
        <SearchBar />
      </Navbar>
      <br />
    </>
  );
};

export default NavigationBar;
