const { expectEvent, shouldFail } = require('openzeppelin-test-helpers');

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
let bytecode
let salt

contract('Factory', (accounts) => {
  let factory
  let creator = accounts[0]

  before('setup', async () => {
    factory = await Factory.new()
    factoryInstance = await Factory.at(factory.address)

    // deploy registry
    registry = await MasterRegistry.new()
    registryInstance = await MasterRegistry.at(registry.address)

    // constructor arguments are appended to contract bytecode
    bytecode = `${accountBytecode}${encodeParam('address', creator).slice(2)}${encodeParam('address', registry.address).slice(2)}`
    salt = 1

    // determine address of Account before it is deployed
    computedAddr = buildCreate2Address(
      factory.address,
      numberToUint256(salt),
      bytecode
    )

  })

  describe('test deploy', () => {
    it('should deploy Factory', async () => {
      const contract = await isContract(factory.address)
      assert.isTrue(contract)
    })
    it('should create Account address but not deploy it', async () => {
      const contract = await isContract(computedAddr)
      assert.isFalse(contract)
    })
    it('should deploy DAO', async () => {
      // deploy DAO
      dao = await DAO.new(accounts[2], computedAddr, registry.address);
      daoInstance = await DAO.at(dao.address)

      const contract = await isContract(dao.address)
      assert.isTrue(contract)
    })
    it('should deploy Account and allow it to pause DAO', async () => {
      // deploy DAO and pass address of Account contract (not yet deployed)
      dao = await DAO.new(accounts[2], computedAddr, registry.address);
      daoInstance = await DAO.at(dao.address)
      
      // now deploy Account
      const tx = await factoryInstance.deploy(bytecode, salt);
      const deployedAddress = tx.receipt.logs[0].args.addr.toLowerCase();
      accountInstance = await Account.at(deployedAddress);

      const contract = await isContract(deployedAddress)
      assert.isTrue(contract)

      // call pause function in Account, which should pause DAO
      const { logs } = await accountInstance.pause();
      const paused = await daoInstance.paused();
      assert.isTrue(paused)

      // expect Pause event
      expectEvent.inLogs(logs, "Pause")

    })
    it('should revert if deploying to computedAddr again', async () => {
      // now deploy Account
      await shouldFail(factoryInstance.deploy(bytecode, salt));

    })
  })
})