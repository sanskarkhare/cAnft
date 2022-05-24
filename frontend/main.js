const Web3 = require("web3");
const MyERC20 = require("../build/contracts/IERC20AndERC223");
const Composable = require("../build/contracts/ComposableNFT.json");
const ComposableAddr = "0x015b65ff9a0729a6B51d048b97673A46866118A0";
const MyErc20Addr = "0x5CC4158CA45E035413A1BE5aA602FDC471024949"
const aaveBridge = require('../build/contracts/IAaveBridge.json');
const aaveBAddr = "0xE0fBa4Fc209b4948668006B2bE61711b7f465bAe";
const susd = "0x99b267b9D96616f906D53c26dECf3C5672401282"

let contractERC20;
let contractComp;
let accounts;
let deployedNetworkComp;
let deployedNetworkERC20;

init = async () => {
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
    await window.ethereum.enable();
    console.log("Connected");
  } else {
    alert("Metamask not found");
  }
  const id = await web3.eth.net.getId();
  // deployedNetworkComp = Composable.networks[id];
  // console.log(deployedNetworkComp)
  contractComp = new web3.eth.Contract(
    Composable.abi,
    ComposableAddr
  );
  // deployedNetworkERC20 = MyERC20.networks[id];
  contractERC20 = new web3.eth.Contract(
    MyERC20.abi,
    MyErc20Addr
  );

   contractAERC20 = await new web3.eth.Contract(
    MyERC20.abi,
    susd
  );
  accounts = await web3.eth.getAccounts();
  // console.log("All Set up!!");
};

mintNFT = async () => {
  const receipt = await contractComp.methods
    .mint(ownerAddress.value)
    .send({ from: accounts[0] });
  console.log(receipt);
  console.log("Minted!!");
};

mintERC20 = async () => {

  const receipt = await contractERC20.methods
    .mint(accounts[0], tokenAmount.value)
    .send({ from: accounts[0] });
  console.log(receipt);
  console.log("Minted!!");
};

getERC20 = async () => {
  await contractERC20.methods
    .approve(ComposableAddr, getTokenAmount.value)
    .send({ from: accounts[0] });
  console.log("approved");
  const receipt = await contractComp.methods
    .getERC20(
      accounts[0],
      getTokenId.value,
      MyErc20Addr,
      getTokenAmount.value
    )
    .send({ from: accounts[0] });
  console.log(receipt);
  console.log("Recieved!!");
};

getAERC20= async () => {
  
  await contractAERC20.methods
    .approve(ComposableAddr, getATokenAmount.value)
    .send({ from: accounts[0] });
  console.log("approved");
  const receipt = await contractComp.methods
    .getERC20(
      accounts[0],
      getATokenId.value,
      susd,
      getATokenAmount.value
    )
    .send({ from: accounts[0] });
  console.log(receipt);
  console.log("Recieved!!");
};

sendAERC20 = async () => {
  
  const receipt = await contractComp.methods
    .transferERC20(
      sendATokenId.value,
      senderAAddress.value,
      susd,
      sendATokenAmount.value
    )
    .send({ from: accounts[0] });
  console.log(receipt);
  console.log("Transferred!!");
};

sendERC20 = async () => {
  const receipt = await contractComp.methods
    .transferERC20(
      sendTokenId.value,
      senderAddress.value,
      MyErc20Addr,
      sendTokenAmount.value
    )
    .send({ from: accounts[0] });
  console.log(receipt);
  console.log("Transferred!!");
};

showBalanceNFT = async () => {
  const receipt = await contractComp.methods
    .balanceOfERC20(balanceTokenId.value, MyErc20Addr)
    .call();
  console.log(receipt);
};

showBalanceAccount = async () => {
  const receipt = await contractERC20.methods
    .balanceOf(balanceAccountAddress.value)
    .call();
  console.log(receipt);
};

// deposit = async () => {
  // const DCon = new web3.eth.Contract(
  //   MyERC20.abi,
  //   "0x9488fF6F29ff75bfdF8cd5a95C6aa679bc7Cd65c"
  // );
  // const res2 = await DCon.methods.approve('0xbd859aee81C50CE4FE82417a2d30257F83350472', web3.utils.toWei('50')).send({ from: accounts[0] })
  // console.log(res2)
  // const res = await DCon.methods.balanceOf('0xbd859aee81C50CE4FE82417a2d30257F83350472').call()
  // console.log(web3.utils.fromWei(res))
  

  // const Acon = new web3.eth.Contract(
  //   aaveBridge.abi,
  //   aaveBAddr
  // )
  // const res = await Acon.methods.withdraw("0x99b267b9D96616f906D53c26dECf3C5672401282",web3.utils.toWei('1'),"0xEb5a964C7B3ebB6F6100D433De8BD223c121d804").send({ from: accounts[0] })
  // console.log(res)
// }

const ownerAddress = document.getElementById("ownerAddress");

const btnMintNFT = document.getElementById("btnCreateItem");
btnMintNFT.onclick = mintNFT;

const ownerAddressERC20 = document.getElementById("ownerAddressERC20");
const tokenAmount = document.getElementById("tokenAmount");

const btnMintERC20 = document.getElementById("btnCreateERC20");
btnMintERC20.onclick = mintERC20;

const getTokenAmount = document.getElementById("getTokenAmount");
const getTokenId = document.getElementById("getTokenId");

const btnGetToken = document.getElementById("btnGetToken");
btnGetToken.onclick = getERC20;

const getATokenAmount = document.getElementById("getATokenAmount");
const getATokenId = document.getElementById("getATokenId");
const getATokenAddr = document.getElementById("getATokenAddr");

const btnAGetToken = document.getElementById("btnAGetToken");
btnAGetToken.onclick = getAERC20;

const senderAddress = document.getElementById("senderAddressERC20");
const sendTokenAmount = document.getElementById("sendTokenAmount");
const sendTokenId = document.getElementById("sendTokenId");

const btnSendToken = document.getElementById("btnSendToken");
btnSendToken.onclick = sendERC20;

const senderAAddress = document.getElementById("senderAAddressERC20");
const sendATokenAmount = document.getElementById("sendATokenAmount");
const sendATokenId = document.getElementById("sendATokenId");
const sendAATokenAddr = document.getElementById("sendAATokenAddr");

const btnASendToken = document.getElementById("btnASendToken");
btnASendToken.onclick = sendAERC20;

const balanceTokenId = document.getElementById("balanceTokenId");

const btnTokenBalance = document.getElementById("btnTokenBalance");
btnTokenBalance.onclick = showBalanceNFT;

const balanceAccountAddress = document.getElementById("balanceAccountAddress");

const btnAccountBalance = document.getElementById("btnAccountBalance");
btnAccountBalance.onclick = showBalanceAccount;

// const dep=document.getElementById("dep");
// dep.onclick = deposit;

init();
