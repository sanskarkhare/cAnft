// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IERC20AndERC223.sol";
import "./interfaces/IAaveBridge.sol";
import "./interfaces/IERC998ERC20TopDown.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";



contract ComposableNFT is ERC721("MyComposable", "MYC"), IERC998ERC20TopDown {

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    address aaveBridge = address(0xE0fBa4Fc209b4948668006B2bE61711b7f465bAe);
    address sUsd = address(0x99b267b9D96616f906D53c26dECf3C5672401282);
    address aSUsd = address(0x9488fF6F29ff75bfdF8cd5a95C6aa679bc7Cd65c);
     IAaveBridge internal _bridge;
    // tokenId => token contract
    mapping(uint256 => address[]) private erc20Contracts;

    // tokenId => (token contract => token contract index)
    mapping(uint256 => mapping(address => uint256)) private erc20ContractIndex;

    // tokenId => (token contract => balance)
    mapping(uint256 => mapping(address => uint256)) private erc20Balances;

    function mint(address _recipient) external returns(uint256){
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _mint(_recipient, tokenId);
        return tokenId;
    }

    function balanceOfERC20(uint256 _tokenId, address _erc20Contract) public view override returns (uint256) {
        return erc20Balances[_tokenId][_erc20Contract];
    }

    function getERC20(
        address _from,
        uint256 _tokenId,
        address _erc20Contract,
        uint256 _value
    ) public override {
        require(_from == msg.sender, "Not allowed to getERC20");

        erc20Received(_from, _tokenId, _erc20Contract, _value);

        require(
            IERC20AndERC223(_erc20Contract).transferFrom(_from, address(this), _value),
            "ERC20 transfer failed."
        );
        if(_erc20Contract == sUsd){

            // IERC20AndERC223 aToken = IERC20AndERC223(sUsd);
         
            require(IERC20AndERC223(sUsd).approve(aaveBridge, _value),"unaaproved");

            // uint256 preBalance = aToken.balanceOf(address(this));

            IAaveBridge(aaveBridge).deposit(sUsd,_value, address(this), 0);

            //  uint256 postBalance = aToken.balanceOf(address(this));

            //  uint256 aTokensAmount = sub(postBalance,preBalance);
            //  _sendToken(msg.sender, sUsd, aTokensAmount);

            
            emit DaiSupported(_erc20Contract);
    
        } else {
            emit NotSupportedDai(_erc20Contract);
        }
        
    }
function sub(
        uint256 a,
        uint256 b
    ) internal pure returns (uint256) {
        unchecked {
            require(b <= a, "b>a");
            return a - b;
        }
    }
    function _sendToken(address to, address token, uint256 amount) internal {
    IERC20AndERC223(token).transfer(to, amount);
  }

    function transferERC20(uint256 _tokenId, address _to, address _erc20Contract, uint256 _value) external override {
        require(_to != address(0), "ERC20 transfer to zero address");
        require(_isApprovedOrOwner(msg.sender, _tokenId), "ERC721 transfer caller is not owner nor approved");
        removeERC20(_tokenId, _erc20Contract, _value, _to);
        if(_erc20Contract!=sUsd){
        require(IERC20AndERC223(_erc20Contract).transfer(_to, _value), "ERC20 transfer failed.");
        emit TransferERC20(_tokenId, _to, _erc20Contract, _value);
        }
    }

    // function transferERC223(
    //     uint256 _tokenId,
    //     address _to,
    //     address _erc223Contract,
    //     uint256 _value,
    //     bytes calldata _data
    // ) external override {
    //     require(_to != address(0), "ERC20 transfer to the zero address");
    //     require(_isApprovedOrOwner(msg.sender, _tokenId));
    //     removeERC20(_tokenId, _erc223Contract, _value);
    //     require(IERC20AndERC223(_erc223Contract).transfer(_to, _value, _data), "ERC223 transfer failed.");
    //     emit TransferERC20(_tokenId, _to, _erc223Contract, _value);
    // }

    function tokenFallback(
        address _from,
        uint256 _value,
        bytes calldata _data
    ) external override {
        require(_data.length > 0, "_data must contain the uint256 tokenId to transfer the token to.");
        require(Address.isContract(msg.sender), "msg.sender is not a contract");
        uint256 tokenId;
        assembly {
            tokenId := calldataload(132)
        }
        if (_data.length < 32) {
            tokenId = tokenId >> (256 - _data.length * 8);
        }
        //END TODO
        erc20Received(_from, tokenId, msg.sender, _value);
    }

    function erc20Received(
        address _from,
        uint256 _tokenId,
        address _erc20Contract,
        uint256 _value
    ) private {
        require(_exists(_tokenId), "_tokenId does not exist.");
        if (_value == 0) {
            return;
        }
        uint256 erc20Balance = erc20Balances[_tokenId][_erc20Contract];
        if (erc20Balance == 0) {
            erc20ContractIndex[_tokenId][_erc20Contract] = erc20Contracts[_tokenId].length;
            erc20Contracts[_tokenId].push(_erc20Contract);
        }
        erc20Balances[_tokenId][_erc20Contract] = erc20Balance + _value;
        emit ReceivedERC20(_from, _tokenId, _erc20Contract, _value);
    }

    function removeERC20(
        uint256 _tokenId,
        address _erc20Contract,
        uint256 _value,
        address _to
    ) private {
        if (_value == 0) {
            return;
        }
        uint256 erc20Balance = erc20Balances[_tokenId][_erc20Contract];
        require(erc20Balance >= _value, "Not enough token available to transfer.");
        uint256 newERC20Balance = erc20Balance - _value;
        erc20Balances[_tokenId][_erc20Contract] = newERC20Balance;
        if (newERC20Balance == 0) {
            uint256 lastContractIndex = erc20Contracts[_tokenId].length - 1;
            address lastContract = erc20Contracts[_tokenId][lastContractIndex];
            if (_erc20Contract != lastContract) {
                uint256 contractIndex = erc20ContractIndex[_tokenId][_erc20Contract];
                erc20Contracts[_tokenId][contractIndex] = lastContract;
                erc20ContractIndex[_tokenId][lastContract] = contractIndex;
            }
            erc20Contracts[_tokenId].pop();
        }
        if(_erc20Contract == sUsd){
            require(erc20Balances[_tokenId][_erc20Contract]<=_value, "Amount exceeds balance");
            IAaveBridge(aaveBridge).withdraw(sUsd, _value,_to);
            // _sendToken(_to, sUsd, _value);
            emit DaiSupported(_erc20Contract);
        } else {
            emit NotSupportedDai(_erc20Contract);
        }
    }
    
}