# Legislatives

Ask anything about the French legislatives elections (30 June and 7 July 2024) to an AI assistant named Fatou.

Web app live at [https://legislatives.fun](https://legislatives.fun).

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

## Versions

- pnpm v8.7.5
- node v20.9.0

## Support

You can contact me via [Element](https://matrix.to/#/@julienbrg:matrix.org), [Farcaster](https://warpcast.com/julien-), [Telegram](https://t.me/julienbrg), [Twitter](https://twitter.com/julienbrg), [Discord](https://discordapp.com/users/julienbrg), or [LinkedIn](https://www.linkedin.com/in/julienberanger/).
