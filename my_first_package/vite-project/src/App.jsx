import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { ConnectButton } from '@mysten/dapp-kit';
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';
import { useSignAndExecuteTransactionBlock } from '@mysten/dapp-kit';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { MYMODULE_PACKAGE_ID } from './constant';
// 0x8a4eb30d6feba12630fdaf01f269fb6265b7805b5c5050e0050360fbc03b4f34

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
        <header className="App-header">
            <ConnectButton />
        </header>
        <button
                onClick={() => {
                    create();
                }}
            >
                Create Sword
            </button>
        <ConnectedAccount />
    </div>
);
}

function ConnectedAccount() {
  const account = useCurrentAccount();

  if (!account) {
      return null;
  }

  return (
      <div>
          <div>Connected to {account.address}</div>;
          <OwnedObjects address={account.address} />
      </div>
  );
}

function OwnedObjects({ address }) {
  const { data } = useSuiClientQuery('getOwnedObjects', {
      owner: address,
  });
  if (!data) {
      return null;
  }

  return (
      <ul>
          {data.data.map((object) => (
              <li key={object.data?.objectId}>
                  <a href={`https://suiexplorer.com/object/${object.data?.objectId}`}>
                      {object.data?.objectId}
                  </a>
              </li>
          ))}
      </ul>
  );
}

function create() {
  const txb = new TransactionBlock();
  txb.moveCall({
      arguments: [
        txb.object(),
        txb.object(),
        txb.object()
    ],
      target: `${MYMODULE_PACKAGE_ID}::my_module::sword_create`,
  });

  signAndExecute(
      {
          transactionBlock: txb,
          options: {
              showEffects: true,
          },
      },
      {
          onSuccess: (tx) => {
              suiClient
                  .waitForTransactionBlock({
                      digest: tx.digest,
                  })
                  .then(() => {
                      const objectId = tx.effects?.created?.[0]?.reference?.objectId;
                      if (objectId) {
                          props.onCreated(objectId);
                      }
                  });
          },
      },
  );
}



export default App
