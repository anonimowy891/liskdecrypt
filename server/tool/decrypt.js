const { CashbackTransaction } = require("../transactions");
const { APIClient } = require("@liskhq/lisk-api-client");
const transactions = require("@liskhq/lisk-transactions");
const cryptography = require("@liskhq/lisk-cryptography");

// config
const client = new APIClient(["http://127.0.0.1:4000"]); // SDK test server
const passphrase =
  "creek own stem final gate scrub live shallow stage host concert they";
//  "creek own stem final gate scrub live shallow stage host concert they";

const networkIdentifier = cryptography.getNetworkIdentifier(
  "23ce0366ef0a14a91e5fd4b1591fc880ffbef9d988ff8bebf8f3666b0c09597d",
  "Lisk"
);

const decryptedMessage = cryptography.decryptMessageWithPassphrase(
  '90e03c142f676d4d06659983f80e18c6ca26687d226e527280a005819ec8d9dc0f8c6105',
  '3cd5f46b771efd1dbff643d2aa558ae2b5e6190170172da1',
  passphrase,
  '5c554d43301786aec29a09b13b485176e81d1532347a351aeafe018c199fd7ca'
); 

const tx = new CashbackTransaction({

asset: {
    recipientId: "2036888287767828430L",
    amount: transactions.utils.convertLSKToBeddows("30"), 
    asset: decryptedMessage
  },
  networkIdentifier: networkIdentifier,
  timestamp: transactions.utils.getTimeFromBlockchainEpoch(new Date()),
});

tx.sign(passphrase);
console.log(tx.toJSON())

client.transactions
  .broadcast(tx.toJSON())
  .then((res) => {
    console.log(res.data.message);
  })
  .catch((res) => {
    console.log("\nTransaction failed:");
    console.log(res);
  });
