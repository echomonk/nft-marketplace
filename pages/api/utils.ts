import { withIronSession } from "next-iron-session";
import contract from "../../public/contracts/NFTMarket.json";

type NETWORK = typeof contract.networks;

const targetNetwork = process.env.NEXT_PUBLIC_NETWORK_ID as keyof NETWORK;

// Getting the contract address
export const contractAddress = contract["networks"][targetNetwork]["address"];

//Setting up an authentication session for the app
export function withSession(handler: any) {
  return withIronSession(handler, {
    password: process.env.SECRET_COOKIE_PASSWORD as string,
    cookieName: "nft-auth-session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
    },
  });
}
