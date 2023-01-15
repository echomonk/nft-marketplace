// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NftMarket is ERC721URIStorage {
    using Counters for Counters.Counter;

    // Listing price of the NFT
    uint256 public listingPrice = 0.025 ether;
    
    Counters.Counter private _tokenIds;
    Counters.Counter private _listedItems;

    // Mapping to store the tokenURI of a token
    mapping (string => bool) private _usedTokenURIs;

    // Mapping to store the NftItem of a token
    mapping(uint => NftItem) private _idToNftItem;

    // NftItem struct to store the tokenId, price, creator and isListed
    struct NftItem {
        uint tokenId;
        uint price;
        address creator;
        bool isListed;
    }

    // Events
    event NftItemCreated (
        uint tokenId,
        uint price,
        address creator,
        bool isListed
    );
    

    constructor() ERC721("CreaturesNFT", "CNFT" ){}

    /**
     * @dev Gets the NftItem of a token
     * @param tokenId The tokenId of the token
     * @return id The tokenId of the token
     */
    function getNftItem(uint tokenId) public view returns (NftItem memory) {
        return _idToNftItem[tokenId];
    }

    /**
     * @dev Gets the total number of tokens minted
     * @return The total number of tokens minted
     */
    function listedItems() public view returns (uint) {
        return _listedItems.current();
    }

    /**
     * @dev Checks if a tokenURI has been used before
     * @param tokenURI The tokenURI of the token
     * @return True if the tokenURI has been used before
     */
    function tokenUriExists(string memory tokenURI) public view returns (bool) {
        return _usedTokenURIs[tokenURI] == true;
    }

    /**
     * @dev Mints a new token
     * @param tokenURI The tokenURI of the token
     * @param price The price of the token
     * @return The tokenId of the token
     */
    function mintToken (string memory tokenURI, uint price) public payable returns (uint256) {
        require(!tokenUriExists(tokenURI), "NftMarket: Token URI already exists");
        require(msg.value == listingPrice, "Price must be equal to listing price");

        _tokenIds.increment();
        _listedItems.increment();
        _usedTokenURIs[tokenURI] = true;

        uint256 newTokenId = _tokenIds.current();

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        _createNftItem(newTokenId, price);
        _usedTokenURIs[tokenURI] = true;

        return newTokenId;
    }

    /**
     * @dev Creates a new NftItem
     * @param tokenId The tokenId of the token
     * @param price The price of the token
     */
    function _createNftItem (uint tokenId, uint price) private {
       require(price > 0, "NftMarket: Price must be greater than 0");

       _idToNftItem[tokenId] = NftItem(tokenId, price, msg.sender,true);

        emit NftItemCreated(tokenId, price, msg.sender, true);
    }

}