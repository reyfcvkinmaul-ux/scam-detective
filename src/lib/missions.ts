// Mission data — static for Phase 2 (5 cases playable)
// Phase 3 will move authoring to Supabase admin panel.

export type RedFlag = {
  id: string;
  label: string;
  text: string;
  explanation: string;
};

export type EvidenceTab = {
  id: string;
  label: string;
  icon: "twitter" | "globe" | "wallet" | "receipt" | "message" | "gavel";
  body: string;
  caption?: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type Verdict = "safe" | "dangerous";

export type Mission = {
  slug: string;
  title: string;
  category: "Fake Airdrop" | "Seed Phrase Phishing" | "Rugpull Token" | "Fake Customer Support" | "Malicious Approval";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estMinutes: number;
  xp: number;
  badge: {
    name: string;
    description: string;
    rarity: "Common" | "Rare" | "Epic" | "Legendary";
    emoji: string;
  };
  summary: string;
  briefing: string;
  evidence: EvidenceTab[];
  redFlags: RedFlag[];
  quiz: QuizQuestion[];
  correctVerdict: Verdict;
  available: boolean;
};

const FREE_AIRDROP_ALERT: Mission = {
  slug: "free-airdrop-alert",
  title: "Free Airdrop Alert",
  category: "Fake Airdrop",
  difficulty: "Beginner",
  estMinutes: 4,
  xp: 120,
  badge: {
    name: "Phishing Survivor",
    description: "Survived a fake airdrop bait without losing funds.",
    rarity: "Rare",
    emoji: "🛡️",
  },
  summary:
    "A 'free' airdrop from what looks like a major project is making the rounds. Your job: verify the claim, inspect the website, scrutinize the wallet popup, and decide whether to approve.",
  briefing:
    "Case #001 — A user forwarded you a viral tweet promising a 5,000 USDC airdrop. They almost clicked. You have 4 minutes to investigate before the user makes a decision. Examine every tab. Tag every red flag. Then deliver a verdict.",
  evidence: [
    {
      id: "social",
      label: "Social Post",
      icon: "twitter",
      caption: "Viral tweet, 12,400 retweets in 2 hours",
      body:
        "@Uniswap_Airdrop_Official  ·  2h\n" +
        "🚨 LAST 24 HOURS! Claim your 5,000 USDC airdrop before the pool closes forever!\n" +
        "Only verified wallets eligible. Don't miss out — the team is rewarding early supporters!\n" +
        "👉 Claim now: uniswap-airdrop-claim[.]net\n" +
        "12.4K retweets   3.2K replies   ✓ verified",
    },
    {
      id: "website",
      label: "Website",
      icon: "globe",
      caption: "Domain registered 4 days ago, no HTTPS certificate match",
      body:
        "URL: https://uniswap-airdrop-claim.net/eligibility\n\n" +
        "[ The page shows the Uniswap unicorn logo and the headline ]\n" +
        '"Congratulations! Your wallet qualifies for the OFFICIAL UNI Airdrop Round 7."\n\n' +
        "Eligibility check: PASSED ✓\n" +
        "Estimated reward: 5,000 USDC\n" +
        "Time remaining: 00:23:14\n\n" +
        "[ CONNECT WALLET TO CLAIM ] button is the only interactive element.\n" +
        "Footer: 'Powered by Uniswap Labs Inc.' — but no link to uniswap.org anywhere.",
    },
    {
      id: "wallet",
      label: "Wallet Prompt",
      icon: "wallet",
      caption: "MetaMask popup that appears after clicking Claim",
      body:
        "MetaMask Notification — Spending Cap Request\n\n" +
        "Site: uniswap-airdrop-claim.net\n" +
        "Function: approve(spender, amount)\n\n" +
        "Spender: 0x9F4c... (unverified contract)\n" +
        "Token: USDC\n" +
        "Spending cap: UNLIMITED (max uint256)\n\n" +
        "By approving, the spender can transfer ANY amount of this token from your wallet, at any time, until you manually revoke.\n\n" +
        "[ Reject ]    [ Approve ]",
    },
    {
      id: "transaction",
      label: "Transaction",
      icon: "receipt",
      caption: "What the approval actually does on-chain",
      body:
        "Transaction preview (decoded):\n" +
        "  to:        USDC contract (0xA0b8...c2)\n" +
        "  method:    approve(address,uint256)\n" +
        "  spender:   0x9F4c8aB...e21F  ← unverified, deployed 3 days ago\n" +
        "  amount:    115792089237316195423570985008687907853269984665640564039457584007913129639935\n" +
        "             ( = 2^256-1, 'unlimited' )\n\n" +
        "Effect if signed: the spender can drain ALL of your USDC, now and any time in the future, without further approval.\n" +
        "Estimated gas: 0.0009 ETH (network fee, paid by you regardless of outcome)",
    },
    {
      id: "message",
      label: "DM From 'Support'",
      icon: "message",
      caption: "Discord DM received 30s after connecting wallet",
      body:
        "From: Uniswap Support 🛡️ (Mod) — sent you a friend request\n\n" +
        "Hey! I'm from the Uniswap team. I see you're trying to claim the airdrop.\n" +
        "If the claim is failing, please share your seed phrase here so we can manually credit the 5,000 USDC to your wallet.\n" +
        "We will NEVER ask for your private key, only your 12-word seed phrase for verification.\n" +
        "This is a one-time process. The airdrop closes in 22 minutes.",
    },
  ],
  redFlags: [
    { id: "rf-urgency", label: "Urgency", text: "LAST 24 HOURS", explanation: "Real airdrops don't pressure you. Countdown timers and 'last X hours' messaging are designed to bypass your judgment." },
    { id: "rf-fakehandle", label: "Lookalike handle", text: "@Uniswap_Airdrop_Official", explanation: "Real Uniswap is @Uniswap. Variations with 'airdrop', 'official', '_official' are the #1 phishing pattern on X." },
    { id: "rf-domain", label: "Suspicious domain", text: "uniswap-airdrop-claim[.]net", explanation: "Uniswap's only official domain is uniswap.org. Hyphenated subdomains and .net/.io variants are red flags." },
    { id: "rf-newdomain", label: "Domain age", text: "Domain registered 4 days ago", explanation: "Legit projects don't launch 'official' airdrops on a 4-day-old domain. WHOIS lookup before clicking always." },
    { id: "rf-unlimited", label: "Unlimited approval", text: "UNLIMITED (max uint256)", explanation: "An airdrop CLAIM should never require token approval — you're receiving tokens, not sending them. Unlimited approval = drain risk." },
    { id: "rf-unverified", label: "Unverified contract", text: "unverified contract", explanation: "If a contract isn't verified on Etherscan, you can't read what it does. Combined with unlimited approval, this is a textbook drainer." },
    { id: "rf-seed", label: "Seed phrase request", text: "share your seed phrase", explanation: "NO legitimate team will EVER ask for your seed phrase. Not for verification, not for support, not ever. This alone is conclusive." },
    { id: "rf-dm", label: "Unsolicited DM", text: "sent you a friend request", explanation: "Real support never DMs first. Discord/Telegram DMs offering help right after a wallet action are scammers monitoring on-chain activity." },
  ],
  quiz: [
    { id: "q1", prompt: "What does 'approve unlimited spending cap' actually let the spender do?", options: ["Send you the airdrop tokens automatically", "Transfer any amount of that token from your wallet at any time, until revoked", "Verify your wallet is eligible without moving funds", "Pay the gas fee on your behalf"], correctIndex: 1, explanation: "Token approval gives the spender contract permission to move YOUR tokens. 'Unlimited' = they can drain everything, now or later." },
    { id: "q2", prompt: "A 'support' account DMs you asking for your seed phrase to credit the airdrop. What do you do?", options: ["Send only the first 6 words to be safe", "Verify their identity in the official server first, then send", "Never send — no legitimate team ever asks for a seed phrase", "Send a screenshot instead of typing it"], correctIndex: 2, explanation: "Seed phrase = full wallet ownership. Anyone asking, for any reason, is a scammer. Period." },
    { id: "q3", prompt: "How would you verify if Uniswap actually launched a new airdrop?", options: ["Click the link in the viral tweet — it has a verified checkmark", "Check uniswap.org and the official @Uniswap account, then cross-reference with a major crypto news outlet", "Connect your wallet to the site and see if it says 'eligible'", "Trust the urgency timer, real airdrops do close"], correctIndex: 1, explanation: "Always verify announcements at the source domain (uniswap.org) and the canonical handle (@Uniswap, no suffix). Cross-check news." },
  ],
  correctVerdict: "dangerous",
  available: true,
};

const SEED_PHRASE_PHISHING: Mission = {
  slug: "seed-phrase-phishing",
  title: "The 'Wallet Sync' Trap",
  category: "Seed Phrase Phishing",
  difficulty: "Beginner",
  estMinutes: 4,
  xp: 130,
  badge: { name: "Vault Keeper", description: "Refused to expose your seed phrase under social pressure.", rarity: "Rare", emoji: "🔐" },
  summary: "A pop-up claims your wallet is 'out of sync' and needs re-validation. Decide what's real and what's a trap.",
  briefing: "Case #002 — A friend sent you a screenshot. Their MetaMask shows a banner saying 'WALLET DESYNC DETECTED'. Clicking it opens a verification page asking for the 12-word recovery phrase. They're about to type it in. Stop them — but only if the threat is real.",
  evidence: [
    {
      id: "popup",
      label: "Browser Pop-up",
      icon: "globe",
      caption: "Appeared while browsing on a sketchy NFT marketplace",
      body:
        "[ Pop-up window — looks like MetaMask styling ]\n\n" +
        "⚠️ WALLET DESYNC DETECTED\n\n" +
        "Your MetaMask wallet has lost sync with the blockchain.\n" +
        "Funds may be temporarily inaccessible.\n\n" +
        "To restore access, please re-validate your wallet.\n\n" +
        "[ Validate wallet now ]\n\n" +
        "Powered by MetaMask Security · v8.2.1",
    },
    {
      id: "website",
      label: "Validation Page",
      icon: "globe",
      caption: "URL after clicking 'Validate wallet now'",
      body:
        "URL: https://metamask-validate.support-help.com/restore\n\n" +
        "Page header: 'MetaMask Wallet Validation'\n" +
        "Logo: official MetaMask fox (copied from press kit)\n\n" +
        "'To re-sync your wallet with the network, please enter your 12 or 24 word Secret Recovery Phrase below.'\n\n" +
        "[ word 1 ] [ word 2 ] [ word 3 ] [ word 4 ]\n" +
        "[ word 5 ] [ word 6 ] [ word 7 ] [ word 8 ]\n" +
        "[ word 9 ] [ word 10 ] [ word 11 ] [ word 12 ]\n\n" +
        "🔒 'This data is encrypted and used only for validation. We never store your phrase.'\n\n" +
        "[ Validate ]",
    },
    {
      id: "real",
      label: "Real MetaMask Behavior",
      icon: "wallet",
      caption: "What MetaMask actually does — for comparison",
      body:
        "Genuine MetaMask never:\n" +
        "  • Asks for your Secret Recovery Phrase via a website\n" +
        "  • Asks for it inside the extension UI either, after initial setup\n" +
        "  • Pops up a 'desync' warning that needs a recovery phrase\n" +
        "  • Communicates from any domain other than metamask.io\n\n" +
        "If MetaMask needs to recover or sync, the only flow is:\n" +
        "  1. You click 'Restore wallet' inside the extension manually\n" +
        "  2. Recovery phrase entered LOCALLY in the extension UI\n" +
        "  3. No website is ever involved\n\n" +
        "Source: support.metamask.io — 'Never share your Secret Recovery Phrase'",
    },
    {
      id: "domain",
      label: "Domain Lookup",
      icon: "receipt",
      caption: "WHOIS data for the validation page",
      body:
        "Domain:        metamask-validate.support-help.com\n" +
        "Registered:    11 days ago\n" +
        "Registrar:     low-cost privacy-shielded registrar\n" +
        "Owner:         REDACTED FOR PRIVACY\n" +
        "SSL cert:      Let's Encrypt (issued 11 days ago)\n" +
        "Mentioned in:  PhishFort threat feed (flagged 3 days ago)\n\n" +
        "Real MetaMask domains: metamask.io, metamask.zendesk.com, support.metamask.io\n" +
        "There is no 'support-help.com' subdomain or partner.",
    },
  ],
  redFlags: [
    { id: "rf-desync", label: "Fake desync warning", text: "WALLET DESYNC DETECTED", explanation: "There is no such concept as a wallet 'desyncing' that requires you to re-enter a seed phrase. This terminology is invented by phishers." },
    { id: "rf-validate", label: "Asks for recovery phrase", text: "Secret Recovery Phrase below", explanation: "The recovery phrase IS your wallet. Any UI asking you to type it on a website is harvesting it. Game over the moment you submit." },
    { id: "rf-domain2", label: "Lookalike domain", text: "metamask-validate.support-help.com", explanation: "Real MetaMask = metamask.io. Hyphenated subdomains on third-party hosts are scams every time." },
    { id: "rf-newdomain2", label: "Fresh domain", text: "Registered:    11 days ago", explanation: "Domains used by attackers are usually under a month old — they get reported and replaced fast." },
    { id: "rf-encryption-claim", label: "False encryption promise", text: "encrypted and used only for validation", explanation: "Reassurance language ('we never store') is a tell. A legit flow wouldn't need to reassure because it wouldn't ask in the first place." },
    { id: "rf-popup-source", label: "Pop-up not from extension", text: "Powered by MetaMask Security", explanation: "Browser pop-ups can be styled to look like extension UI. Real MetaMask UI is inside the extension chrome — not a webpage modal." },
    { id: "rf-flagged", label: "Listed in threat feed", text: "PhishFort threat feed (flagged 3 days ago)", explanation: "This is the smoking gun. The domain is publicly known as a phishing site." },
  ],
  quiz: [
    { id: "q1", prompt: "When does MetaMask legitimately require you to enter your Secret Recovery Phrase?", options: ["When the wallet 'desyncs' and shows a warning banner", "When you initially restore the wallet in the extension on a new device — and only inside the extension UI", "When a verified support agent asks during a help session", "When the dApp you're using requests it for verification"], correctIndex: 1, explanation: "Recovery phrase entry only happens inside the MetaMask extension itself, during initial setup or restore — never on a website." },
    { id: "q2", prompt: "A pop-up styled like MetaMask says funds are inaccessible until you 'validate'. What's the right next step?", options: ["Validate quickly to recover access", "Close the page, open MetaMask directly, and check your wallet there", "Enter only the first 6 words to test if it's real", "Disconnect Wi-Fi to be safe, then validate"], correctIndex: 1, explanation: "When in doubt, leave the page and check the actual extension. Anything legitimate will reflect there. Anything that requires a website is fake." },
    { id: "q3", prompt: "What's the strongest single red flag confirming this is phishing?", options: ["The domain ends in .com instead of .io", "The website asks you to type your 12-word recovery phrase", "The page says 'encrypted'", "The pop-up uses MetaMask's color scheme"], correctIndex: 1, explanation: "Asking for the seed phrase on a webpage is conclusive. No legitimate flow ever does this." },
  ],
  correctVerdict: "dangerous",
  available: true,
};

const RUGPULL_TOKEN: Mission = {
  slug: "rugpull-token-analysis",
  title: "MoonPump Premium",
  category: "Rugpull Token",
  difficulty: "Intermediate",
  estMinutes: 6,
  xp: 220,
  badge: { name: "Liquidity Watcher", description: "Read the contract before aping in. Spotted the rug pin.", rarity: "Epic", emoji: "🪤" },
  summary: "A token is up 4,000% in 3 days. Telegram is hyped. Your job: read the contract and decide if this is a rug.",
  briefing: "Case #003 — Friend says: 'Bro, MOONP is going to 100x. Just buy.' You have the contract address, the chart, the holders list, and the dev's pinned message. Examine every tab. Find the trap before you find out the hard way.",
  evidence: [
    {
      id: "chart",
      label: "Price Chart",
      icon: "receipt",
      caption: "MOONP/WETH on PumpDex — last 72 hours",
      body:
        "MOONP — MoonPump Premium\n" +
        "Network: Base\n" +
        "Pair: MOONP / WETH on PumpDex\n\n" +
        "  Price 72h ago:   $0.0000041\n" +
        "  Price now:       $0.000167\n" +
        "  Change:          +4,073% 📈\n" +
        "  Market cap:      $2.1M\n" +
        "  24h volume:      $1.8M\n" +
        "  Liquidity:       $42,000 (single pool)\n" +
        "  Holders:         312\n\n" +
        "Buy tax: 5%   Sell tax: 30%   ← reported by token scanner",
    },
    {
      id: "contract",
      label: "Contract Code",
      icon: "globe",
      caption: "Verified contract source on Basescan",
      body:
        "Contract: 0xCAFE...BABE  (verified ✓)\n" +
        "Compiler: 0.8.20\n\n" +
        "function _transfer(address from, address to, uint256 amount) internal {\n" +
        "    // ... standard ERC20 logic ...\n\n" +
        "    if (to == _pair && from != owner()) {\n" +
        "        require(!_blacklisted[from], \"address restricted\");\n" +
        "        uint256 fee = (amount * sellTax) / 100;\n" +
        "        // sellTax is currently 30, but is mutable\n" +
        "    }\n\n" +
        "    if (tradingPaused) {\n" +
        "        require(from == owner() || to == owner(), \"trading paused\");\n" +
        "    }\n" +
        "}\n\n" +
        "// Owner-only functions:\n" +
        "function setSellTax(uint256 newTax) external onlyOwner { sellTax = newTax; }\n" +
        "function setBlacklist(address a, bool v) external onlyOwner { _blacklisted[a] = v; }\n" +
        "function pauseTrading(bool v) external onlyOwner { tradingPaused = v; }\n" +
        "function withdrawLP() external onlyOwner { /* pulls liquidity */ }",
    },
    {
      id: "holders",
      label: "Top Holders",
      icon: "wallet",
      caption: "Holder distribution from Basescan",
      body:
        "Rank   Address                      % Supply   Notes\n" +
        "----   --------------------------   --------   --------------------------------\n" +
        " 1     0xDEAD...001 (Deployer)        62.4%    Single wallet, no vesting\n" +
        " 2     0xBEEF...A12                    7.8%    Funded from #1 yesterday\n" +
        " 3     0xC0DE...777                    6.1%    Funded from #1 yesterday\n" +
        " 4     0xFADE...3C1                    4.3%    Funded from #1 yesterday\n" +
        " 5     PumpDex LP                      3.9%    Liquidity pool\n" +
        " 6-10  Various                         2-3%    Wallets created < 5 days ago\n\n" +
        "Top 1 wallet controls 62.4% of supply.\n" +
        "Wallets 2-4 are direct funded children of the deployer (likely same person).\n" +
        "Together: 4 wallets control 80.6% of supply.\n\n" +
        "LP tokens: NOT locked. NOT burned. Held by deployer (0xDEAD...001).",
    },
    {
      id: "dev",
      label: "Dev's Telegram",
      icon: "message",
      caption: "Pinned message in MoonPump official Telegram (anonymous dev)",
      body:
        "📌 Pinned by 'MoonPump Dev'  (admin, no display photo)\n\n" +
        "GM legends! 🚀\n\n" +
        "$MOONP is going parabolic. We are SAFU. Liquidity is renounced (soon).\n" +
        "Audit will come once we hit $10M MC. Trust the team — we are doxxed (private only).\n\n" +
        "If sell tax feels high, that's because we are protecting the chart from paperhands.\n" +
        "We will lower tax once stable. Don't sell. Diamond hands.\n\n" +
        "Buy now or stay poor. 💎🙌\n\n" +
        "(replies disabled)",
    },
    {
      id: "scanner",
      label: "Token Scanner Report",
      icon: "receipt",
      caption: "GoPlus / TokenSniffer combined output",
      body:
        "Honeypot status:        Not currently a honeypot — but trading can be paused\n" +
        "Mutable sell tax:       YES — owner can raise to 99%\n" +
        "Blacklist function:     YES — owner can block any address from selling\n" +
        "Trading pause:          YES — owner can pause all trading\n" +
        "Hidden mint:            NO\n" +
        "LP locked:              NO\n" +
        "LP burned:              NO\n" +
        "Owner renounced:        NO\n" +
        "Top holder concentration: 62.4% (very high)\n" +
        "Contract age:           3 days\n\n" +
        "Verdict: HIGH RISK — multiple owner-controlled rug vectors.",
    },
  ],
  redFlags: [
    { id: "rf-pump", label: "Suspicious pump", text: "+4,073%", explanation: "4,000% in 72 hours on a 3-day-old token with $42k liquidity is the textbook pump-and-dump shape." },
    { id: "rf-thinliq", label: "Thin liquidity", text: "Liquidity:       $42,000", explanation: "$42k LP against $2.1M market cap means the deployer can drain the pool with one transaction. Tiny liquidity = exit risk." },
    { id: "rf-selltax", label: "Punitive sell tax", text: "Sell tax: 30%", explanation: "30% sell tax means you lose nearly a third the moment you exit. Real projects have low or no taxes." },
    { id: "rf-mutable", label: "Mutable tax", text: "setSellTax(uint256 newTax)", explanation: "Owner can change the sell tax to anything — including 99% — at any moment, locking holders in." },
    { id: "rf-blacklist", label: "Blacklist function", text: "setBlacklist(address a, bool v)", explanation: "Owner can block specific wallets from selling. Targeted rug — they let you buy, then blacklist you." },
    { id: "rf-pause", label: "Trading pause switch", text: "pauseTrading(bool v)", explanation: "Owner can freeze all trading except for themselves. Soft rug primer." },
    { id: "rf-pulllp", label: "LP withdraw function", text: "function withdrawLP()", explanation: "Owner-only function to pull liquidity. Combined with unlocked LP, this is a one-click rug." },
    { id: "rf-concentration", label: "Holder concentration", text: "62.4%", explanation: "Single wallet holding 62% of supply means one address can dump everything and tank the price instantly." },
    { id: "rf-lpunlocked", label: "LP not locked", text: "LP tokens: NOT locked. NOT burned.", explanation: "If LP isn't locked or burned, the deployer can pull it and walk away. This is THE rug pull." },
    { id: "rf-ownerctrl", label: "Owner not renounced", text: "Owner renounced:        NO", explanation: "Renouncing ownership disables the dangerous owner-only functions. Not renounced = trap is still armed." },
    { id: "rf-anondev", label: "Anonymous dev claims", text: "doxxed (private only)", explanation: "'Doxxed in private' is a contradiction. Real doxxing is public verification." },
    { id: "rf-soontrope", label: "'Soon' promises", text: "renounced (soon)", explanation: "'Audit soon', 'renounced soon', 'lock soon' — the perpetual 'soon' is rug language." },
  ],
  quiz: [
    { id: "q1", prompt: "What does 'LP not locked, not burned' mean for a token holder?", options: ["The dev can withdraw liquidity at any time, dropping the token to ~$0", "Trading is permanently disabled until the dev locks LP", "The LP earns extra fees because it's flexible", "It means the project is in stealth mode"], correctIndex: 0, explanation: "Unlocked LP held by the dev is the classic rug-pull primer. They can yank the funds in one transaction." },
    { id: "q2", prompt: "Why is a mutable sell tax dangerous even if it's currently low?", options: ["It can't be changed — the value is hardcoded", "It increases gas fees over time", "The owner can raise it to anything (e.g., 99%) at any moment, trapping holders", "It only affects new buyers"], correctIndex: 2, explanation: "Mutable parameters are owner-controlled traps. A 5% tax today can be 99% tomorrow." },
    { id: "q3", prompt: "Single wallet holds 62% of supply, plus 3 sibling wallets funded by it hold another 18%. What does this tell you?", options: ["The project has strong whale support", "One person effectively controls 80% of supply and can dump anytime", "Decentralization is achieved through multiple holders", "It's a positive sign — committed long-term holders"], correctIndex: 1, explanation: "Sibling wallets funded from the deployer are almost always the same actor splitting holdings to fake distribution. Effective control is concentrated." },
  ],
  correctVerdict: "dangerous",
  available: true,
};

const FAKE_SUPPORT: Mission = {
  slug: "fake-customer-support",
  title: "Help Desk Imposter",
  category: "Fake Customer Support",
  difficulty: "Beginner",
  estMinutes: 3,
  xp: 110,
  badge: { name: "Verified Skeptic", description: "Treated unsolicited support as the threat it is.", rarity: "Common", emoji: "🪪" },
  summary: "Posted a question in #help. Within 90 seconds a 'mod' DMs you. Investigate before responding.",
  briefing: "Case #004 — You posted in #help in the official Discord asking why your transaction is pending. 87 seconds later, an account named 'Support_Mod | Coinbase' DMs you offering to fix it. Verify before you trust anyone.",
  evidence: [
    {
      id: "channel",
      label: "Original Post",
      icon: "message",
      caption: "Your message in the public #help channel",
      body:
        "[ #help — public channel, 4,200 members ]\n\n" +
        "you · just now\n" +
        "Hey, my swap on the official UI has been pending for 12 minutes.\n" +
        "Tx: 0x9a2f...e12\n" +
        "Anyone know if I should resubmit or wait? Don't want to double-spend.\n\n" +
        "[ 0 replies, 0 reactions ]",
    },
    {
      id: "dm",
      label: "Incoming DM",
      icon: "message",
      caption: "Direct message received 87 seconds after posting",
      body:
        "From: Support_Mod | Coinbase 🛡️\n" +
        "Profile: 'Customer Support Lead — Coinbase Official'\n" +
        "Discord member since: 2 days ago\n" +
        "Mutual servers: 0\n\n" +
        "Hi! I'm from the official Coinbase support team. I saw your message in #help.\n\n" +
        "Your transaction is stuck because of a network sync issue. I can manually push it through for you.\n\n" +
        "To proceed, please:\n" +
        "  1. Visit our priority support portal: coinbase-priority.help\n" +
        "  2. Connect the wallet that has the pending tx\n" +
        "  3. Sign the verification request — it's just a free signature, no gas\n\n" +
        "This takes 30 seconds. Other 47 users in queue ahead of you, so please act fast or your tx may fail.",
    },
    {
      id: "profile",
      label: "Sender Profile",
      icon: "wallet",
      caption: "What Discord shows on the DM sender",
      body:
        "Username:           Support_Mod | Coinbase\n" +
        "Discriminator:      #1184\n" +
        "Discord since:      2 days ago\n" +
        "Profile picture:    Coinbase logo (downloaded from press kit)\n" +
        "Bio:                'Helping users 24/7 — Coinbase Support Lead'\n" +
        "Mutual servers:     0\n" +
        "Roles in this server: NONE — they are just a regular member here\n\n" +
        "Real Coinbase support staff:\n" +
        "  • Have the 'Staff' role in the official server\n" +
        "  • Have a verified server badge\n" +
        "  • Never DM first under any circumstance",
    },
    {
      id: "portal",
      label: "Support Portal",
      icon: "globe",
      caption: "What coinbase-priority.help shows when you visit",
      body:
        "URL: https://coinbase-priority.help/verify\n\n" +
        "Page: Coinbase Priority Support — Verification\n" +
        "(Logo and styling cloned from coinbase.com)\n\n" +
        "'To resolve your stuck transaction, please connect your wallet and sign the verification message.'\n\n" +
        "[ CONNECT WALLET ]\n\n" +
        "After connecting, the signature request is for an EIP-712 message:\n" +
        "  Permit2: PermitBatch\n" +
        "  spender: 0x6c4F...7E11  (unverified contract)\n" +
        "  tokens:  USDC, USDT, WETH, cbETH\n" +
        "  amount:  unlimited each\n" +
        "  deadline: 2027-12-31",
    },
    {
      id: "real",
      label: "Real Coinbase Policy",
      icon: "gavel",
      caption: "How Coinbase support actually works",
      body:
        "Source: help.coinbase.com — 'Avoiding scams and fraud'\n\n" +
        "Coinbase support will NEVER:\n" +
        "  • DM you first on any platform\n" +
        "  • Ask you to sign messages or connect wallets to a 'support portal'\n" +
        "  • Request your seed phrase, private keys, or 2FA codes\n" +
        "  • Pressure you with timers ('queue fills up') or scarcity\n" +
        "  • Operate from any domain other than coinbase.com or help.coinbase.com\n\n" +
        "Real support flow:\n" +
        "  1. You initiate from help.coinbase.com\n" +
        "  2. Communication via verified email or in-app messaging\n" +
        "  3. Identity verification through your account, never by signing wallet messages",
    },
  ],
  redFlags: [
    { id: "rf-fast", label: "Suspiciously fast DM", text: "87 seconds after posting", explanation: "Scammers monitor public help channels with bots. Anyone DMing you within minutes of asking for help is almost always a scammer." },
    { id: "rf-firstdm", label: "Support DMs first", text: "official Coinbase support team", explanation: "Every major exchange explicitly states their support never DMs first. This pattern alone is conclusive." },
    { id: "rf-newaccount", label: "Account age", text: "Discord member since: 2 days ago", explanation: "Real support staff have established accounts. 2-day-old accounts impersonating brands are scams." },
    { id: "rf-norole", label: "No staff role", text: "Roles in this server: NONE", explanation: "Real support has the verified Staff role. A regular member with a fancy username is not staff." },
    { id: "rf-portal", label: "Lookalike domain", text: "coinbase-priority.help", explanation: "Real Coinbase = coinbase.com. Hyphenated domains and weird TLDs (.help, .support) are phishing patterns." },
    { id: "rf-scarcity", label: "Queue urgency", text: "47 users in queue ahead of you", explanation: "Manufactured queue pressure is a manipulation tactic. Real support doesn't 'fill up' on Discord." },
    { id: "rf-permit2", label: "Permit2 batch signature", text: "Permit2: PermitBatch", explanation: "EIP-712 'free signature' permits can authorize unlimited token spending across multiple tokens at once. The most dangerous signature you can give." },
    { id: "rf-unlimited2", label: "Unlimited multi-token", text: "amount:  unlimited each", explanation: "Signing this approves the spender to drain ALL of your USDC, USDT, WETH, and cbETH simultaneously." },
    { id: "rf-nogas", label: "'No gas' lie", text: "free signature, no gas", explanation: "'Free signature' is the new 'free airdrop'. Signatures don't cost gas, but they can authorize draining via Permit2." },
  ],
  quiz: [
    { id: "q1", prompt: "Why is 'this is just a free signature, no gas' a major warning sign?", options: ["Free signatures can authorize unlimited token spending via Permit2 — no gas needed to sign, but full draining possible", "Signatures are completely safe — they can't move funds", "It means the website is poorly built", "It just means the dev is generous"], correctIndex: 0, explanation: "Permit2/EIP-2612 signatures are gasless authorizations. A scammer just needs your signature to drain you — no transaction approval needed from your side." },
    { id: "q2", prompt: "An account named 'Support_Mod | Coinbase' with the official logo DMs you first. What's the right move?", options: ["Trust them — they have the right name and logo", "Verify their role in the official server's member list (Staff role required) and report the DM as a scam regardless", "Reply with your transaction hash to speed things up", "Visit the support portal they linked just to see"], correctIndex: 1, explanation: "Names and avatars can be cloned. The Staff role is server-managed and can't be faked. Bigger picture: legitimate support never DMs first — period." },
    { id: "q3", prompt: "How should you verify support legitimacy on Discord/Telegram?", options: ["Check if the username has 'Mod' or 'Support' in it", "Cross-reference the verified Staff role and start support yourself from the official help.coinbase.com page", "Ask the DM for proof of identity — they'll prove it", "Trust verified-checkmark accounts on Twitter when they DM"], correctIndex: 1, explanation: "Always initiate support from the official site. Trust roles and verified channels, not usernames or avatars." },
  ],
  correctVerdict: "dangerous",
  available: true,
};

const MALICIOUS_APPROVAL: Mission = {
  slug: "malicious-approval",
  title: "The Innocent NFT Mint",
  category: "Malicious Approval",
  difficulty: "Advanced",
  estMinutes: 7,
  xp: 300,
  badge: { name: "Approval Auditor", description: "Decoded malicious calldata before signing.", rarity: "Epic", emoji: "📜" },
  summary: "A free mint with a clean website. The wallet popup hides what the calldata actually does. Decode it.",
  briefing: "Case #005 — A trending free mint just dropped. The site looks polished, the team is doxxed, the contract is verified. But the wallet popup signature looks slightly off. Decode the calldata and decide.",
  evidence: [
    {
      id: "site",
      label: "Mint Site",
      icon: "globe",
      caption: "Looks legitimate at first glance",
      body:
        "URL: https://moonkats-mint.xyz\n\n" +
        "Project: MoonKats — Free Mint NFT Collection\n" +
        "Supply: 5,000\n" +
        "Mint price: FREE (gas only)\n" +
        "Team: 'Doxxed via Premint'\n" +
        "Audit: Hashlock (badge displayed)\n" +
        "Discord: 18k members  Twitter: 32k followers\n\n" +
        "[ MINT FOR FREE — 1 PER WALLET ]\n\n" +
        "Step 1: Connect wallet (you're connected ✓)\n" +
        "Step 2: Click MINT FOR FREE\n" +
        "Step 3: Approve the transaction\n" +
        "Step 4: NFT appears in your wallet",
    },
    {
      id: "popup",
      label: "Wallet Popup",
      icon: "wallet",
      caption: "What MetaMask shows when you click MINT",
      body:
        "MetaMask — Confirm Transaction\n\n" +
        "Site: moonkats-mint.xyz\n" +
        "Account: your wallet\n" +
        "Function: 'Mint' (claimed)\n" +
        "Estimated gas: 0.0021 ETH\n\n" +
        "[ Reject ]    [ Confirm ]\n\n" +
        "Note: MetaMask shows 'Mint' as the function name because of the contract's ABI.\n" +
        "However, the function selector and parameters tell a different story.\n" +
        "→ Click 'Hex Data' to inspect.",
    },
    {
      id: "calldata",
      label: "Raw Calldata",
      icon: "receipt",
      caption: "Decoded transaction data — what actually executes",
      body:
        "to: 0xMOONKATS_CONTRACT  (verified ✓)\n" +
        "data: 0x42842e0e...\n\n" +
        "Selector: 0x42842e0e\n" +
        "  → safeTransferFrom(address from, address to, uint256 tokenId)\n" +
        "  (NOT a mint function!)\n\n" +
        "Decoded parameters:\n" +
        "  from:    YOUR_ADDRESS  (you)\n" +
        "  to:      0xATTACKER_DRAINER_ADDRESS\n" +
        "  tokenId: 9482  ← BAYC #9482 from your wallet\n\n" +
        "Effect if signed: this transfers your owned NFT (BAYC #9482, floor ~30 ETH) FROM you TO the attacker.\n" +
        "It is NOT a mint. It is using the standard ERC-721 transfer function.\n\n" +
        "Contract function the dApp claims to call: mint() — selector 0x1249c58b\n" +
        "Function actually being called:           safeTransferFrom() — selector 0x42842e0e",
    },
    {
      id: "context",
      label: "Why This Works",
      icon: "gavel",
      caption: "How the dApp tricks the wallet display",
      body:
        "The drainer technique:\n" +
        "  1. The site previously asked you to call setApprovalForAll(operator, true) on a popular NFT\n" +
        "     contract (BAYC, Azuki, etc.) — buried inside a 'verify ownership' step.\n" +
        "  2. With approval granted, the contract now has permission to move ANY of your NFTs in that collection.\n" +
        "  3. When you click MINT, the dApp builds a transaction that calls safeTransferFrom on the BAYC contract,\n" +
        "     not the mint function. MetaMask labels the call 'Mint' because the dApp lies in its frontend.\n" +
        "  4. The attacker's address is the recipient. Your NFT goes to them.\n\n" +
        "Detection method:\n" +
        "  - Always check the function selector. The first 4 bytes of calldata = function ID.\n" +
        "  - mint() = 0x1249c58b\n" +
        "  - safeTransferFrom(address,address,uint256) = 0x42842e0e\n" +
        "  - These are NOT the same. MetaMask's label can lie. Calldata cannot.\n\n" +
        "Tools that decode this for you: Pocket Universe, Wallet Guard, Revoke.cash 'simulate'.",
    },
    {
      id: "audit",
      label: "Audit Badge",
      icon: "globe",
      caption: "Investigating the displayed Hashlock badge",
      body:
        "The site shows: 'Audited by Hashlock'\n" +
        "We searched: hashlock.com.au — list of audited projects.\n" +
        "Result: 'MoonKats' is NOT listed.\n\n" +
        "The audit badge is just an image. The audit firm has no record of the project.\n" +
        "This is a fake audit claim — common in elaborate phishing setups designed to feel legitimate.",
    },
  ],
  redFlags: [
    { id: "rf-selector", label: "Wrong function selector", text: "Selector: 0x42842e0e", explanation: "The first 4 bytes of calldata is the function being called. 0x42842e0e is safeTransferFrom — a transfer, not a mint." },
    { id: "rf-recipient", label: "NFT going to attacker", text: "to:      0xATTACKER_DRAINER_ADDRESS", explanation: "The 'to' field is the recipient. You're sending YOUR NFT to someone else, not minting a new one." },
    { id: "rf-fakeaudit", label: "Fake audit", text: "'MoonKats' is NOT listed", explanation: "Audit badges can be displayed by anyone. Always check the audit firm's actual list of audited projects." },
    { id: "rf-priorapproval", label: "Prior setApprovalForAll", text: "setApprovalForAll(operator, true)", explanation: "This is the actual exploit primer. Once you grant operator approval on a collection, any contract can move all NFTs in that collection." },
    { id: "rf-mismatch", label: "Function name lies", text: "MetaMask labels the call 'Mint' because the dApp lies", explanation: "Frontend ABIs can claim any function name. The wallet trusts the dApp's ABI hint. The truth is in the calldata." },
    { id: "rf-trustedbrand", label: "Targeting valuable NFT", text: "BAYC #9482", explanation: "Drainers specifically target high-value NFTs. The 'free mint' is bait to authorize moving real assets." },
  ],
  quiz: [
    { id: "q1", prompt: "MetaMask labels the transaction 'Mint'. The function selector is 0x42842e0e. Which one tells the truth?", options: ["MetaMask's label — it's signed by the wallet itself", "The function selector — it's the actual EVM call data and cannot be falsified", "Both must agree, otherwise the transaction won't execute", "Whichever the dApp claims is correct"], correctIndex: 1, explanation: "Function selectors are the first 4 bytes of calldata — they are what the EVM dispatches on. UI labels are advisory and can be wrong or malicious." },
    { id: "q2", prompt: "What did setApprovalForAll(operator, true) actually do in this attack chain?", options: ["Granted the operator permission to move any NFT in that collection from your wallet", "Verified that you own the NFT collection", "Set up a recurring mint allowance for free drops", "Locked your NFTs as collateral for the mint"], correctIndex: 0, explanation: "setApprovalForAll is the most dangerous NFT permission — it gives one address full control over your entire collection until manually revoked." },
    { id: "q3", prompt: "What's the safest tool habit to prevent this exact attack?", options: ["Trust audited projects automatically", "Use a transaction simulator (Pocket Universe, Wallet Guard, Revoke.cash) that decodes calldata before signing", "Only mint on websites with HTTPS", "Sign quickly so the gas estimate doesn't change"], correctIndex: 1, explanation: "Simulators decode the actual EVM effects of a transaction, including which assets leave your wallet, before you sign. They catch UI lies." },
  ],
  correctVerdict: "dangerous",
  available: true,
};

export const MISSIONS: Mission[] = [
  FREE_AIRDROP_ALERT,
  SEED_PHRASE_PHISHING,
  RUGPULL_TOKEN,
  FAKE_SUPPORT,
  MALICIOUS_APPROVAL,
];

export function getMission(slug: string): Mission | undefined {
  return MISSIONS.find((m) => m.slug === slug);
}
