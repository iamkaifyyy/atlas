// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IPriceFeed.sol";

contract MockPriceFeed is IPriceFeed {
    int256 private _price;
    uint8 private _decimals;
    uint256 public lastUpdated;

    event PriceUpdated(int256 oldPrice, int256 newPrice, uint256 timestamp);

    constructor(int256 initialPrice, uint8 decimals_) {
        _price = initialPrice;
        _decimals = decimals_;
        lastUpdated = block.timestamp;
    }

    function getLatestPrice() external view override returns (int256 price, uint8 priceDecimals) {
        return (_price, _decimals);
    }

    function decimals() external view override returns (uint8) {
        return _decimals;
    }

    function setPrice(int256 newPrice) external {
        int256 old = _price;
        _price = newPrice;
        lastUpdated = block.timestamp;
        emit PriceUpdated(old, newPrice, block.timestamp);
    }
}
