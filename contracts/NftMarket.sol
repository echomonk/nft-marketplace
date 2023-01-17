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

    // All NFTs in an array
    uint256[] private _allNfts;

    // Mapping to store the tokenURI of a token
    mapping (string => bool) private _usedTokenURIs;

    // Mapping to store the NftItem of a token
    mapping(uint256 => NftItem) private _idToNftItem;

    // Mapping to store the index of the token to tokenIds array
    mapping(uint256 => uint256) private _idToNftIndex;

    // NftItem struct to store the tokenId, price, creator and isListed
    struct NftItem {
        uint256 tokenId;
        uint256 price;
        address creator;
        bool isListed;
    }

    // Events
    event NftItemCreated (
        uint256 tokenId,
        uint256 price,
        address creator,
        bool isListed
    );
    

    constructor() ERC721("CreaturesNFT", "CNFT" ){}

    /**
     * @dev Gets the NftItem of a token
     * @param tokenId The tokenId of the token
     * @return id The tokenId of the token
     */
    function getNftItem(uint256 tokenId) public view returns (NftItem memory) {
        return _idToNftItem[tokenId];
    }

    /**
     * @dev Gets the total number of tokens minted
     * @return The total number of tokens minted
     */
    function listedItemsCount() public view returns (uint256) {
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
     * @dev Total number of tokens minted
     */
    function totalSupply() public view returns (uint256) {
        return _allNfts.length;
    }

    /**
     * @dev Gets the token at a given index
     * @param index The index of the token
     * @return TokenId of the token
     */
    function tokenByIndex(uint256 index) public view returns (uint256) {
        require(index < totalSupply(), "ERC721Enumerable: global index out of bounds");
        return _allNfts[index];
    }

    /**
     * @dev Mints a new token
     * @param tokenURI The tokenURI of the token
     * @param price The price of the token
     * @return TokenId of the token
     */
    function mintToken (string memory tokenURI, uint256 price) public payable returns (uint256) {
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
     * @dev Buys a token
     * @param tokenId The tokenId of the token
     */
    function buyNft (uint tokenId) public payable {
        uint256 price = _idToNftItem[tokenId].price;
        address owner = ERC721.ownerOf(tokenId);

        require(msg.sender != owner, "NftMarket: You cannot buy your own NFT");
        require(msg.value == price, "NftMarket: Price must be equal to the NFT price");

        _idToNftItem[tokenId].isListed = false;
        _listedItems.decrement();

        _transfer(owner, msg.sender, tokenId);
        payable(owner).transfer(msg.value);
    }

    /**
     * @dev Creates a new NftItem
     * @param tokenId The tokenId of the token
     * @param price The price of the token
     */
    function _createNftItem (uint256 tokenId, uint256 price) private {
       require(price > 0, "NftMarket: Price must be greater than 0");

       _idToNftItem[tokenId] = NftItem(tokenId, price, msg.sender,true);

        emit NftItemCreated(tokenId, price, msg.sender, true);
    }

    /**
     *  @dev Adds the token to a list of all tokens that have been minted by the contract
     *  @param from The address of the owner of the token
     *  @param to The address of the new owner of the token
     *  @param tokenId The tokenId of the token
     */
    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId);

        // Minting token
        if (from == address(0)) {
           _addTokenToAllTokensEnumeration(tokenId);
        }
    }

    /**
     * @dev Adds a token to the allTokens array...
     * ...to keep track of all the tokens that have been...
     * ...minted by the smart contract.
     * @param tokenId The tokenId of the token
     */
    function _addTokenToAllTokensEnumeration(uint256 tokenId) private {
        _idToNftIndex[tokenId] = _allNfts.length;
        _allNfts.push(tokenId);
    }

}