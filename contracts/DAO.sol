pragma solidity >0.4.99 <0.6.0;

import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "./MasterRegistry.sol";

contract DAO is Pausable {
  address public member;
  address public master;
  MasterRegistry public masterRegistry;

  constructor(address payable _member, address _account, address _registry) public {
    member = address(_member);
    master = address(_account);
    PauserRole.addPauser(address(_account));
    masterRegistry = MasterRegistry(_registry);
    masterRegistry.setDAOAddress(address(this));
  }

  function setMember(address _member) public {
    require(msg.sender == member);
    member = _member;
  }

  function destroy(address payable recipient) public {
    require(msg.sender == member);
    selfdestruct(recipient);
  }
}