import React from "react";
import { Auth } from "aws-amplify";
import { Button } from "antd";
import { useHistory } from "react-router-dom";

const ProtectPage = () => {
  let history = useHistory();

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const logout = async () => {
    try {
      await Auth.signOut();

      localStorage.removeItem("isLogin", false);
      history.push("/");
    } catch (error) {
      console.log("error signing out: ", error);
    }
  };

  return (
    <>
      <h3>This is protected page</h3>
      <p>Required login credential to see this content.</p>
      <p>Hello {userInfo.name}, </p>
      <p>Your phone number: {userInfo.phone_number}</p>
      <p>Your email: {userInfo.email}</p>
      <Button onClick={logout}>Logout</Button>
    </>
  );
};

export default ProtectPage;
