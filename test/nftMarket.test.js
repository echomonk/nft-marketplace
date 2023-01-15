const NftMarket = artifacts.require("NftMarket");
const { ethers } = require("ethers");

contract("NftMarket", (accounts) => {
  let _contract = null;
  let _nftPrice = ethers.utils.parseEther("0.3").toString();
  let _listingPrice = ethers.utils.parseEther("0.025").toString();

  before(async () => {
    _contract = await NftMarket.deployed();
  });

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
});
