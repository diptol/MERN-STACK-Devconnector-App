import React, { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { setAlert } from "../../actions/alert";
import PropTypes from "prop-types";

const Register = ({ setAlert }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password2: "",
  });

  const { name, email, password, password2 } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    if (password !== password2) {
      setAlert("passwords do not match", "danger");
    } else {
      console.log(formData);
    }
  };

  return (
    <Fragment>
      <section className="container">
        <h1 className="large text-primary">Sign Up</h1>
        <p className="lead">
          <i className="fas fa-user"></i>Create Your Account
        </p>
        <form onSubmit={(e) => onSubmit(e)} className="form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Name"
              value={name}
              name="name"
              onChange={(e) => onChange(e)}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              value={email}
              name="email"
              onChange={(e) => onChange(e)}
              required
              placeholder="Email Address"
            />
            <small className="form-text">
              This site uses gravatar, so if you want to use a profile image,
              use a gravatar image
            </small>
          </div>
          <div className="form-group">
            <input
              type="password"
              value={password}
              name="password"
              onChange={(e) => onChange(e)}
              required
              placeholder="Password"
              minLength="6"
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              value={password2}
              name="password2"
              onChange={(e) => onChange(e)}
              placeholder="Confirm Password"
              minLength="6"
            />
          </div>
          <input type="submit" className="btn btn-primary" value="Register" />
        </form>
        <p className="my-1">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </section>
    </Fragment>
  );
};

Register.propTypes = {
  setAlert: PropTypes.func.isRequired,
};

export default connect(null, { setAlert })(Register);
