import React, { FC, useEffect, useState } from "react";
import Style from "./Home.module.css";
import { AnchorProvider, BN, Idl, Program, web3 } from "@project-serum/anchor";
import { Connection, PublicKey } from "@solana/web3.js";

interface HomeProps {
  program: Program<Idl> | undefined;
  walletAddress: string;
  connection: Connection | null;
  anchorProvider: AnchorProvider | null;
}

interface User {
  userPubkey: string;
  username: string;
  age: number;
}

const Home: FC<HomeProps> = (props) => {
  const loadUserData = localStorage.getItem("userData")
    ? JSON.parse(localStorage.getItem("userData") ?? "null")
    : [];

  const { program, anchorProvider } = props;
  const [username, setUsername] = useState<string>("");
  const [userAge, setUserage] = useState<number>(1);
  const [userData, setUserData] = useState<User[]>(loadUserData);
  const payer = anchorProvider?.wallet.publicKey;
  const baseAccount = web3.Keypair.generate();

  const formValid = username === "";

  const handleCreateUser = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (program) {
      try {
        console.log("baseAccount : ", baseAccount.publicKey.toString());
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
        const user: User = {
          userPubkey: fetchUserData.userPubkey?.toString() as string,
          username: fetchUserData.username as string,
          age: fetchUserData.age as number,
        };

        setUserData([...userData, user]);
        setUsername("");
        setUserage(1);
      } catch (error) {
        console.log(error);
      }
    } else {
      alert("Program not found");
    }
  };

  const handleUpdateUser = async (
    e: React.MouseEvent<HTMLButtonElement>,
    publicKey: string
  ) => {
    e.preventDefault();
    if (program) {
      try {
        const publicKeyObj = new PublicKey(publicKey);
        console.log("update pubkey : ", publicKeyObj.toString());
        await program.methods
          .updateUser(username, new BN(userAge))
          .accounts({
            userData: publicKeyObj,
          })
          .rpc();

        const fetchUserData = await program.account.user.fetch(publicKeyObj);

        const updatedUser: User = {
          userPubkey: fetchUserData.userPubkey?.toString() as string,
          username: fetchUserData.username as string,
          age: fetchUserData.age as number,
        };
        const updatedData = userData.map((user) =>
          user.userPubkey === publicKey ? updatedUser : user
        );
        setUserData(updatedData);
        setUsername("");
        setUserage(1);
      } catch (error) {
        console.log(error);
      }
    } else {
      alert("Program not found");
    }
  };

  const handleDeleteUser = async (
    e: React.MouseEvent<HTMLButtonElement>,
    publicKey: string
  ) => {
    e.preventDefault();

    if (program) {
      try {
        const publicKeyObj = new PublicKey(publicKey);
        console.log("delete pubkey : ", publicKeyObj.toString());
        await program.methods
          .deleteUser()
          .accounts({
            userData: publicKeyObj,
            reciever: payer,
          })
          .rpc();

        const deletedData = userData.filter(
          (user) => user.userPubkey !== publicKey
        );
        setUserData(deletedData);
      } catch (error) {
        console.log(error);
        return false;
      }
    } else {
      alert("Program not found");
    }
  };

  useEffect(() => {
    localStorage.setItem("userData", JSON.stringify(userData));
  }, [userData]);

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
            onChange={(e) => {
              const userage = parseInt(e.target.value);
              setUserage(isNaN(userage) ? 1 : userage);
            }}
          />
          <button onClick={(e) => handleCreateUser(e)} disabled={formValid}>
            Submit
          </button>
        </form>

        <div>
          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>User Public Key</th>
                <th>User Name</th>
                <th>Age</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {userData.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item?.userPubkey}</td>
                    <td>{item?.username}</td>
                    <td>{item?.age}</td>
                    <td>
                      <div className={Style.btn_box}>
                        <button
                          onClick={(e) => handleUpdateUser(e, item?.userPubkey)}
                          disabled={formValid}
                        >
                          Update
                        </button>
                        <button
                          onClick={(e) => handleDeleteUser(e, item?.userPubkey)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Home;
