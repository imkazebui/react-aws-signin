import React, { useState } from "react";
import { Auth } from "aws-amplify";
import QRCode from "qrcode.react";
import { useHistory, useLocation } from "react-router-dom";
import { Form, Input, Button, message } from "antd";

const layout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 6 },
};
const tailLayout = {
  wrapperCol: { offset: 10, span: 16 },
};

const Login = () => {
  let history = useHistory();
  let location = useLocation();

  const [isSubmit, setSubmitState] = useState(false);
  const [step, setStep] = useState("login");
  const [user, setUser] = useState({});
  // const [code, setCode] = useState("");
  const [mfaType, setMFAType] = useState("");
  const [qrCode, setQRCode] = useState("");

  let { from } = location.state || { from: { pathname: "/" } };

  const onFinishFailed = (errorInfo) => {
    setSubmitState(false);
    console.log("Failed:", errorInfo);
  };

  const checkRes = (user) => {
    setUser(user);
    setStep(user.challengeName);

    if (
      user.challengeName === "SMS_MFA" ||
      user.challengeName === "SOFTWARE_TOKEN_MFA"
    ) {
      setMFAType(user.challengeName);

      if (user.signInUserSession) {
        localStorage.setItem("isLogin", true);
        localStorage.setItem(
          "userInfo",
          JSON.stringify(user.signInUserSession.idToken.payload)
        );
        history.replace(from);
      }
    } else if (user.challengeName === "NEW_PASSWORD_REQUIRED") {
    } else if (user.challengeName === "MFA_SETUP") {
      // This happens when the MFA method is TOTP
      // The user needs to setup the TOTP before using it
      // More info please check the Enabling MFA part
      console.log("lam gi cho nay nhỉ");
      Auth.setupTOTP(user)
        .then((code) => {
          console.log("MFA_SETUP", code);
          let qrCode =
            "otpauth://totp/AWSCognito:" +
            user.username +
            "?secret=" +
            code +
            "&issuer=" +
            "";

          setQRCode(qrCode);
          setStep("qr-code");
        })
        .catch((err) => {
          console.log("MFA_SETUP err", err);
        });
    } else {
      // The user directly signs in
      console.log("The user directly signs in", user);
    }
  };

  const onFinish = async ({ username, password }) => {
    setSubmitState(true);

    try {
      const user = await Auth.signIn(username, password);
      // localStorage.setItem("isLogin", true);
      setSubmitState(false);

      // history.replace(from);

      console.log("user", user);

      checkRes(user);
    } catch (error) {
      setSubmitState(false);
      message.error(error.message);
      console.log("error signing in", error);
    }
  };

  const onFinishNewPassword = ({ newPassword, name, picture }) => {
    setSubmitState(true);

    Auth.completeNewPassword(
      user, // the Cognito User Object
      newPassword, // the new password
      // OPTIONAL, the required attributes
      {
        name,
        picture,
      }
    )
      .then((loggedUser) => {
        console.log("onFinishNewPassword", loggedUser);
        checkRes(loggedUser);
      })
      .catch((error) => {
        message.error(error.message);
      });

    setSubmitState(false);
  };

  const onFinishConfirmCode = ({ code }) => {
    setSubmitState(true);

    Auth.confirmSignIn(
      user, // Return object from Auth.signIn()
      code, // Confirmation code
      mfaType // MFA Type e.g. SMS_MFA, SOFTWARE_TOKEN_MFA
    )
      .then((loggedUser) => {
        console.log("onFinishConfirmCode", loggedUser);
        checkRes(loggedUser);
      })
      .catch((error) => {
        message.error(error.message);
      });

    setSubmitState(false);
  };

  const onFinishConfirmQRCode = ({ code }) => {
    setSubmitState(true);

    Auth.verifyTotpToken(
      user, // Return object from Auth.signIn()
      code // Confirmation code
    )
      .then((loggedUser) => {
        console.log("onFinishConfirmQRCode", loggedUser);

        localStorage.setItem("isLogin", true);
        localStorage.setItem(
          "userInfo",
          JSON.stringify(loggedUser.idToken.payload)
        );
        history.replace(from);

        Auth.setPreferredMFA(user, "TOTP");
      })
      .catch((error) => {
        message.error(error.message);
      });

    setSubmitState(false);
  };

  const renderUI = () => {
    switch (step) {
      case "qr-code":
        return (
          <>
            <h1 style={{ textAlign: "center" }}>QR Code</h1>
            <br />
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                marginBottom: "2em",
              }}
            >
              <QRCode value={qrCode} />;
            </div>

            <Form
              {...layout}
              name="basic"
              onFinish={onFinishConfirmQRCode}
              onFinishFailed={onFinishFailed}
            >
              <Form.Item
                label="Code"
                name="code"
                rules={[{ required: true, message: "Please input your code!" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item {...tailLayout}>
                <Button type="primary" htmlType="submit" loading={isSubmit}>
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </>
        );

      case "SMS_MFA":
      case "SOFTWARE_TOKEN_MFA":
        return (
          <>
            <h1 style={{ textAlign: "center" }}>Code</h1>
            <br />

            <Form
              {...layout}
              name="basic"
              onFinish={onFinishConfirmCode}
              onFinishFailed={onFinishFailed}
            >
              <Form.Item
                label="Code"
                name="code"
                rules={[{ required: true, message: "Please input your code!" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item {...tailLayout}>
                <Button type="primary" htmlType="submit" loading={isSubmit}>
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </>
        );
      case "MFA_SETUP":
        return <div></div>;

      case "NEW_PASSWORD_REQUIRED":
        return (
          <>
            <h1 style={{ textAlign: "center" }}>Update new password</h1>
            <br />

            <Form
              {...layout}
              name="basic"
              onFinish={onFinishNewPassword}
              onFinishFailed={onFinishFailed}
            >
              <Form.Item
                label="New Password"
                name="newPassword"
                rules={[
                  {
                    required: true,
                    message: "Please input your new password!",
                  },
                ]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item
                label="Name"
                name="name"
                rules={[{ required: true, message: "Please input your name!" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Picture"
                name="picture"
                rules={[
                  { required: true, message: "Please input your picture url!" },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item {...tailLayout}>
                <Button type="primary" htmlType="submit" loading={isSubmit}>
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </>
        );
      case "login":
        return (
          <>
            <h1 style={{ textAlign: "center" }}>Integrate with AWS Cognito.</h1>
            <br />

            <Form
              {...layout}
              name="basic"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
            >
              <Form.Item
                label="Username"
                name="username"
                rules={[
                  { required: true, message: "Please input your username!" },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: "Please input your password!" },
                ]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item {...tailLayout}>
                <Button type="primary" htmlType="submit" loading={isSubmit}>
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </>
        );
      default:
        return <div></div>;
    }
  };

  return renderUI();
};

export default Login;
