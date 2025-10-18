// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";


contract TokenSale {
    uint256 public ratio;
    uint256 public price;
    address public tokenContract;
    address public nftContract;

    constructor(
        uint256 _ratio, 
        uint256 _price, 
        address _tokenContract, 
        address _nftContract
        ) {
        ratio = _ratio;
        price = _price;
        tokenContract = _tokenContract;
        nftContract = _nftContract;
    }
}