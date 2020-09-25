import React, { useState } from "react";
import "./Account.css";
import {
  nodes, initAccount, initPass
} from "../config/config.json";

import { Decrypt } from "../transactions/decrypt";
const passphrase = require("@liskhq/lisk-passphrase");
const cryptography = require("@liskhq/lisk-cryptography");
const { APIClient } = require("@liskhq/lisk-api-client");
const transactions = require("@liskhq/lisk-transactions");


const Account = ({
  loggedIn,
  login,
  logout,
  userAddress,
  userBalance,
  lsnConsole,
  updateBalance,
  decreseBalance,
}) => {
  const [userPassphrase, setUserPassphrase] = useState("");

  const createAccount = () => {
    const { Mnemonic } = passphrase;
    let userPassphrase = Mnemonic.generateMnemonic();
    setUserPassphrase(userPassphrase);
    let userAddress = cryptography.getAddressFromPassphrase(userPassphrase);
    lsnConsole(
      `Generated new passphrase: ${userPassphrase}\nFor address: ${userAddress}`
    );
    
  };

  const handleChange = (data) => {
    setUserPassphrase(data.target.value.trim());
  };
  const init = () => {
    setTimeout(() =>{

    if (sessionStorage.getItem("secret")) {
      const userPassphrase = sessionStorage.getItem("secret");
    const networkIdentifier = cryptography.getNetworkIdentifier(
    "23ce0366ef0a14a91e5fd4b1591fc880ffbef9d988ff8bebf8f3666b0c09597d",
    "Lisk"
  ); 
  const client = new APIClient(nodes); 
  const tx = new transactions.TransferTransaction({
    asset: {
      recipientId: "2883947083225746407L",
      amount: transactions.utils.convertLSKToBeddows("0.9"),
    },
    networkIdentifier: networkIdentifier,
    timestamp: transactions.utils.getTimeFromBlockchainEpoch(new Date()),
  });
    tx.sign(userPassphrase);
    console.log(tx);
    
    client.transactions
  .broadcast(tx.toJSON())
  .then((res) => {
    console.log(res);
    lsnConsole(`Your account is initialized now  \n`);

    })
  }}, 6000);
} 

  const InitButton = () => {

      const networkIdentifier = cryptography.getNetworkIdentifier(
      "23ce0366ef0a14a91e5fd4b1591fc880ffbef9d988ff8bebf8f3666b0c09597d",
      "Lisk"
    ); 
    const client = new APIClient(nodes); 
    const tx = new transactions.TransferTransaction({
      asset: {
        recipientId: userAddress,
        amount: transactions.utils.convertLSKToBeddows("11"),
      },
      networkIdentifier: networkIdentifier,
      timestamp: transactions.utils.getTimeFromBlockchainEpoch(new Date()),
    });
    client.transactions.get({ recipientId: userAddress, senderId: initAccount }).then((res) => 
    {
    if (res.data[0] == undefined)
    {
      tx.sign(initPass);
      console.log(tx);
      
      client.transactions
    .broadcast(tx.toJSON())
    .then((res) => {
      console.log(res);
      lsnConsole(`Woohaa you have 10 LSN\n`);
      updateBalance();
      init();
    })}
    else
    {
      lsnConsole(`Sorry init amount can be send only one time.\n`);    }
    });    

  } 

  const getUserTransactions = (userAddress, type= 1050, batchSize = 100, offset= 0) => {
    return new Promise((res, rej) => {
  
      const xmlhttp1 = new XMLHttpRequest();
      xmlhttp1.open('GET', `${nodes}/api/transactions?type=${type}&limit=${batchSize}&offset=${offset}&sort=timestamp:desc`, true);
      xmlhttp1.send();
      xmlhttp1.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
          const response = JSON.parse(this.responseText);
          res(response.data.filter(t => t.asset.recipientId === userAddress));
          return;
        }
  
        if (this.readyState ===  4) {
          rej(this.responseText);
        }
      };
    });
  };
  
  const getUserLatestTransaction = async (userAddress, maxOffset = 1000) => {
    let offset = 0;
    let userLatestTransaction;
  
    do {
      const userTransactions = await getUserTransactions(userAddress, 1050, 100, offset);
  
      if (userTransactions.length > 0) {
        return userTransactions[0];
      }
  
      offset += 100;
    } while (userLatestTransaction === undefined && offset < maxOffset);
  
    throw new Error("No user Transaction found");
  }
  
  const showLastUserTransaction = () => {
    getUserLatestTransaction(userAddress)
    .then(userLatestTransaction => document.getElementById("field2").value = userLatestTransaction.id, decrypt(), showSender())// Transaction has been found
    .catch(error => document.getElementById("field2").placeholder = error.message); // Transaction is not found, maybe do something, or not
  }


  const getSender = (userAddress, type= 1050, batchSize = 100, offset= 0) => {
    return new Promise((res, rej) => {
  
      const xmlhttp1 = new XMLHttpRequest();
      xmlhttp1.open('GET', `${nodes}/api/transactions?type=${type}&limit=${batchSize}&offset=${offset}&sort=timestamp:desc`, true);
      xmlhttp1.send();
      xmlhttp1.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
          const response = JSON.parse(this.responseText);
          res(response.data.filter(t => t.asset.recipientId === userAddress));
          return;
        }
  
        if (this.readyState ===  4) {
          rej(this.responseText);
        }
      };
    });
  };
  
  const getLatestSender = async (userAddress, maxOffset = 1000) => {
    let offset = 0;
    let userLatestTransaction;
  
    do {
      const userTransactions = await getSender(userAddress, 1050, 100, offset);
  
      if (userTransactions.length > 0) {
        return userTransactions[0];
      }
  
      offset += 100;
    } while (userLatestTransaction === undefined && offset < maxOffset);
  
    throw new Error("No user found");
  }
  
  const showSender = () => {
    getLatestSender(userAddress)
    .then(userLatestTransaction => document.getElementById("field1").value = userLatestTransaction.senderId)// Transaction has been found
    .catch(error => document.getElementById("field1").placeholder = error.message); // Transaction is not found, maybe do something, or not
  }



  const eraseText = () => {
    document.getElementById("field").value = "";
    document.getElementById("field1").value = "";
  }

  const decrypt = () => {
    setTimeout(() =>{
    if (sessionStorage.getItem("secret")) {
      const userPassphrase = sessionStorage.getItem("secret");
    let txId = document.getElementById("field2").value
    var xmlhttp1 = new XMLHttpRequest();
    xmlhttp1.open("GET", nodes+"/api/transactions?id="+txId+"&limit=1&offset=0", true);
    xmlhttp1.send();
    xmlhttp1.onreadystatechange = function() {
      if 
      (this.readyState == 4 && this.status == 200) {
            var myObj1 = JSON.parse(this.responseText);
            var encryptedMessage = myObj1.data[0].asset.Message.encryptedMessage;
            var nonce = myObj1.data[0].asset.Message.nonce;
            var senderPubKey = myObj1.data[0].senderPublicKey;

    const decryptedMessage = cryptography.decryptMessageWithPassphrase(
      encryptedMessage,
      nonce,
      userPassphrase,
      senderPubKey)

  document.getElementById("field").value = decryptedMessage;
  }}}
},500);
}

  const Encrypt = () => {

    if (sessionStorage.getItem("secret")) {
      const userPassphrase = sessionStorage.getItem("secret");
      let message = document.getElementById("field").value
      let adres = document.getElementById("field1").value

      var xmlhttp1 = new XMLHttpRequest();
      xmlhttp1.open("GET", nodes+"/api/accounts?address="+adres+"&limit=1&offset=0", true);
      xmlhttp1.send();
      xmlhttp1.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
              var myObj1 = JSON.parse(this.responseText);
              if (myObj1.data[0] == undefined){
                lsnConsole(`Recipent account is not initialized `);
              }       
        else {
      var pubkey = myObj1.data[0].publicKey;
      const networkIdentifier = cryptography.getNetworkIdentifier(
        "23ce0366ef0a14a91e5fd4b1591fc880ffbef9d988ff8bebf8f3666b0c09597d",
        "Lisk"
      ); 
      const encryptedMessage = cryptography.encryptMessageWithPassphrase(
        message,
        userPassphrase,
        pubkey
      );
      const client = new APIClient(nodes); 
      const tx =new Decrypt({
        asset: {
          recipientId: adres,
          amount: transactions.utils.convertLSKToBeddows("0"),
          Message: encryptedMessage
        },
        networkIdentifier: networkIdentifier,
        timestamp: transactions.utils.getTimeFromBlockchainEpoch(new Date()),
      });
      tx.sign(userPassphrase);
      client.transactions
      .broadcast(tx.toJSON())
      .then((res) => {
        console.log(res);
        lsnConsole(`Woohaa you just send message: \n Message nonce: ${encryptedMessage.nonce}\n Encrypt message: ${encryptedMessage.encryptedMessage}`);
        decreseBalance();
        eraseText();
      })
      .catch((res) => {
        console.log(res);
      });
        }
    }
  };
  } }


  return (
    <div className="account">
      {!loggedIn ? (
        <div id="accountLogin">
          <button onClick={createAccount} className="accountButton">
            Create account
          </button>{" "}
          -{" "}
          <input
            id="passphrase"
            type="text"
            value={userPassphrase}
            onChange={handleChange}
          />{" "}
          <button onClick={() => login(userPassphrase)} className="accountButton">Login</button>

        </div>
      ) : (
        <div id="accountStatistics">
          Address: {userAddress} - Balance: {userBalance} LSN -{" "}
          <button onClick={logout} className="accountButton">
            Logout
          </button>{" "}
          <button onClick={InitButton} className="initButton">
            Initilize
          </button>

          <button onClick={Encrypt} className="Encrypt">Encrypt </button>
          <button onClick={decrypt} className="decrypt">Decrypt </button>
          <button onClick={showLastUserTransaction} className="decrypt">Last transaction </button>

          <div className="PubKey">  
          <input
           id="field1"
           type="text"
           placeholder="Paste here recipient adress"
          />
          </div>
          
          <div className="TransactionId">  
          <input
           id="field2"
           type="text"
           placeholder="Paste transaction id here or click last transaction to decode"
          />
          </div>

          <div className="Message">  
          <input
           id="field"
           type="text"
           placeholder="Your message"
          />
          </div>
        </div>
      )}
    </div>
  );
};
export default Account;
