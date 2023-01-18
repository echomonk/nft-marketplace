const NftMarket = artifacts.require("NftMarket");
const { ethers } = require("ethers");

contract("NftMarket", (accounts) => {
  let _contract = null;
  let _nftPrice = ethers.utils.parseEther("0.3").toString();
  let _listingPrice = ethers.utils.parseEther("0.025").toString();

  before(async () => {
    _contract = await NftMarket.deployed();
  });

  //--------------------------------------------------------------------------------------//
  //                                   MINT TOKEN TESTS                                   //
  //--------------------------------------------------------------------------------------//

  describe("Mint token", () => {
    const tokenURI = "https://test.com";
    before(async () => {
      await _contract.mintToken(tokenURI, _nftPrice, {
        from: accounts[0],
        value: _listingPrice,
      });
    });

    // Test case 1 - Check if the owner of the first token is address[0]
    it("owner of the first token should be address[0]", async () => {
      const owner = await _contract.ownerOf(1);
      assert.equal(
        owner,
        accounts[0],
        "Owner of token is not matching address[0]"
      );
    });

    // Test case 2 - Check if the tokenURI is https://test.com
    it("tokenURI should be https://test.com", async () => {
      const uri = await _contract.tokenURI(1);
      assert.equal(uri, tokenURI, "Token URI is not matching");
    });

    // Test case 3 - Check if the token is duplicated
    it("token should not be duplicated", async () => {
      try {
        await _contract.mintToken(tokenURI, _nftPrice, {
          from: accounts[0],
        });
      } catch (err) {
        assert(err, "NFT was minted with previously used tokenURI");
      }
    });

    // Test case 4 - Check if the contract has at least 1 listed item
    it("contract should have at least 1 listed item", async () => {
      const listedItems = await _contract.listedItemsCount();
      assert.equal(listedItems.toNumber(), 1, "Contract has no listed items");
    });

    // Test case 5 - Check if the contact creates nft item
    it("contract should create nft item", async () => {
      const nftItem = await _contract.getNftItem(1);

      assert.equal(nftItem.tokenId, 1, "Nft item tokenURI is not correct");
      assert.equal(nftItem.price, _nftPrice, "Nft item price is not correct");
      assert.equal(
        nftItem.creator,
        accounts[0],
        "Nft item creator is not correct"
      );
      assert.equal(nftItem.isListed, true, "Nft item is not listed");
    });
  });

  //--------------------------------------------------------------------------------------//
  //                                    BUY NFT TESTS                                     //
  //--------------------------------------------------------------------------------------//

  describe("Buy NFT", () => {
    before(async () => {
      await _contract.buyNft(1, {
        from: accounts[1],
        value: _nftPrice,
      });
    });

    // Test case 6 - Check if the item is still listed
    it("should unlist the item", async () => {
      const listedItem = await _contract.getNftItem(1);
      assert.equal(listedItem.isListed, false, "Item is still listed");
    });

    // Test case 7 - Check if listed items count is decremented
    it("should decrement the listed items count", async () => {
      const listedItemCount = await _contract.listedItemsCount();

      assert.equal(
        listedItemCount.toNumber(),
        0,
        "Count has not been decremented"
      );
    });

    // Test case 8 - Check if the NFT's owner has changed
    it("should change the owner of the item", async () => {
      const currentOwner = await _contract.ownerOf(1);
      assert.equal(currentOwner, accounts[1], "Owner is still accounts[0]");
    });
  });

  //--------------------------------------------------------------------------------------//
  //                                 TOKEN TRANSFER TESTS                                 //
  //--------------------------------------------------------------------------------------//

  describe("Token transfers", () => {
    const tokenURI = "https://test-json-2.com";
    before(async () => {
      await _contract.mintToken(tokenURI, _nftPrice, {
        from: accounts[0],
        value: _listingPrice,
      });
    });

    // Test case 9 - Check if total supply is correct
    it("should have two NFTs created", async () => {
      const totalSupply = await _contract.totalSupply();
      assert.equal(
        totalSupply.toNumber(),
        2,
        "Total supply of token is not correct"
      );
    });

    // Test case 10 - Check if we get the correct index of the NFT
    it("should be able to retreive nft by index", async () => {
      const nftId1 = await _contract.tokenByIndex(0);
      const nftId2 = await _contract.tokenByIndex(1);

      assert.equal(nftId1.toNumber(), 1, "Nft id is wrong");
      assert.equal(nftId2.toNumber(), 2, "Nft id is wrong");
    });

    // Test case 11 - Check if contract has listed NFTs
    it("should have one listed NFT", async () => {
      const listedNfts = await _contract.getAllNftsOnSale();
      assert.equal(listedNfts[0].tokenId, 2, "NFT is not listed");
    });

    // Test case 12 - Check if we get the correct index of the NFT
    it("account[1] should have one owned NFT", async () => {
      const ownedNfts = await _contract.getOwnedNfts({ from: accounts[1] });
      assert.equal(ownedNfts[0].tokenId, 1, "Nft has a wrong id");
    });

    // Test case 13 - Check if we get the correct index of the NFT
    it("account[0] should have one owned NFT", async () => {
      const ownedNfts = await _contract.getOwnedNfts({ from: accounts[0] });
      assert.equal(ownedNfts[0].tokenId, 2, "Nft has a wrong id");
    });
  });

  describe("Token transfer to new owner", () => {
    before(async () => {
      await _contract.transferFrom(accounts[0], accounts[1], 2);
    });

    // Test case 14 - Check if account[0] has no NFTs
    it("accounts[0] should own 0 tokens", async () => {
      const ownedNfts = await _contract.getOwnedNfts({ from: accounts[0] });
      assert.equal(ownedNfts.length, 0, "Nft has a wrong id");
    });

    // Test case 15 - Check if account[1] has 2 NFTs
    it("accounts[1] should own 2 tokens", async () => {
      const ownedNfts = await _contract.getOwnedNfts({ from: accounts[1] });
      assert.equal(ownedNfts.length, 2, "Nft has a wrong id");
    });
  });

  //--------------------------------------------------------------------------------------//
  //                                   BURN TOKEN TESTS                                   //
  //--------------------------------------------------------------------------------------//

  describe("Burn Token", () => {
    const tokenURI = "https://test-json3.com";
    before(async () => {
      await _contract.mintToken(tokenURI, _nftPrice, {
        from: accounts[2],
        value: _listingPrice,
      });
    });

    // Test case 16 - Check if account[2] has one NFT
    it("account[2] should have one owned NFT", async () => {
      const ownedNfts = await _contract.getOwnedNfts({ from: accounts[2] });

      assert.equal(ownedNfts[0].tokenId, 3, "Nft has a wrong id");
    });

    // Test case 17 - Check if account[2] token burn is successful
    it("account[2] should own 0 NFTs", async () => {
      await _contract.burnToken(3, { from: accounts[2] });
      const ownedNfts = await _contract.getOwnedNfts({ from: accounts[2] });

      assert.equal(ownedNfts.length, 0, "Invalid length of tokens");
    });
  });

  //--------------------------------------------------------------------------------------//
  //                                    LIST NFT TESTS                                    //
  //--------------------------------------------------------------------------------------//

  describe("List an Nft", () => {
    before(async () => {
      await _contract.placeNftOnSale(1, _nftPrice, {
        from: accounts[1],
        value: _listingPrice,
      });
    });

    // Test case 18 - Check if account[1] has listed NFTs
    it("should have three listed items", async () => {
      const listedNfts = await _contract.getAllNftsOnSale();

      assert.equal(listedNfts.length, 3, "Invalid length of Nfts");
    });

    // Test case 19 - Check if account[1]'s listed NFT price is correct
    it("should set new listing price", async () => {
      await _contract.setListingPrice(_listingPrice, { from: accounts[0] });
      const listingPrice = await _contract.listingPrice();

      assert.equal(listingPrice.toString(), _listingPrice, "Invalid Price");
    });
  });
});
