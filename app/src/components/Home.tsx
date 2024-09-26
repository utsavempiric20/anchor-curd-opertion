import React, { useState } from "react";
import Style from "./Home.module.css";
import { useAppKitAccount } from "@reown/appkit/react";
import { AnchorProvider } from "@coral-xyz/anchor";
import idl from "../utils/idl.json";
import { Program, web3 } from "@project-serum/anchor";

interface HomeProps {
  getProvider: () => AnchorProvider | null;
}

const Home: React.FC<HomeProps> = (props) => {
  const { getProvider } = props;
  const { address } = useAppKitAccount();
  const [username, setUsername] = useState("");
  const [userAge, setUserage] = useState(1);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const provider = getProvider();
    const baseAccount = web3.Keypair.generate();
    if (!provider) {
      throw "provider is null";
    }
    const a = JSON.stringify(idl);
    const b = JSON.parse(a);
    const program = new Program(b, idl.address, provider);
    try {
      await program.methods
        .create_user(baseAccount.publicKey, username, userAge)
        .accounts({
          user_account: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          system_program: web3.SystemProgram.programId,
        })
        .signers([baseAccount])
        .rpc();

      const fetchUserData = await program.account.user.fetch(
        baseAccount.publicKey
      );
      console.log("fetchUserData : ", fetchUserData);
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdateUser = () => {};

  const handleDeleteUser = () => {};
  return (
    <>
      <div className={Style.form_main_box}>
        <form className={Style.form_box}>
          <input
            type="text"
            name="username"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="number"
            name="userage"
            placeholder="Enter Age"
            min="1"
            value={userAge}
            onChange={(e) => setUserage(parseInt(e.target.value))}
          />
          <button onClick={(e) => handleCreateUser(e)}>Submit</button>
        </form>

        <div>
          <table>
            <thead>
              <tr>
                <th>User Public Key</th>
                <th>User Name</th>
                <th>Age</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>{address}</td>
                <td>emp</td>
                <td>19</td>
                <td>
                  <div className={Style.btn_box}>
                    <button onClick={handleUpdateUser}>Update</button>
                    <button onClick={handleDeleteUser}>Delete</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Home;
