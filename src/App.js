import React from "react";
import { Layout, Menu, Breadcrumb } from "antd";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from "react-router-dom";

import PublicPage from "./Pages/PublicPage";
import LoginPage from "./Pages/LoginPage";
import ProtectedPage from "./Pages/ProtectPage";

import "./App.css";

const { Header, Content, Footer } = Layout;

const PrivateRoute = ({ children, ...rest }) => {
  let isAuthenticated = localStorage.getItem("isLogin");
  console.log("isAuthenticated", isAuthenticated);

  return (
    <Route
      {...rest}
      render={({ location }) =>
        isAuthenticated ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: location },
            }}
          />
        )
      }
    />
  );
};

const App = () => {
  return (
    <Router>
      <Layout className="layout">
        <Header>
          <div className="logo" />
          <Menu theme="dark" mode="horizontal">
            <Menu.Item key="1">
              {" "}
              <Link to="/">Public Page</Link>{" "}
            </Menu.Item>
            <Menu.Item key="2">
              <Link to="/protected">Protect Page</Link>
            </Menu.Item>
          </Menu>
        </Header>
        <Content style={{ padding: "0 50px" }}>
          <Breadcrumb style={{ margin: "16px 0" }}></Breadcrumb>
          <div className="site-layout-content">
            <Switch>
              <Route path="/" exact>
                <PublicPage />
              </Route>
              <Route path="/login" exact>
                <LoginPage />
              </Route>
              <PrivateRoute path="/protected" exact>
                <ProtectedPage />
              </PrivateRoute>
            </Switch>
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          FUSANG SSO ©2020 Created by FE STS team
        </Footer>
      </Layout>
    </Router>
  );
};

export default App;
