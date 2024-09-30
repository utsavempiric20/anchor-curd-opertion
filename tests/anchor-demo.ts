import * as anchor from "@project-serum/anchor";

describe("anchor-demo", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AnchorDemo;
  let userAccount = new anchor.web3.Keypair();
  console.log("userAccount : ", userAccount.publicKey);

  it("create user!", async () => {
    const tx = await program.methods
      .createUser(userAccount.publicKey, "utsavemp", new anchor.BN(19))
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
      .updateUser("anmol", new anchor.BN(25))
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
      .then((data: any) => console.log(data))
      .catch((err: any) =>
        console.log("User Account was deleted,No data found")
      );
  });
});
