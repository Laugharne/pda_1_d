import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Pda1D } from "../target/types/pda_1_d";


// this airdrops sol to an address
async function airdropSol(publicKey, amount) {
  let airdropTx = await anchor.getProvider().connection.requestAirdrop(publicKey, amount * anchor.web3.LAMPORTS_PER_SOL);
  await confirmTransaction(airdropTx);
}

async function confirmTransaction(tx) {
  const latestBlockHash = await anchor.getProvider().connection.getLatestBlockhash();
  await anchor.getProvider().connection.confirmTransaction({
    blockhash           : latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature           : tx,
  });
}

describe("pda_1_d", () => {

  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const providerWallet = provider.wallet;
  const program        = anchor.workspace.Pda1D as Program<Pda1D>;
  const accountMain    = anchor.web3.Keypair.generate();

  const NN_PDA = 3;

  it("Is initialized!", async () => {

    const tx = await program.methods.initialize()
    .accounts({
      main         : accountMain.publicKey,
      signer       : providerWallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).signers(
      [accountMain]
    ).rpc();

    console.log("https://solana.fm/tx/"+tx);
    console.log("");

  });


  it("Create PDA and check post-creation", async () => {
    let pda;
    let tx;

    for(let i = 0; i < NN_PDA; i++) {
      pda    = await getPda1dFromIndex( program, "1D", i);
      tx     = await program.methods.pdaCreate()
      .accounts({
          pda          : pda.pubkey,
          main         : accountMain.publicKey,
          signer       : providerWallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        }).rpc();

        console.log("      "+ pda.pubkey);
        console.log("("+i+") : https://solana.fm/tx/"+tx);
      }
      console.log("");

      let main = await program.account.main.all();
      console.log("Main ");  console.log(main);
      console.log("");

      let pda1dAll = await program.account.pda.all();
      console.log("PDA (1D) ");  console.log(pda1dAll);
      console.log("");
    
  });


  it("PDA accounts fetch by index", async () => {
    let pda;
    let pdaAccount;

    for(let i = 0; i < NN_PDA; i++) {
      pda        = await getPda1dFromIndex( program, "1D", i);
      pdaAccount = await program.account.pda.fetch(pda.pubkey);
      console.log("    ("+ i +") "+ pda.pubkey);
      console.log("    pda.index  :", pdaAccount.index);
      console.log("");
    }
  });


  it("PDA access : pda_access()", async () => {
    let pda;
    let pdaAccount;
    let tx;


    for(let i = 0; i < NN_PDA; i++) {
      pda = await getPda1dFromIndex( program, "1D", i);
      tx  = await program.methods.pdaAccess()
      .accounts({
          pda          : pda.pubkey,
          signer       : providerWallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        }).rpc();

        console.log("      "+ pda.pubkey);
        console.log("("+i+") : https://solana.fm/tx/"+tx);

      console.log("");
    }
  });


  it("PDA access : pda_access_by_index()", async () => {
    let pda;
    let pdaAccount;
    let tx;


    for(let i = 0; i < NN_PDA; i++) {
      pda = await getPda1dFromIndex( program, "1D", i);
      tx  = await program.methods.pdaAccessByIndex(i)
      .accounts({
          pda          : pda.pubkey,
          signer       : providerWallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        }).rpc();

        console.log("      "+ pda.pubkey);
        console.log("("+i+") : https://solana.fm/tx/"+tx);

      console.log("");
    }
  });


});

async function getPda1dFromIndex(
    program: anchor.Program<Pda1D>,
    tag    : String,
    index  : number
  ) {

  // get data account from the main wallet...
  const indexBuffer = Buffer.allocUnsafe(2);
  indexBuffer.writeUInt16LE(index, 0);

  // Calculer l'adresse du PDA
  const [pdaPubkey, bump] = await anchor.web3.PublicKey.findProgramAddress(
    [
      Buffer.from(tag),
      indexBuffer,
    ],
    program.programId
  );

  let pda = {
    pubkey: pdaPubkey,
    bump  : bump,
  };

  return pda;

}