import { NextApiRequest, NextApiResponse } from "next";
import { Session, withIronSession } from "next-iron-session";
import contract from "../../public/contracts/NFTMarket.json";
import { ethers } from "ethers";
import * as util from "ethereumjs-util";
import { NftMarketContract } from "@_types/nftMarketContract";

type NETWORK = typeof contract.networks;

const targetNetwork = process.env.NEXT_PUBLIC_NETWORK_ID as keyof NETWORK;

// Getting contract abi
const abi = contract.abi;

// Getting the contract address
export const contractAddress = contract["networks"][targetNetwork]["address"];

export const pinataApiKey = process.env.PINATA_API_KEY as string;
export const pinataSecretApiKey = process.env.PIN_SECRET_API_KEY as string;

// Setting up an authentication session
export function withSession(handler: any) {
  return withIronSession(handler, {
    password: process.env.SECRET_COOKIE_PASSWORD as string,
    cookieName: "nft-auth-session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
    },
  });
}

// Checking the session
export const addressCheckMiddleware = async (
  req: NextApiRequest & { session: Session },
  res: NextApiResponse
) => {
  return new Promise(async (resolve, reject) => {
    const message = req.session.get("message-session");

    // Setting contract instance on server side
    const provider = new ethers.providers.JsonRpcProvider(
      "http://127.0.0.1:7545"
    );

    const contract = new ethers.Contract(
      contractAddress,
      abi,
      provider
    ) as unknown as NftMarketContract;

    // Creating a nonce to make sure the signature is unique
    let nonce: string | Buffer =
      "\x19Ethereum Signed Message:\n" +
      JSON.stringify(message).length +
      JSON.stringify(message);

    nonce = util.keccak(Buffer.from(nonce, "utf-8"));

    // Extracting v,r,s to retrieve address afterwards
    const { v, r, s } = util.fromRpcSig(req.body.signature);
    const pubKey = util.ecrecover(util.toBuffer(nonce), v, r, s);
    const addrBuffer = util.pubToAddress(pubKey);
    const address = util.bufferToHex(addrBuffer);

    if (address === req.body.address) {
      resolve("Correct Address");
    } else {
      reject("Wrong Address!");
    }
  });
};
