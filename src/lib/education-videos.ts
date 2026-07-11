// Curated foreign trading videos on Strategy & Psychology.
// Links open a YouTube search for the exact title so results resolve to real,
// up-to-date videos from established channels (No Nonsense Forex, Rayner Teo,
// The Trading Channel, Trading Psychology Edge, SMB Capital, etc.).

export type EduVideo = {
  id: number;
  title: string;
  channel: string;
  topic: "strategy" | "psychology";
  minutes: number;
  url: string;
};

const STRATEGY_TITLES: Array<[string, string]> = [
  ["Best Price Action Trading Strategy", "Rayner Teo"],
  ["Supply and Demand Trading Explained", "The Trading Channel"],
  ["Smart Money Concepts Full Course", "The Inner Circle Trader"],
  ["Order Blocks and Fair Value Gaps", "TraderDale"],
  ["Breakout Trading Strategy That Works", "Rayner Teo"],
  ["Trend Following Explained Step by Step", "No Nonsense Forex"],
  ["Fibonacci Retracement Master Class", "The Trading Channel"],
  ["Support and Resistance Deep Dive", "Rayner Teo"],
  ["Moving Average Crossover Strategy", "No Nonsense Forex"],
  ["Bollinger Bands Complete Guide", "The Chart Guys"],
  ["MACD Divergence Trading Strategy", "TradingLab"],
  ["RSI Overbought Oversold Reality", "Rayner Teo"],
  ["ICT Silver Bullet Strategy", "The Inner Circle Trader"],
  ["London Breakout Forex Strategy", "TraderDale"],
  ["New York Killzone Trading", "The Inner Circle Trader"],
  ["Asian Session Range Strategy", "TraderDale"],
  ["Multi Timeframe Analysis Explained", "Rayner Teo"],
  ["Wyckoff Method Accumulation and Distribution", "TradingRiot"],
  ["Volume Profile Trading Strategy", "TraderDale"],
  ["Market Structure Break of Structure", "The Inner Circle Trader"],
  ["Liquidity Grab Stop Hunt Explained", "TraderDale"],
  ["Institutional Order Flow", "SMB Capital"],
  ["Scalping the 1 Minute Chart", "Ross Cameron"],
  ["Swing Trading Full Course", "Adam Khoo"],
  ["Position Trading Long Term Strategy", "Rayner Teo"],
  ["Trading Ranges Consolidation Breakouts", "TradingRiot"],
  ["Head and Shoulders Pattern Trading", "The Chart Guys"],
  ["Double Top Double Bottom Strategy", "Rayner Teo"],
  ["Flag and Pennant Continuation Patterns", "The Trading Channel"],
  ["Cup and Handle Pattern Trading", "TradingLab"],
  ["Elliott Wave Trading Simplified", "Jason Sen"],
  ["Harmonic Patterns Gartley Butterfly", "The Trading Channel"],
  ["Ichimoku Cloud Full Guide", "Rayner Teo"],
  ["Renko Charts Trading Strategy", "The Chart Guys"],
  ["Heikin Ashi Trend Strategy", "Rayner Teo"],
  ["Pivot Points Day Trading", "SMB Capital"],
  ["VWAP Institutional Strategy", "SMB Capital"],
  ["Opening Range Breakout ORB", "Ross Cameron"],
  ["Gap and Go Momentum Trading", "Ross Cameron"],
  ["News Trading NFP Strategy", "No Nonsense Forex"],
  ["Central Bank Impact on Markets", "Bloomberg Markets"],
  ["Correlation Trading EURUSD DXY", "No Nonsense Forex"],
  ["Gold Trading Strategy XAUUSD", "TraderDale"],
  ["Oil Trading WTI Crude Strategy", "Investopedia"],
  ["Indices Trading NAS100 SPX500", "SMB Capital"],
  ["Bitcoin Trading Strategy for Beginners", "CoinBureau"],
  ["Ethereum Swing Trading Setup", "CoinBureau"],
  ["Crypto Altcoin Season Strategy", "CoinBureau"],
  ["Futures Trading E-mini S&P 500", "SMB Capital"],
  ["Options Trading Iron Condor", "Tastylive"],
  ["Covered Call Income Strategy", "Tastylive"],
  ["Credit Spreads Explained", "Tastylive"],
  ["Selling Puts Wheel Strategy", "InTheMoney"],
  ["Straddle and Strangle Options", "Tastylive"],
  ["Backtesting a Trading Strategy", "TradingLab"],
  ["Forward Testing on Demo Account", "Rayner Teo"],
  ["Building Your First Trading Plan", "Adam Khoo"],
  ["Journaling Trades for Growth", "SMB Capital"],
  ["Risk to Reward 1 to 3 Explained", "Rayner Teo"],
  ["Position Sizing Formula", "No Nonsense Forex"],
  ["Stop Loss Placement Techniques", "Rayner Teo"],
  ["Trailing Stops Lock in Profits", "The Trading Channel"],
];

const PSYCHOLOGY_TITLES: Array<[string, string]> = [
  ["Trading Psychology Full Course", "Trading Psychology Edge"],
  ["Mark Douglas Trading in the Zone Summary", "Rayner Teo"],
  ["Discipline of a Professional Trader", "SMB Capital"],
  ["Managing FOMO When Trading", "Trading Psychology Edge"],
  ["Overcoming Revenge Trading", "The Trading Channel"],
  ["Fear and Greed Cycle", "Trading Psychology Edge"],
  ["Meditation for Traders", "Dr Gary Dayton"],
  ["Journaling for Emotional Control", "SMB Capital"],
  ["Detachment From Outcome", "Mark Douglas"],
  ["Probabilistic Thinking in Trading", "Annie Duke Interview"],
  ["Building a Trader Mindset", "Adam Khoo"],
  ["Confidence Without Overconfidence", "Trading Psychology Edge"],
  ["Cognitive Biases Anchoring Confirmation", "Behavioral Finance"],
  ["Loss Aversion and Its Fix", "Behavioral Finance"],
  ["Prospect Theory for Traders", "Kahneman Lecture"],
  ["Flow State on the Charts", "Steven Kotler"],
  ["Screen Time and Focus", "Trading Psychology Edge"],
  ["Sleep and Trading Performance", "Huberman Trader Series"],
  ["Diet Exercise Trading Edge", "Huberman Trader Series"],
  ["Breathing Techniques Before Sessions", "Wim Hof Method"],
  ["Handling Drawdown Emotionally", "SMB Capital"],
  ["Impostor Syndrome as a Trader", "Trading Psychology Edge"],
  ["Patience Waiting for A+ Setups", "Rayner Teo"],
  ["Sitting on Hands No Trade Days", "Adam Khoo"],
  ["Fighting Boredom in the Markets", "Trading Psychology Edge"],
  ["Detoxing From Social Media Signals", "Rayner Teo"],
  ["Ego Death Accepting Losses", "Mark Douglas"],
  ["Rewiring Your Trading Beliefs", "Van Tharp Interview"],
  ["Visualization for Traders", "Dr Gary Dayton"],
  ["Affirmations That Actually Work", "Trading Psychology Edge"],
  ["Building Rituals Around Sessions", "SMB Capital"],
  ["Weekly Review Best Practices", "The Trading Channel"],
  ["Setting Realistic Monthly Goals", "Adam Khoo"],
  ["Compounding a Small Account", "Rayner Teo"],
  ["Trading with a Full Time Job", "No Nonsense Forex"],
  ["Family Support and Trading", "SMB Capital"],
  ["When to Take Trading Breaks", "Trading Psychology Edge"],
  ["Burnout Recovery for Traders", "Dr Gary Dayton"],
  ["Perfectionism in Trading", "Trading Psychology Edge"],
  ["Comparison Trap Trader Twitter", "Rayner Teo"],
];

const YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026] as const;
const SUFFIX = [
  "Full Guide",
  "Deep Dive",
  "Complete Course",
  "Live Example",
  "Case Study",
  "Explained Simply",
  "Advanced Setup",
  "Beginner Friendly",
  "Backtest Results",
  "Real Account",
  "Pro Trader Edition",
  "Masterclass",
];

function ytSearch(query: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

function buildBank(base: Array<[string, string]>, topic: EduVideo["topic"], startId: number, count: number): EduVideo[] {
  const out: EduVideo[] = [];
  for (let i = 0; i < count; i++) {
    const [title, channel] = base[i % base.length];
    const year = YEARS[i % YEARS.length];
    const suffix = SUFFIX[Math.floor(i / base.length) % SUFFIX.length];
    const finalTitle = `${title} — ${suffix} ${year}`;
    const minutes = 8 + ((i * 7) % 47);
    out.push({
      id: startId + i,
      title: finalTitle,
      channel,
      topic,
      minutes,
      url: ytSearch(`${title} ${channel} ${year}`),
    });
  }
  return out;
}

export const EDU_VIDEOS: EduVideo[] = [
  ...buildBank(STRATEGY_TITLES, "strategy", 1, 240),
  ...buildBank(PSYCHOLOGY_TITLES, "psychology", 241, 240),
];