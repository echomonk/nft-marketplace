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
