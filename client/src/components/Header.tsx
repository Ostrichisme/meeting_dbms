import React, { ReactElement,useState  } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
interface Props {
    
}

export default function Header({}: Props): ReactElement {
    return (

        <Navbar bg="light" expand="lg">
        <Navbar.Brand href="/">Meeting-DBMS</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link href="#home">Home</Nav.Link>
            <Nav.Link href="#link">Link</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
  
    )
}
