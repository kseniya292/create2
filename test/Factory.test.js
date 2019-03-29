const Factory = artifacts.require('Factory')
const MasterRegistry = artifacts.require('MasterRegistry')
const DAO = artifacts.require('DAO')
const Account = artifacts.require('Account')

// ACOUNT = multisig
// DAO = DAO

const {
  buildCreate2Address,
  numberToUint256,
  encodeParam,
  isContract
} = require('./helpers.js')

const { abi:accountAbi, bytecode:accountBytecode } = require('../build/contracts/Account.json')
let computedAddr
let registry
let dao

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
    it('should deploy factory', async () => {
      const contract = await isContract(instance.address)
      assert.isTrue(contract)
    })
    // it('should get account address', async () => {
    //   computedAddr = buildCreate2Address(
    //     factoryAddress,
    //     numberToUint256(salt),
    //     bytecode
    //   )
    //   console.log(computedAddr)

    //   const contract = await isContract(computedAddr)
    //   assert.isFalse(contract)
    // })
    it('should deploy DAO', async () => {
      // deploy master Registry
      registry = await MasterRegistry.new()
      registryInstance = await MasterRegistry.at(registry.address)
      
      // constructor arguments are appended to contract bytecode
      const bytecode = `${accountBytecode}${encodeParam('address', creator).slice(2)}${encodeParam('address', registry.address).slice(2)}`
      const salt = 1

      // determine address of Account before it is deployed
      computedAddr = buildCreate2Address(
        factoryAddress,
        numberToUint256(salt),
        bytecode
      )

      // deploy DAO and pass address of Account contract (not yet deployed)
      dao = await DAO.new(accounts[2], computedAddr, registry.address);
      daoInstance = await DAO.at(dao.address)

      console.log(await registryInstance.getDAOAddress())
      
      // now deploy Account
      const tx = await factoryInstance.deploy(bytecode, salt);
      const deployedAddress = tx.receipt.logs[0].args.addr.toLowerCase();
      // console.log(await isContract(deployedAddress))

      // check if Account can pause DAO
      accountInstance = await Account.at(deployedAddress);
      console.log(accounts[0])
      console.log(await accountInstance.owner.call())

      await accountInstance.pause();
      console.log(await daoInstance.paused())
    })
    // it('should deploy DAO', async () => {
    //   computedAddr = buildCreate2Address(
    //     factoryAddress,
    //     numberToUint256(salt),
    //     bytecode
    //   )
    //   dao = await DAO.new(accounts[2], computedAddr);
    //   daoInstance = await DAO.at(dao.address)
      
    //   master = await daoInstance.master.call()
    //   // assert.equal(computedAddr, master)

    //   const contract = await isContract(computedAddr)
    //   assert.isFalse(contract)
    // })
    // it('should deploy Account', async () => {
    //   const tx = await factoryInstance.deploy(bytecode, salt);
    //   const deployedAddress = tx.receipt.logs[0].args.addr.toLowerCase();
    //   assert.equal(computedAddr, deployedAddress)
    //   assert.isTrue(await isContract(deployedAddress)) // true
    // })
  })
})