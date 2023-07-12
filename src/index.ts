import { initializeKeypair } from "./initializeKeypair";
import * as web3 from "@solana/web3.js";
import {
  addAndVerifyCollection,
  createCollection,
  createMultipleNfts,
} from "./utils";
import {
  Metaplex,
  bundlrStorage,
  keypairIdentity,
} from "@metaplex-foundation/js";

const main = async () => {
  const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
  const user = await initializeKeypair(connection);

  console.log("PublicKey:", user.publicKey.toBase58());

  // 1) Create an instance of Metaplex
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(user))
    .use(
      bundlrStorage({
        address: "https://devnet.bundlr.network",
        providerUrl: "https://api.devnet.solana.com",
        timeout: 60000,
      })
    );

  // 2) Create collection NFT
  console.log(`\n***NEXT PROCESS - CREATING COLLECTION ... \n`);
  const collectionKey = await createCollection(metaplex, "assets");

  // 3) Create all NFTs
  console.log(`\n***NEXT PROCESS - CREATING NFT(s) ... \n`);
  const nftArray = await createMultipleNfts(metaplex, "assets");
  console.log(`***RESULT - NUMBER OF NFT(S) CREATED: ${nftArray.length} \n`);

  console.log(
    `\n***NEXT PROCESS - ADDING AND VERIFYING COLLECTION ${collectionKey} TO NFT(S) ... \n`
  );

  // 4) Add and verify NFT to collection
  const arrayOfVerifications = await addAndVerifyCollection(
    metaplex,
    collectionKey,
    nftArray
  );
  console.log(
    `***RESULT - NUMBER OF NFT(S) ADDED AND VERIFIED TO COLLECTION: ${arrayOfVerifications.length} \n`
  );
};

main()
  .then(() => {
    console.log("Finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
