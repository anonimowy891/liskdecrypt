import React, { useState, useEffect } from "react";
import "./App.css";
import { consoleDefaultText,  } from "./config/config.json";
import Account from "./components/Account";
import Console from "./components/Console";
import Header from "./components/Header";
import { getAccounts } from "./utils/tools";
import * as cryptography from "@liskhq/lisk-cryptography";
import * as transactions from "@liskhq/lisk-transactions";

const passphrase = require("@liskhq/lisk-passphrase");

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userAddress, setUserAddress] = useState("");
  const [userBalance, setUserBalance] = useState(0);
  const [consoleText, setConsoleText] = useState(consoleDefaultText);
  const [userPassphrase, setUserPassphrase] = useState("");

  const updateBalance = () => {
    let x = 10;
    let newBalance = parseInt(userBalance) + x;
    setUserBalance(newBalance.toString());
  };

  const decreseBalance = () => {
    let y = 1;
    let newBalance = parseInt(userBalance) - y;
    setUserBalance(newBalance.toString());
  };


  useEffect(() => {
    if (sessionStorage.getItem("secret")) {
      const userPassphrase = sessionStorage.getItem("secret");
      const userAddress = cryptography.getAddressFromPassphrase(userPassphrase);

      lsnConsole(`returning user: ${userAddress}\n ${userPassphrase}`);
      getAccounts({
        limit: 1,
        address: userAddress,
      })
        .then((res) => {
          let balance = transactions.utils.convertBeddowsToLSK(
            res.data[0].balance
          );

          setUserBalance(balance);
          setUserAddress(userAddress);
          setLoggedIn(true);
        })
        .catch((err) => {
          lsnConsole(err);
        });
    }
  }, []);



  const login = (userPassphrase) => {
    setUserPassphrase(userPassphrase);
    const errors = passphrase.validation.getPassphraseValidationErrors(
      userPassphrase
    );
    if (!errors.length) {
      const userAddress = cryptography.getAddressFromPassphrase(userPassphrase);
      lsnConsole(`logging in: ${userPassphrase} - ${userAddress}`);
      getAccounts({
        limit: 1,
        address: userAddress,
      })
        .then((res) => {
          let balance = res.data[0]?.balance
            ? transactions.utils.convertBeddowsToLSK(res.data[0].balance)
            : 0;

          setUserBalance(balance);
          setUserAddress(userAddress);
          setLoggedIn(true);
          sessionStorage.setItem("secret", userPassphrase); 
        })
        .catch((err) => {
          lsnConsole(err);
        });
    } else {
      let errorMessages =
        "Invalid passphrase:\n" +
        errors[0].message +
        "\n" +
        errors[1].message +
        "\n" +
        errors[2].message;
      lsnConsole(errorMessages);
    }
  };

  const logout = () => {
    lsnConsole("logging out..");
    sessionStorage.removeItem("secret");
    setLoggedIn(false);
  };

  const lsnConsole = (text) => {
    setConsoleText(consoleText + text + "\n");
  };

  
  return (
    <div>
      <Header />

      <Account
        loggedIn={loggedIn}
        login={login}
        logout={logout}
        userAddress={userAddress}
        userBalance={userBalance}
        lsnConsole={lsnConsole}
        updateBalance={updateBalance}
        decreseBalance={decreseBalance}
      />
        
      <Console consoleText={consoleText} />
      
    </div>
  );
};

export default App;
