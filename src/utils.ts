// Add this script into ./src/index.ts and call this function
import * as web3 from "@solana/web3.js";
import {
  Metaplex,
  toMetaplexFile,
  CreateCompressedNftOutput,
} from "@metaplex-foundation/js";
import * as fs from "fs";

// create Collection NFT
export const createCollection = async (
  metaplex: Metaplex,
  directoryPath: string
): Promise<web3.PublicKey> => {
  // Checking files in asset directory
  const files = await fs.promises.readdir(directoryPath);
  const collectionFiles = files.filter((file) =>
    file.startsWith("collection.json")
  );
  console.log(`${collectionFiles.length} collection.json file found. \n`);

  // Create Collection mint
  console.log(`Creating NFT from collection.json ...`);
  const collectionData = await createSingleNft(
    metaplex,
    directoryPath + "/collection.json"
  );
  console.log(
    `Created Collection NFT Explorer: https://explorer.solana.com/address/${collectionData.nft.address.toString()}?cluster=${
      metaplex.connection
    }`
  );

  // Return collection key
  return collectionData.nft.address;
};

// create NFT
export const createMultipleNfts = async (
  metaplex: Metaplex,
  assetDirectory: string
): Promise<web3.PublicKey[]> => {
  // Checking files in asset directory
  const jsonType = ".json";
  const files = await fs.promises.readdir(assetDirectory);
  const jsonFiles = files.filter((file) => file.endsWith(jsonType));
  const collectionFiles = files.filter((file) =>
    file.startsWith("collection.json")
  );
  console.log(
    `${
      jsonFiles.length - collectionFiles.length
    } NFT JSON file(s) are found. \n`
  );

  // Creating NFTs
  const numberOfNfts = jsonFiles.length - collectionFiles.length;
  const NftArray: web3.PublicKey[] = [];

  for (let i = 0; i < numberOfNfts; i++) {
    // Create NFT mint
    console.log(`(${i + 1}/${numberOfNfts}) Creating NFT from ${i}.json ...`);
    const mintData = await createSingleNft(
      metaplex,
      assetDirectory + `/${i}.json`
    );
    console.log(
      `(${
        i + 1
      }/${numberOfNfts}) Created NFT Explorer: https://explorer.solana.com/address/${mintData.nft.address.toString()}?cluster=${
        metaplex.connection
      } \n`
    );
    NftArray.push(mintData.nft.address);
  }

  // Return the array of NFT keys
  return NftArray;
};

// FIX THIS
export const createSingleNft = async (
  metaplex: Metaplex,
  assetPath: string
): Promise<CreateCompressedNftOutput> => {
  // Get nft json file using fs.readFileSync (You'll receive buffer format)
  //   const jsonBuffer = ???;
  // convern buffer to json
  //   const json = ???;

  // Get image buffer and convert it to metaplexFile
  //   const file = toMetaplexFile(???, json.image);

  // Upload image and get image uri
  //   const imageUri = await metaplex.storage().upload(file);
  //   console.log("image uri:", imageUri);

  // upload metadata and get metadata uri (off chain metadata)
  //   const { uri } = await metaplex.nfts().uploadMetadata({
  //     name: ???,
  //     description: ???,
  //     image: ???,
  //   });

  //   console.log("metadata uri:", uri);

  // Create NFT
  //   const data = await metaplex.nfts().create(
  //     {
  //       uri: ???,
  //       name: ???,
  //       sellerFeeBasisPoints: ???,
  //       symbol: ???,
  //     },
  //     { commitment: "finalized" }
  //   );

  console.log(
    `Signature Explorer: https://explorer.solana.com/tx/${data.response.signature}?cluster=devnet$`
  );

  return data;
};

// Add and verify NFT to collection
export const addAndVerifyCollection = async (
  metaplex: Metaplex,
  collectionKey: web3.PublicKey,
  nftKeyArray: web3.PublicKey[] // First NFT is collection NFT
): Promise<Array<any>> => {
  // Get number of NFTs with collection NFT
  const numberOfNfts = nftKeyArray.length;

  let i = 0;
  let arrayOfVerifications = [];
  while (i < numberOfNfts) {
    // Get "NftWithToken" type from mint address
    const nft = await metaplex
      .nfts()
      .findByMint({ mintAddress: nftKeyArray[i] });

    // Update metaplex data and add collection
    await metaplex.nfts().update({
      nftOrSft: nft,
      collection: collectionKey,
    });

    console.log(
      `(${
        i + 1
      }/${numberOfNfts}) Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=${
        metaplex.connection
      }`
    );
    console.log(
      `(${i + 1}/${numberOfNfts}) Waiting to verify collection ${
        nftKeyArray[0]
      } on mint ${nftKeyArray[i]}... `
    );

    // verify collection by owner
    const { response } = await metaplex.nfts().verifyCollection({
      mintAddress: nftKeyArray[i],
      collectionMintAddress: collectionKey,
      isSizedCollection: false,
    });

    // await metaplex
    // .nfts()
    // .migrateToSizedCollection( {
    //   mintAddress: arrayOfNfts[0],
    //   size: toBigNumber(1)
    // })

    console.log(
      `(${
        i + 1
      }/${numberOfNfts}) Signature Explorer: https://explorer.solana.com/signuature/${
        response.signature
      }?cluster=${metaplex.connection}`
    );
    console.log("");

    arrayOfVerifications.push(response.signature);

    i++;
  }

  return arrayOfVerifications;
};
