import React from "react";
import SearchBar from "./SearchBar";
import { Navbar, Container, Nav, NavDropdown } from "react-bootstrap";

const NavigationBar: React.FC = () => {
  return (
    <>
      <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
        <Container fluid style={{ maxWidth: "1600px" }}>
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
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="/movies">Movies</Nav.Link>
              <Nav.Link href="/shows">Shows</Nav.Link>
              <Nav.Link href="/images">Images</Nav.Link>
              <NavDropdown title="Torrents" id="torrents-dropdown">
                <NavDropdown.Item href="/torrents/search">Search</NavDropdown.Item>
                <NavDropdown.Item href="/torrents/my-torrents">My Torrents</NavDropdown.Item>
              </NavDropdown>
            </Nav>
            <Nav>
              <SearchBar />
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <br />
    </>
  );
};

export default NavigationBar;
