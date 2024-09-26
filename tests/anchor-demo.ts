import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorDemo } from "../target/types/anchor_demo";
import { assert } from "chai";

describe("anchor-demo", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AnchorDemo as Program<AnchorDemo>;
  let userAccount = new anchor.web3.Keypair();
  it("create user!", async () => {
    const tx = await program.methods
      .createUser(userAccount.publicKey, "utsavemp", 19)
      .accounts({
        userAccount: userAccount.publicKey,
        user: provider.wallet.publicKey,
      })
      .signers([userAccount])
      .rpc();
    console.log("Transaction signature", tx);
  });

  it("fetch user data!", async () => {
    const fetchData = await program.account.user.fetch(userAccount.publicKey);
    console.log("User PublicKey : ", fetchData.userPubkey.toString());
    console.log("User Name : ", fetchData.username);
    console.log("User Age : ", fetchData.age);
  });

  it("update user data!", async () => {
    const updated_userdata = await program.methods
      .updateUser("anmol", 25)
      .accounts({ userData: userAccount.publicKey })
      .rpc();
    console.log("updated_userdata : ", updated_userdata);
  });

  it("fetch updated user data!", async () => {
    const fetchData = await program.account.user.fetch(userAccount.publicKey);
    console.log("updated User PublicKey : ", fetchData.userPubkey.toString());
    console.log("updated User Name : ", fetchData.username);
    console.log("updated User Age : ", fetchData.age);
  });

  it("delete user data!", async () => {
    const updated_userdata = await program.methods
      .deleteUser()
      .accounts({
        userData: userAccount.publicKey,
        reciever: provider.wallet.publicKey,
      })
      .rpc();
    console.log("updated_userdata : ", updated_userdata);
  });

  it("fetch deleted user data!", async () => {
    await program.account.user
      .fetch(userAccount.publicKey)
      .then((data) => console.log(data))
      .catch((err) => console.log(err));
  });
});
