import React, { FC, useState } from "react";
import Style from "./Home.module.css";
import { useAppKitAccount } from "@reown/appkit/react";

import { AnchorProvider, BN, Idl, Program, web3 } from "@project-serum/anchor";
import { Connection, PublicKey } from "@solana/web3.js";

interface HomeProps {
  program: Program<Idl> | undefined;
  walletAddress: string;
  connection: Connection | null;
  anchorProvider: AnchorProvider | null;
}

interface User {
  userPubkey: PublicKey;
  username: string;
  age: number;
}

const Home: FC<HomeProps> = (props) => {
  const { program, connection, anchorProvider } = props;
  const { address } = useAppKitAccount();
  const [username, setUsername] = useState<string>();
  const [userAge, setUserage] = useState(1);
  const [userData, setUserData] = useState<User>();
  const payer = anchorProvider?.wallet.publicKey;
  const baseAccount = web3.Keypair.generate();

  const handleCreateUser = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!program) {
      throw "program is null";
    }

    try {
      await program.methods
        .createUser(baseAccount.publicKey, username, new BN(userAge))
        .accounts({
          userAccount: baseAccount.publicKey,
          user: payer,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([baseAccount])
        .rpc();

      const fetchUserData = await program.account.user.fetch(
        baseAccount.publicKey
      );
      // const user: User = {
      //   userPubkey: fetchUserData.userPubkey,
      //   username: fetchUserData.username,
      //   age: fetchUserData.age,
      // };
      // setUserData([...userData, user]);
      setUserData(fetchUserData as unknown as User);
      console.log("fetchUserData : ", fetchUserData);
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdateUser = async (
    e: React.MouseEvent<HTMLButtonElement>,
    publicKey: PublicKey
  ) => {
    e.preventDefault();
    console.log("update pubkey : ", publicKey);
    if (!program) {
      throw "program is null";
    }

    try {
      await program.methods
        .updateUser(username, new BN(userAge))
        .accounts({
          userData: publicKey,
        })
        .rpc();

      const fetchUserData = await program.account.user.fetch(publicKey);
      console.log("updated fetchUserData : ", fetchUserData);
      // const user: User = {
      //   userPubkey: fetchUserData.userPubkey,
      //   username: fetchUserData.username,
      //   age: fetchUserData.age,
      // };
      // setUserData([...userData, user]);
      setUserData(fetchUserData as unknown as User);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteUser = async (
    e: React.MouseEvent<HTMLButtonElement>,
    publicKey: PublicKey
  ) => {
    e.preventDefault();

    if (!program) {
      throw "program is null";
    }

    try {
      await program.methods
        .deleteUser()
        .accounts({
          userData: publicKey,
          reciever: payer,
        })
        .rpc();

      const fetchUserData = await program.account.user.fetch(publicKey);
      setUserData(userData);
      console.log("fetchUserData : ", fetchUserData.username);
    } catch (error) {
      console.log(error);
      return false;
    }
  };

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
              {userData ? (
                <tr>
                  <td>{userData?.userPubkey?.toString()}</td>
                  <td>{userData?.username}</td>
                  <td>{userData?.age}</td>
                  <td>
                    <div className={Style.btn_box}>
                      <button
                        onClick={(e) =>
                          handleUpdateUser(e, userData?.userPubkey)
                        }
                      >
                        Update
                      </button>
                      <button
                        onClick={(e) =>
                          handleDeleteUser(e, userData?.userPubkey)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                ""
              )}

              {/* {userData.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>{item.userPubkey?.toString()}</td>
                    <td>{item.username}</td>
                    <td>{item.age}</td>
                    <td>
                      <div className={Style.btn_box}>
                        <button
                          onClick={(e) => handleUpdateUser(e, item.userPubkey)}
                        >
                          Update
                        </button>
                        <button
                          onClick={(e) => handleDeleteUser(e, item.userPubkey)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })} */}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Home;
