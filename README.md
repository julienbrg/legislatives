# Legislatives

[![Netlify Status](https://api.netlify.com/api/v1/badges/f0a26e1d-a18a-432d-9d1f-e8552413ef02/deploy-status)](https://app.netlify.com/sites/legislatives/deploys)

Ask anything about the French legislatives elections (30 June and 7 July 2024) to an AI assistant named Fatou.

Web app live at [https://legislatives.fun](https://legislatives.fun).

### Note on Governance

We integrated with [Gov](https://github.com/w3hc/gov) (a on-chain voting system) to allow a pool of journalists and academics to validate any adding in the `/sources` directory. We use [Tally](https://www.tally.xyz/gov/verifiers-dao) as a voting interface. The members of the DAO will vote on a given CID (IPFS hash) so that everyone can verify that ChatGPT bases its answers on the right corpus of documents.

- Voting page: https://www.tally.xyz/gov/verifiers-dao
- DAO contract address: [0xE3a0661903a2bf1b87DDc3DA98a24D4275D5B703](https://sepolia.etherscan.io/address/0xE3a0661903a2bf1b87DDc3DA98a24D4275D5B703#code)

## Sources

All sources (pdf files) are located in the [`sources`](https://github.com/julienbrg/legislatives/tree/main/public) directory.

## Install

```bash
pnpm i
```

## Run

Create a `.env` file:

```
cp .env.example .env
```

Add your own keys in the `.env` file (you can get it in your [Wallet Connect dashboard](https://cloud.walletconnect.com)), then:

```bash
pnpm dev
```

## Add a document in the sources

- Create a new branch
- Add a pdf file into the `public/sources` folder
- Run `pnnpm write`
- Commit, push and merge

## Roadmap

- **Paywall**: Stripe will be integrated so that users can pay as they use the app: they would login with their email, then pay in fiat, then a Solidity contract (deployed to Optimism) will be credidted, then debited at each question asked. The users will also be able to withdraw from the contract the unspent funds.

## Versions

- pnpm v8.7.5
- node v20.9.0

## Support

You can contact me via [Element](https://matrix.to/#/@julienbrg:matrix.org), [Farcaster](https://warpcast.com/julien-), [Telegram](https://t.me/julienbrg), [Twitter](https://twitter.com/julienbrg), [Discord](https://discordapp.com/users/julienbrg), or [LinkedIn](https://www.linkedin.com/in/julienberanger/).
