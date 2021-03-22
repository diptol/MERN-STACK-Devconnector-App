import React, { Fragment } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <Fragment>
      <nav className="navbar bg-dark">
        <h1>
          <Link to="/dashboard">
            {" "}
            <i className="fas fa-code"></i> Devconnector{" "}
          </Link>
        </h1>

        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/profiles">Developers</Link>
          </li>
          <li>
            <Link to="/register">register</Link>
          </li>
          <li>
            <Link to="/login">login</Link>
          </li>
        </ul>
      </nav>
    </Fragment>
  );
};
export default Navbar;
