pragma solidity ^0.5.0;

contract MasterRegistry {

  address public multiSig;
  address public dao;

  constructor () public {}

  function setMultiSigAddress(address _address) public {
    multiSig = _address;
  }

  function setDAOAddress(address _address) public {
    dao = _address;
  }

  function getMultiSigAddress() public view returns (address) {
    return multiSig;
  }

  function getDAOAddress() public view returns (address) {
    return dao;
  }

}