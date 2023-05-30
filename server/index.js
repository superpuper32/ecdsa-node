const {secp256k1} = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");
const express = require("express");
const app = express();

const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "0296d44d337f71b5affaf9428dac4b77ef3a32948f2a58ac84db913a0a62157eb1": 100,
  "02d67b7de9f98bc2982f1b4aac92f2f11908e6eda1113422c585eaea7708f98134": 50,
  "039fd7ae52654e10f40f1c14ce8db2c1f08cc7c5e201e7c1d90c297d4c0d7434ca": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, sig } = req.body;

  const msg = `${sender}${amount}${recipient}`;
  const msgHash = toHex(keccak256(utf8ToBytes(msg)));
  sig.r = BigInt(sig.r);
  sig.s = BigInt(sig.s);
  const isSigned = secp256k1.verify(sig, msgHash, sender);

  if (!isSigned) {
    res.status(400).send({ message: "Not signed!" });
    return;
  }

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

// Randomly Generated Private Keys for testing
// 17b139cf8079d77dfb7da5f3ceb0bf8e5b4512e991ed164d71f6e69539a4e6e4
// 96b9343435b91a4dc0ba57d2711bdf6411ce28a1e375a5eab0a2cff9858b0698
// 74c9a4278be06031f31a8a65e6ec028a557d70d2253e40d37a27371db7073e97
