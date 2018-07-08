import React from "react";
import { render } from "react-dom";
import PasswordRecoveryPage from "./PasswordRecoveryPage";

render(
  <PasswordRecoveryPage type="customer" />,
  document.getElementById("password_recovery")
);
