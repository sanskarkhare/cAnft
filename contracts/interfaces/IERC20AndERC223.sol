// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20AndERC223 {
    function transferFrom(address _from, address _to, uint256 _value) external returns (bool);
    function transfer(address to, uint256 value) external returns (bool success);
    function transfer(address to, uint256 value, bytes calldata data) external returns (bool success);
    function approve(address _spender, uint _value) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function totalSupply() external view returns (uint256);

  

  function allowance(address owner, address spender) external view returns (uint256);

  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);
}