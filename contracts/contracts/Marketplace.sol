// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Marketplace is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private marketplaceIds;
    Counters.Counter private totalMarketplaceItemsSold;

    mapping(uint => Listing) private marketplaceIdToListingItem;

    struct Listing {
        uint marketplaceId;
        address nftAddress;
        uint tokenId;
        address payable seller;
        address payable owner;
        uint listPrice;
    }

    event ListingCreated(
        uint indexed marketplaceId,
        address indexed nftAddress,
        uint indexed tokenId,
        address seller,
        address owner,
        uint listPrice
    );

    function createListing(
        uint tokenId,
        address nftAddress,
        uint price
    ) public nonReentrant {
        require(price > 0, "List price must be 1 wei >=");
        marketplaceIds.increment();
        uint marketplaceItemId = marketplaceIds.current();
        marketplaceIdToListingItem[marketplaceItemId] = Listing(
            marketplaceItemId,
            nftAddress,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price
        );
        IERC721(nftAddress).transferFrom(msg.sender, address(this), tokenId);
        emit ListingCreated(
            marketplaceItemId,
            nftAddress,
            tokenId,
            msg.sender,
            address(0),
            price
        );
    }

    function buyListing(
        uint marketplaceItemId,
        address nftAddress
    ) public payable nonReentrant {
        uint price = marketplaceIdToListingItem[marketplaceItemId].listPrice;
        require(
            msg.value == price,
            "Value sent does not meet list price for NFT"
        );
        uint tokenId = marketplaceIdToListingItem[marketplaceItemId].tokenId;
        marketplaceIdToListingItem[marketplaceItemId].seller.transfer(
            msg.value
        );
        IERC721(nftAddress).transferFrom(address(this), msg.sender, tokenId);
        marketplaceIdToListingItem[marketplaceItemId].owner = payable(
            msg.sender
        );
        totalMarketplaceItemsSold.increment();
    }

    function getListing(
        uint marketplaceItemId
    ) public view returns (Listing memory) {
        return marketplaceIdToListingItem[marketplaceItemId];
    }

    function getListings(
        uint tokenId,
        address nftAddress
    ) public view returns (Listing[] memory) {
        uint totalListingCount = marketplaceIds.current();
        uint listingCount = 0;
        uint index = 0;

        for (uint i = 0; i < totalListingCount; i++) {
            if (
                marketplaceIdToListingItem[i + 1].tokenId == tokenId &&
                marketplaceIdToListingItem[i + 1].nftAddress == nftAddress
            ) {
                listingCount += 1;
            }
        }
        Listing[] memory items = new Listing[](listingCount);
        for (uint i = 0; i < totalListingCount; i++) {
            if (
                marketplaceIdToListingItem[i + 1].tokenId == tokenId &&
                marketplaceIdToListingItem[i + 1].nftAddress == nftAddress
            ) {
                uint currentId = marketplaceIdToListingItem[i + 1]
                    .marketplaceId;
                Listing memory currentItem = marketplaceIdToListingItem[
                    currentId
                ];
                items[index] = currentItem;
                index += 1;
            }
        }
        return items;
    }
}
