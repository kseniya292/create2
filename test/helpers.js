const assert = require('assert')
const Web3 = require('web3')
const HDWalletProvider = require('truffle-hdwallet-provider')

// deterministically computes the smart contract address given
// the account that will deploy the contract (factory contract)
// the salt as uint256 and the contract bytecode
function buildCreate2Address(creatorAddress, saltHex, byteCode) {
  return `0x${web3.utils.sha3(`0x${[
    'ff',
    creatorAddress,
    saltHex,
    web3.utils.sha3(byteCode)
  ].map(x => x.replace(/0x/, ''))
  .join('')}`).slice(-40)}`.toLowerCase()
}

// converts an int to uint256
function numberToUint256(value) {
  const hex = value.toString(16)
  return `0x${'0'.repeat(64-hex.length)}${hex}`
}

// encodes parameter to pass as contract argument
function encodeParam(dataType, data) {
  return web3.eth.abi.encodeParameter(dataType, data)
}

// returns true if contract is deployed on-chain
async function isContract(address) {
  const code = await web3.eth.getCode(address)
  return code.slice(2).length > 0
}

module.exports = {
  buildCreate2Address,
  numberToUint256,
  encodeParam,
  isContract
}