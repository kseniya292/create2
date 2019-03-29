const { expectEvent, shouldFail } = require('openzeppelin-test-helpers');

const Factory = artifacts.require('Factory')
const Registry = artifacts.require('Registry')
const Child = artifacts.require('Child')
const Parent = artifacts.require('Parent')

const {
  buildCreate2Address,
  numberToUint256,
  encodeParam,
  isContract
} = require('./helpers.js')

const { bytecode:parentBytecode } = require('../build/contracts/Parent.json')
let computedAddr
let registry
let dao
let bytecode
let salt

contract('Factory', (accounts) => {
  let factory
  let creator = accounts[0]

  before('setup', async () => {
    // deploy factory
    factory = await Factory.new()
    factoryInstance = await Factory.at(factory.address)

    // deploy registry
    registry = await Registry.new()
    registryInstance = await Registry.at(registry.address)

    // constructor arguments are appended to contract bytecode
    bytecode = `${parentBytecode}${encodeParam('address', creator).slice(2)}${encodeParam('address', registry.address).slice(2)}`
    salt = 1

    // determine address of Parent before it is deployed
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
    it('should create Parent address but not deploy it', async () => {
      const contract = await isContract(computedAddr)
      assert.isFalse(contract)
    })
    it('should deploy Child', async () => {
      // deploy child
      child = await Child.new(accounts[2], computedAddr, registry.address);
      childInstance = await Child.at(child.address)

      const contract = await isContract(child.address)
      assert.isTrue(contract)
    })
    it('should deploy Parent and allow it to pause DAO', async () => {
      // deploy child and pass address of Parent contract (not yet deployed)
      child = await Child.new(accounts[2], computedAddr, registry.address);
      childInstance = await Child.at(child.address)
      
      // now deploy Parent
      const tx = await factoryInstance.deploy(bytecode, salt);
      const deployedAddress = tx.receipt.logs[0].args.addr.toLowerCase();
      parentInstance = await Parent.at(deployedAddress);

      const contract = await isContract(deployedAddress)
      assert.isTrue(contract)

      // call pause function in Parent, which should pause Child
      const { logs } = await parentInstance.pause();
      const paused = await childInstance.paused();
      assert.isTrue(paused)

      // expect Pause event
      expectEvent.inLogs(logs, "Pause")

    })
    it('should revert if deploying to computedAddr again', async () => {
      // deploy the same contract
      await shouldFail(factoryInstance.deploy(bytecode, salt));

    })
  })
})