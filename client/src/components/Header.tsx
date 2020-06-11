import React from 'react'
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
interface Props {
}
const Header: React.SFC<Props> = (_props) => {
    return (
        <Navbar bg="light" expand="lg">
            <Navbar.Brand href="/">Meeting-DBMS</Navbar.Brand>
            <Navbar.Toggle />
            <Navbar.Collapse>
                <Nav className="mr-auto">
                    <Nav.Link href="/addmeeting">Add Meeting</Nav.Link>
                    <Nav.Link href="/updategrade">Update Grade</Nav.Link>
                    <Nav.Link href="/showmeetingroom">Show Meeting Room</Nav.Link>
                    <Nav.Link href="/showdepartment">Show Department</Nav.Link>
                    <Nav.Link href="/usesql">SQL Editor</Nav.Link>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}

export default Header
