export type TraitTypes = "attack" | "health" | "speed";

export type NftAttributes = {
  trait_type: TraitTypes;
  value: string;
};

export type NftMeta = {
  description: string;
  image: string;
  name: string;
  attributes: NftAttributes[];
};

export type NftCore = {
  tokenId: number;
  price: number;
  creator: string;
  isListed: boolean;
};

export type Nft = {
  meta: NftMeta;
} & NftCore;
