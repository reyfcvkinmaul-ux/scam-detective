// Mission data — static for Phase 1 (no backend, no AI generation yet)
// Phase 2 will move this to Supabase; Phase 3 adds AI-generated variants.

export type RedFlag = {
  id: string;
  label: string;          // short tag e.g. "Urgency"
  text: string;           // exact substring inside evidence body to highlight
  explanation: string;    // why this is suspicious
};

export type EvidenceTab = {
  id: string;
  label: string;
  icon: "twitter" | "globe" | "wallet" | "receipt" | "message" | "gavel";
  body: string;           // markdown-ish plain text; render with redflag spans
  caption?: string;       // small subtitle under the tab title
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
  briefing: string;       // case file intro
  evidence: EvidenceTab[];
  redFlags: RedFlag[];
  quiz: QuizQuestion[];
  correctVerdict: Verdict;
  available: boolean;     // false = locked / coming soon
};

// Helper: render a body string and highlight RedFlag.text spans
// We don't preprocess here — the renderer in <EvidenceBody/> handles it.

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
    {
      id: "rf-urgency",
      label: "Urgency",
      text: "LAST 24 HOURS",
      explanation:
        "Real airdrops don't pressure you. Countdown timers and 'last X hours' messaging are designed to bypass your judgment.",
    },
    {
      id: "rf-fakehandle",
      label: "Lookalike handle",
      text: "@Uniswap_Airdrop_Official",
      explanation:
        "Real Uniswap is @Uniswap. Variations with 'airdrop', 'official', '_official' are the #1 phishing pattern on X.",
    },
    {
      id: "rf-domain",
      label: "Suspicious domain",
      text: "uniswap-airdrop-claim[.]net",
      explanation:
        "Uniswap's only official domain is uniswap.org. Hyphenated subdomains and .net/.io variants are red flags.",
    },
    {
      id: "rf-newdomain",
      label: "Domain age",
      text: "Domain registered 4 days ago",
      explanation:
        "Legit projects don't launch 'official' airdrops on a 4-day-old domain. WHOIS lookup before clicking always.",
    },
    {
      id: "rf-unlimited",
      label: "Unlimited approval",
      text: "UNLIMITED (max uint256)",
      explanation:
        "An airdrop CLAIM should never require token approval — you're receiving tokens, not sending them. Unlimited approval = drain risk.",
    },
    {
      id: "rf-unverified",
      label: "Unverified contract",
      text: "unverified contract",
      explanation:
        "If a contract isn't verified on Etherscan, you can't read what it does. Combined with unlimited approval, this is a textbook drainer.",
    },
    {
      id: "rf-seed",
      label: "Seed phrase request",
      text: "share your seed phrase",
      explanation:
        "NO legitimate team will EVER ask for your seed phrase. Not for verification, not for support, not ever. This alone is conclusive.",
    },
    {
      id: "rf-dm",
      label: "Unsolicited DM",
      text: "sent you a friend request",
      explanation:
        "Real support never DMs first. Discord/Telegram DMs offering help right after a wallet action are scammers monitoring on-chain activity.",
    },
  ],
  quiz: [
    {
      id: "q1",
      prompt: "What does 'approve unlimited spending cap' actually let the spender do?",
      options: [
        "Send you the airdrop tokens automatically",
        "Transfer any amount of that token from your wallet at any time, until revoked",
        "Verify your wallet is eligible without moving funds",
        "Pay the gas fee on your behalf",
      ],
      correctIndex: 1,
      explanation:
        "Token approval gives the spender contract permission to move YOUR tokens. 'Unlimited' = they can drain everything, now or later.",
    },
    {
      id: "q2",
      prompt: "A 'support' account DMs you asking for your seed phrase to credit the airdrop. What do you do?",
      options: [
        "Send only the first 6 words to be safe",
        "Verify their identity in the official server first, then send",
        "Never send — no legitimate team ever asks for a seed phrase",
        "Send a screenshot instead of typing it",
      ],
      correctIndex: 2,
      explanation:
        "Seed phrase = full wallet ownership. Anyone asking, for any reason, is a scammer. Period.",
    },
    {
      id: "q3",
      prompt: "How would you verify if Uniswap actually launched a new airdrop?",
      options: [
        "Click the link in the viral tweet — it has a verified checkmark",
        "Check uniswap.org and the official @Uniswap account, then cross-reference with a major crypto news outlet",
        "Connect your wallet to the site and see if it says 'eligible'",
        "Trust the urgency timer, real airdrops do close",
      ],
      correctIndex: 1,
      explanation:
        "Always verify announcements at the source domain (uniswap.org) and the canonical handle (@Uniswap, no suffix). Cross-check news.",
    },
  ],
  correctVerdict: "dangerous",
  available: true,
};

const COMING_SOON: Mission[] = [
  {
    slug: "seed-phrase-phishing",
    title: "The 'Wallet Sync' Trap",
    category: "Seed Phrase Phishing",
    difficulty: "Beginner",
    estMinutes: 4,
    xp: 120,
    badge: { name: "Vault Keeper", description: "Refused to expose your seed phrase.", rarity: "Common", emoji: "🔐" },
    summary: "A wallet popup claims your account needs to be 're-synced' for security. Spot the trick.",
    briefing: "",
    evidence: [],
    redFlags: [],
    quiz: [],
    correctVerdict: "dangerous",
    available: false,
  },
  {
    slug: "rugpull-token-analysis",
    title: "MoonPump Premium",
    category: "Rugpull Token",
    difficulty: "Intermediate",
    estMinutes: 6,
    xp: 200,
    badge: { name: "Liquidity Watcher", description: "Read the contract before aping in.", rarity: "Rare", emoji: "🪤" },
    summary: "Hot new token, 4000% in 3 days. Read the contract — find the rug pin.",
    briefing: "",
    evidence: [],
    redFlags: [],
    quiz: [],
    correctVerdict: "dangerous",
    available: false,
  },
  {
    slug: "fake-customer-support",
    title: "Help Desk Imposter",
    category: "Fake Customer Support",
    difficulty: "Beginner",
    estMinutes: 3,
    xp: 100,
    badge: { name: "Verified Skeptic", description: "Treated unsolicited support as the threat it is.", rarity: "Common", emoji: "🪪" },
    summary: "A 'mod' DMs you 90 seconds after you posted in #help. Investigate.",
    briefing: "",
    evidence: [],
    redFlags: [],
    quiz: [],
    correctVerdict: "dangerous",
    available: false,
  },
  {
    slug: "malicious-approval",
    title: "The Innocent NFT Mint",
    category: "Malicious Approval",
    difficulty: "Advanced",
    estMinutes: 7,
    xp: 280,
    badge: { name: "Approval Auditor", description: "Decoded a malicious calldata before signing.", rarity: "Epic", emoji: "📜" },
    summary: "Looks like a free mint. The calldata says otherwise.",
    briefing: "",
    evidence: [],
    redFlags: [],
    quiz: [],
    correctVerdict: "dangerous",
    available: false,
  },
];

export const MISSIONS: Mission[] = [FREE_AIRDROP_ALERT, ...COMING_SOON];

export function getMission(slug: string): Mission | undefined {
  return MISSIONS.find((m) => m.slug === slug);
}
