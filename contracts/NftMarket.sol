// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NftMarket is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    // Listing price of the NFT
    uint256 public listingPrice = 0.025 ether;

    Counters.Counter private _tokenIds;
    Counters.Counter private _listedItems;

    // All NFTs in an array
    uint256[] private _allNfts;

    // Mapping between tokenId and the index of the token in the tokenIds array
    mapping(uint256 => uint256) private _idToOwnedIndex;

    // Mapping to store the tokenURI of a token
    mapping(string => bool) private _usedTokenURIs;

    // Mapping to store the NftItem of a token
    mapping(uint256 => NftItem) private _idToNftItem;

    // Mapping of the owned NFTs for each address
    mapping(address => mapping(uint256 => uint256)) private _ownedTokens;

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
    event NftItemCreated(
        uint256 tokenId,
        uint256 price,
        address creator,
        bool isListed
    );

    constructor() ERC721("CreaturesNFT", "CNFT") {}

    /**
     * Set the listing price of the NFT later if needed
     * @param newPrice The new listing price
     */
    function setListingPrice(uint256 newPrice) external onlyOwner {
        require(newPrice > 0, "Price must be at least 1 wei");
        listingPrice = newPrice;
    }

    /**
     * Gets the NftItem of a token
     * @param tokenId The tokenId of the token
     * @return id The tokenId of the token
     */
    function getNftItem(uint256 tokenId) public view returns (NftItem memory) {
        return _idToNftItem[tokenId];
    }

    /**
     * Gets the total number of tokens minted
     * @return The total number of tokens minted
     */
    function listedItemsCount() public view returns (uint256) {
        return _listedItems.current();
    }

    /**
     * Checks if a tokenURI has been used before
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
     * Gets the token at a given index
     * @param index The index of the token
     * @return TokenId of the token
     */
    function tokenByIndex(uint256 index) public view returns (uint256) {
        require(
            index < totalSupply(),
            "ERC721Enumerable: global index out of bounds"
        );
        return _allNfts[index];
    }

    /**
     * Gets the token at a given index of the tokens list of the requested owner
     * @param owner Address of the token owner
     * @param index uint256 representing the index to be accessed of the requested tokens list
     */
    function tokenOfOwnerByIndex(address owner, uint256 index)
        public
        view
        returns (uint256)
    {
        require(index < ERC721.balanceOf(owner), "Index out of bounds");
        return _ownedTokens[owner][index];
    }

    /**
     * Gets all the NFTs on sale
     */
    function getAllNftsOnSale() public view returns (NftItem[] memory) {
        uint256 allItemsCounts = totalSupply();
        uint256 currentIndex = 0;
        NftItem[] memory items = new NftItem[](_listedItems.current());

        for (uint256 i = 0; i < allItemsCounts; i++) {
            uint256 tokenId = tokenByIndex(i);
            NftItem storage item = _idToNftItem[tokenId];

            if (item.isListed == true) {
                items[currentIndex] = item;
                currentIndex += 1;
            }
        }

        return items;
    }

    /**
     * Gets all the NFTs owned by the user
     */
    function getOwnedNfts() public view returns (NftItem[] memory) {
        uint256 ownedItemsCount = ERC721.balanceOf(msg.sender);
        NftItem[] memory items = new NftItem[](ownedItemsCount);

        for (uint256 i = 0; i < ownedItemsCount; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(msg.sender, i);
            NftItem storage item = _idToNftItem[tokenId];
            items[i] = item;
        }

        return items;
    }

    /**
     * Mints a new token
     * @param tokenURI The tokenURI of the token
     * @param price The price of the token
     * @return TokenId of the token
     */
    function mintToken(string memory tokenURI, uint256 price)
        public
        payable
        returns (uint256)
    {
        require(
            !tokenUriExists(tokenURI),
            "NftMarket: Token URI already exists"
        );
        require(
            msg.value == listingPrice,
            "Price must be equal to listing price"
        );

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
     * Buys a token
     * @param tokenId The tokenId of the token
     */
    function buyNft(uint256 tokenId) public payable {
        uint256 price = _idToNftItem[tokenId].price;
        address owner = ERC721.ownerOf(tokenId);

        require(msg.sender != owner, "NftMarket: You cannot buy your own NFT");
        require(
            msg.value == price,
            "NftMarket: Price must be equal to the NFT price"
        );

        _idToNftItem[tokenId].isListed = false;
        _listedItems.decrement();

        _transfer(owner, msg.sender, tokenId);
        payable(owner).transfer(msg.value);
    }

    /**
     * Places a token on sale
     * @param tokenId The tokenId of the token
     * @param newPrice The new price of the token
     */
    function placeNftOnSale(uint256 tokenId, uint256 newPrice) public payable {
        require(
            ERC721.ownerOf(tokenId) == msg.sender,
            "You are not owner of this nft"
        );
        require(
            _idToNftItem[tokenId].isListed == false,
            "Item is already on sale"
        );
        require(
            msg.value == listingPrice,
            "Price must be equal to listing price"
        );

        _idToNftItem[tokenId].isListed = true;
        _idToNftItem[tokenId].price = newPrice;
        _listedItems.increment();
    }

    /**
     * Creates a new NftItem
     * @param tokenId The tokenId of the token
     * @param price The price of the token
     */
    function _createNftItem(uint256 tokenId, uint256 price) private {
        require(price > 0, "NftMarket: Price must be greater than 0");

        _idToNftItem[tokenId] = NftItem(tokenId, price, msg.sender, true);

        emit NftItemCreated(tokenId, price, msg.sender, true);
    }

    /**
     * Burns a token
     * @param tokenId The tokenId of the token
     */
    function burnToken(uint256 tokenId) public {
        _burn(tokenId);
    }

    /**
     *  Adds the token to a list of all tokens that have been minted by the contract
     *  @param from The address of the owner of the token
     *  @param to The address of the new owner of the token
     *  @param tokenId The tokenId of the token
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId);

        // Minting token
        if (from == address(0)) {
            _addTokenToAllTokensEnumeration(tokenId);
        } else if (from != to) {
            _removeTokenFromOwnerEnumeration(from, tokenId);
        }

        if (to == address(0)) {
            _removeTokenFromAllEnumeration(tokenId);
        } else if (to != from) {
            _addTokenToOwnerTokensEnumeration(to, tokenId);
        }
    }

    /**
     * Adds a token to the allTokens array...
     * ...to keep track of all the tokens that have been...
     * ...minted by the smart contract.
     * @param tokenId The tokenId of the token
     */
    function _addTokenToAllTokensEnumeration(uint256 tokenId) private {
        _idToNftIndex[tokenId] = _allNfts.length;
        _allNfts.push(tokenId);
    }

    /**
     * Adds a token to the ownerTokens array...
     * ...to keep track of tokens owned by an address
     * @param to The address of the owner of the token
     * @param tokenId The tokenId of the token
     */
    function _addTokenToOwnerTokensEnumeration(address to, uint256 tokenId)
        private
    {
        uint256 length = ERC721.balanceOf(to);

        _ownedTokens[to][length] = tokenId;
        _idToOwnedIndex[tokenId] = length;
    }

    /**
     * Removes a token from the allTokens array...
     * ...to keep track of all the tokens that have been...
     * ...burned by the owner
     * @param tokenId The tokenId of the token
     */

    function _removeTokenFromAllEnumeration(uint256 tokenId) private {
        uint256 lastTokenIndex = _allNfts.length - 1;
        uint256 tokenIndex = _idToNftIndex[tokenId];

        uint256 lastTokenId = _allNfts[lastTokenIndex];

        _allNfts[tokenIndex] = lastTokenId;
        _idToNftIndex[lastTokenId] = tokenIndex;

        delete _idToNftIndex[tokenId];
        _allNfts.pop();
    }

    /**
     * Removes a token from the ownerTokens array...
     * ...to keep track of tokens owned by an address
     * @param from The address of the owner of the token
     * @param tokenId The tokenId of the token
     */
    function _removeTokenFromOwnerEnumeration(address from, uint256 tokenId)
        private
    {
        uint256 lastTokenIndex = ERC721.balanceOf(from) - 1;
        uint256 tokenIndex = _idToOwnedIndex[tokenId];

        if (tokenIndex != lastTokenIndex) {
            uint256 lastTokenId = _ownedTokens[from][lastTokenIndex];

            _ownedTokens[from][tokenIndex] = lastTokenId;
            _idToOwnedIndex[lastTokenId] = tokenIndex;
        }

        delete _idToOwnedIndex[tokenId];
        delete _ownedTokens[from][lastTokenIndex];
    }
}
