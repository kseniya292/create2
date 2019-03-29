pragma solidity >0.4.99 <0.6.0;

import "./DAO.sol";
import "./MasterRegistry.sol";

contract Account {

  event Pause();
  event Unpause();

  address public owner;
  DAO public dao;
  MasterRegistry public masterRegistry;

  constructor(address payable _owner, address _registry) public {
    owner = _owner;
    masterRegistry = MasterRegistry(_registry);
  }

  function setOwner(address _owner) public {
    require(msg.sender == owner);
    owner = _owner;
  }

  function destroy(address payable recipient) public {
    require(msg.sender == owner);
    selfdestruct(recipient);
  }

  function pause() public returns (bool)
  {
    address addr = masterRegistry.getDAOAddress();
    dao = DAO(addr);
    dao.pause();
    emit Pause();
    return true;
  }

  function unpause() public returns (bool)
  {
    address addr = masterRegistry.getDAOAddress();
    dao = DAO(addr);
    dao.unpause();
    emit Unpause();
    return true;
  }

  function() payable external {}
}