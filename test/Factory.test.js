const Factory = artifacts.require('Factory')
const {
  buildCreate2Address,
  numberToUint256,
  encodeParam,
  isContract
} = require('./helpers.js')

// constructor arguments are appended to contract bytecode
const { abi:accountAbi, bytecode:accountBytecode } = require('../build/contracts/Account.json')

let computedAddr;

// TODO: proper tests

contract('Factory', (accounts) => {
  let instance
  let creator = accounts[0]

  before('setup', async () => {
    instance = await Factory.new()
    factoryAddress = instance.address
    factoryInstance = await Factory.at(factoryAddress)
  })

  describe('test deploy', () => {
    const bytecode = `${accountBytecode}${encodeParam('address', creator).slice(2)}`
    const salt = 1

    it('should deploy', async () => {
      const contract = await isContract(instance.address)
      assert.isTrue(contract)
    })
    it('should get account address', async () => {
      computedAddr = buildCreate2Address(
        factoryAddress,
        numberToUint256(salt),
        bytecode
      )

      const contract = await isContract(computedAddr)
      assert.isFalse(contract)
    })
    it('should deploy Account', async () => {
      const tx = await factoryInstance.deploy(bytecode, salt);
      const deployedAddress = tx.receipt.logs[0].args.addr.toLowerCase();
      assert.equal(computedAddr, deployedAddress)
      assert.isTrue(await isContract(deployedAddress)) // true
    })
  })
})