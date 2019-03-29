pragma solidity ^0.5.0;

contract Registry {

  address public child;

  constructor () public {}

  function setChildAddress(address _address) public {
    child = _address;
  }

  function getChildAddress() public view returns (address) {
    return child;
  }

}