import React, { Fragment, useState } from "react";
import { Link } from "react-router-dom";

const Login = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const { email, password } = loginData;
  const onChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };
  const onSubmit = (e) => {
    e.preventDefault();
    console.log(loginData);
  };

  return (
    <Fragment>
      <section className="container">
        <h1 className="large text-primary">Sign In</h1>
        <p className="lead">
          <i className="fas fa-user"></i>Kindly Provide Your Login Details
        </p>
        <form className="form" onSubmit={onSubmit}>
          <div className="form-group">
            <input
              type="text"
              onChange={onChange}
              name="email"
              value={email}
              placeholder="Email Address"
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              placeholder="Password"
            />
          </div>
          <div className="form-group">
            <input className="btn btn-primary" type="submit" value="Login" />
          </div>
        </form>
        <p className="my-1">
          Do not have an account? <Link to="/register">Sign In</Link>
        </p>
      </section>
    </Fragment>
  );
};

export default Login;
