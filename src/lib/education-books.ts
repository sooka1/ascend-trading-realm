// Curated foreign books & PDFs on market structure and risk.
// Links point to authoritative free sources (SEC, CFTC, BIS, IMF, IOSCO, Fed,
// author sites, archive.org). When no direct free PDF exists, a Google search
// for the exact title + PDF is used so users find the current best source.

export type EduBook = {
  id: number;
  title: string;
  author: string;
  topic: "market-structure" | "risk";
  format: "PDF" | "Book";
  url: string;
};

function g(q: string) {
  return `https://www.google.com/search?q=${encodeURIComponent(q + " filetype:pdf")}`;
}

export const EDU_BOOKS: EduBook[] = [
  // ── Market Structure ──
  { id: 1, title: "Trading and Exchanges: Market Microstructure for Practitioners", author: "Larry Harris", topic: "market-structure", format: "Book", url: g("Trading and Exchanges Larry Harris") },
  { id: 2, title: "Market Microstructure Theory", author: "Maureen O'Hara", topic: "market-structure", format: "Book", url: g("Market Microstructure Theory Maureen O'Hara") },
  { id: 3, title: "Empirical Market Microstructure", author: "Joel Hasbrouck", topic: "market-structure", format: "Book", url: g("Empirical Market Microstructure Hasbrouck") },
  { id: 4, title: "Algorithmic and High-Frequency Trading", author: "Cartea, Jaimungal, Penalva", topic: "market-structure", format: "Book", url: g("Algorithmic and High-Frequency Trading Cartea") },
  { id: 5, title: "Flash Boys: A Wall Street Revolt", author: "Michael Lewis", topic: "market-structure", format: "Book", url: g("Flash Boys Michael Lewis") },
  { id: 6, title: "Dark Pools: The Rise of the Machine Traders", author: "Scott Patterson", topic: "market-structure", format: "Book", url: g("Dark Pools Scott Patterson") },
  { id: 7, title: "The Microstructure Approach to Exchange Rates", author: "Richard Lyons", topic: "market-structure", format: "Book", url: g("Microstructure Approach Exchange Rates Lyons") },
  { id: 8, title: "Equity Market Structure Concept Release", author: "U.S. SEC", topic: "market-structure", format: "PDF", url: "https://www.sec.gov/rules/concept/2010/34-61358.pdf" },
  { id: 9, title: "Report on the U.S. Treasury Market on Oct 15, 2014", author: "Joint Staff Report", topic: "market-structure", format: "PDF", url: "https://www.treasury.gov/press-center/press-releases/Documents/Joint_Staff_Report_Treasury_10-15-2015.pdf" },
  { id: 10, title: "Findings Regarding the Market Events of May 6, 2010 (Flash Crash)", author: "SEC & CFTC", topic: "market-structure", format: "PDF", url: "https://www.sec.gov/news/studies/2010/marketevents-report.pdf" },
  { id: 11, title: "Electronic Trading in Fixed Income Markets", author: "BIS Markets Committee", topic: "market-structure", format: "PDF", url: "https://www.bis.org/publ/mktc07.pdf" },
  { id: 12, title: "FX Global Code", author: "Global FX Committee", topic: "market-structure", format: "PDF", url: "https://www.globalfxc.org/docs/fx_global.pdf" },
  { id: 13, title: "Triennial Central Bank Survey — FX Turnover", author: "BIS", topic: "market-structure", format: "PDF", url: "https://www.bis.org/statistics/rpfx22_fx.pdf" },
  { id: 14, title: "High-Frequency Trading — IOSCO Consultation Report", author: "IOSCO", topic: "market-structure", format: "PDF", url: "https://www.iosco.org/library/pubdocs/pdf/IOSCOPD354.pdf" },
  { id: 15, title: "Regulation NMS Final Rule", author: "U.S. SEC", topic: "market-structure", format: "PDF", url: "https://www.sec.gov/rules/final/34-51808.pdf" },
  { id: 16, title: "The Volume Clock: Insights into HFT Paradigm", author: "López de Prado, Easley, O'Hara", topic: "market-structure", format: "PDF", url: g("Volume Clock Insights HFT Lopez de Prado") },
  { id: 17, title: "Flow Toxicity and Liquidity (VPIN)", author: "Easley, López de Prado, O'Hara", topic: "market-structure", format: "PDF", url: g("Flow Toxicity Liquidity VPIN Easley Lopez de Prado") },
  { id: 18, title: "Order Book Dynamics and Price Impact", author: "Rama Cont", topic: "market-structure", format: "PDF", url: g("Order book dynamics price impact Rama Cont") },
  { id: 19, title: "Optimal Execution of Portfolio Transactions", author: "Almgren & Chriss", topic: "market-structure", format: "PDF", url: "https://www.smallake.kr/wp-content/uploads/2016/03/optliq.pdf" },
  { id: 20, title: "Market Liquidity: Theory, Evidence, and Policy", author: "Foucault, Pagano, Röell", topic: "market-structure", format: "Book", url: g("Market Liquidity Foucault Pagano Roell") },
  { id: 21, title: "The Handbook of Fixed Income Securities", author: "Frank Fabozzi", topic: "market-structure", format: "Book", url: g("Handbook of Fixed Income Securities Fabozzi") },
  { id: 22, title: "Inside the Black Box", author: "Rishi Narang", topic: "market-structure", format: "Book", url: g("Inside the Black Box Rishi Narang") },
  { id: 23, title: "Advances in Financial Machine Learning", author: "Marcos López de Prado", topic: "market-structure", format: "Book", url: g("Advances in Financial Machine Learning Lopez de Prado") },
  { id: 24, title: "Machine Learning for Asset Managers", author: "Marcos López de Prado", topic: "market-structure", format: "Book", url: g("Machine Learning for Asset Managers Lopez de Prado") },
  { id: 25, title: "The Trade Lifecycle", author: "Robert Baker", topic: "market-structure", format: "Book", url: g("The Trade Lifecycle Robert Baker") },
  { id: 26, title: "Central Counterparties: Mandatory Clearing and Bilateral Margin", author: "Jon Gregory", topic: "market-structure", format: "Book", url: g("Central Counterparties Jon Gregory") },
  { id: 27, title: "Global FX Turnover in April 2022", author: "BIS", topic: "market-structure", format: "PDF", url: "https://www.bis.org/statistics/rpfx22_fx.pdf" },
  { id: 28, title: "Principles for Financial Market Infrastructures", author: "CPMI-IOSCO", topic: "market-structure", format: "PDF", url: "https://www.bis.org/cpmi/publ/d101a.pdf" },
  { id: 29, title: "The Microstructure of the Bond Market in the 20th Century", author: "Biais & Green", topic: "market-structure", format: "PDF", url: g("Microstructure Bond Market 20th Century Biais Green") },
  { id: 30, title: "MiFID II — Directive 2014/65/EU", author: "European Union", topic: "market-structure", format: "PDF", url: "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:32014L0065" },

  // ── Risk ──
  { id: 31, title: "Options, Futures, and Other Derivatives", author: "John Hull", topic: "risk", format: "Book", url: g("Options Futures Other Derivatives John Hull") },
  { id: 32, title: "Risk Management and Financial Institutions", author: "John Hull", topic: "risk", format: "Book", url: g("Risk Management and Financial Institutions John Hull") },
  { id: 33, title: "Value at Risk", author: "Philippe Jorion", topic: "risk", format: "Book", url: g("Value at Risk Philippe Jorion") },
  { id: 34, title: "Against the Gods: The Remarkable Story of Risk", author: "Peter Bernstein", topic: "risk", format: "Book", url: g("Against the Gods Peter Bernstein") },
  { id: 35, title: "The Black Swan", author: "Nassim Nicholas Taleb", topic: "risk", format: "Book", url: g("The Black Swan Taleb") },
  { id: 36, title: "Antifragile", author: "Nassim Nicholas Taleb", topic: "risk", format: "Book", url: g("Antifragile Taleb") },
  { id: 37, title: "Fooled by Randomness", author: "Nassim Nicholas Taleb", topic: "risk", format: "Book", url: g("Fooled by Randomness Taleb") },
  { id: 38, title: "When Genius Failed (LTCM)", author: "Roger Lowenstein", topic: "risk", format: "Book", url: g("When Genius Failed Roger Lowenstein") },
  { id: 39, title: "The Alchemy of Finance", author: "George Soros", topic: "risk", format: "Book", url: g("Alchemy of Finance Soros") },
  { id: 40, title: "Manias, Panics, and Crashes", author: "Kindleberger & Aliber", topic: "risk", format: "Book", url: g("Manias Panics and Crashes Kindleberger") },
  { id: 41, title: "Basel III: Finalising Post-Crisis Reforms", author: "BCBS", topic: "risk", format: "PDF", url: "https://www.bis.org/bcbs/publ/d424.pdf" },
  { id: 42, title: "Minimum Capital Requirements for Market Risk (FRTB)", author: "BCBS", topic: "risk", format: "PDF", url: "https://www.bis.org/bcbs/publ/d457.pdf" },
  { id: 43, title: "Principles for the Sound Management of Operational Risk", author: "BCBS", topic: "risk", format: "PDF", url: "https://www.bis.org/publ/bcbs195.pdf" },
  { id: 44, title: "Global Financial Stability Report", author: "IMF", topic: "risk", format: "PDF", url: "https://www.imf.org/-/media/Files/Publications/GFSR/2024/April/English/text.ashx" },
  { id: 45, title: "Coherent Measures of Risk", author: "Artzner, Delbaen, Eber, Heath", topic: "risk", format: "PDF", url: g("Coherent Measures of Risk Artzner") },
  { id: 46, title: "Expected Shortfall vs Value-at-Risk", author: "Yamai & Yoshiba", topic: "risk", format: "PDF", url: g("Expected Shortfall Value at Risk Yamai Yoshiba") },
  { id: 47, title: "The Kelly Criterion for Position Sizing", author: "Edward O. Thorp", topic: "risk", format: "PDF", url: g("Kelly Criterion Thorp") },
  { id: 48, title: "A Mathematical Theory of Communication (basis for entropy)", author: "Claude Shannon", topic: "risk", format: "PDF", url: "https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf" },
  { id: 49, title: "Portfolio Selection", author: "Harry Markowitz", topic: "risk", format: "PDF", url: g("Portfolio Selection Markowitz 1952") },
  { id: 50, title: "The Capital Asset Pricing Model — Sharpe", author: "William F. Sharpe", topic: "risk", format: "PDF", url: g("Capital Asset Pricing Model Sharpe 1964") },
  { id: 51, title: "A Practical Guide to Risk Management", author: "Thomas Coleman (CFA Research Foundation)", topic: "risk", format: "PDF", url: "https://rpc.cfainstitute.org/-/media/documents/book/rf-publication/2011/rf-v2011-n3-1-pdf.pdf" },
  { id: 52, title: "GARP FRM Foundations of Risk Management", author: "GARP", topic: "risk", format: "PDF", url: g("GARP FRM Foundations of Risk Management") },
  { id: 53, title: "Counterparty Credit Risk and Credit Value Adjustment", author: "Jon Gregory", topic: "risk", format: "Book", url: g("Counterparty Credit Risk Jon Gregory") },
  { id: 54, title: "Model Risk Management — SR 11-7", author: "Federal Reserve", topic: "risk", format: "PDF", url: "https://www.federalreserve.gov/supervisionreg/srletters/sr1107a1.pdf" },
  { id: 55, title: "Stress Testing Principles", author: "BCBS", topic: "risk", format: "PDF", url: "https://www.bis.org/bcbs/publ/d450.pdf" },
  { id: 56, title: "The Turner Review — A Regulatory Response to the Crisis", author: "FSA (UK)", topic: "risk", format: "PDF", url: g("Turner Review FSA regulatory response") },
  { id: 57, title: "The Financial Crisis Inquiry Report", author: "FCIC", topic: "risk", format: "PDF", url: "https://www.govinfo.gov/content/pkg/GPO-FCIC/pdf/GPO-FCIC.pdf" },
  { id: 58, title: "Reminiscences of a Stock Operator", author: "Edwin Lefèvre", topic: "risk", format: "Book", url: g("Reminiscences of a Stock Operator Lefevre") },
  { id: 59, title: "Market Wizards", author: "Jack Schwager", topic: "risk", format: "Book", url: g("Market Wizards Jack Schwager") },
  { id: 60, title: "The New Market Wizards", author: "Jack Schwager", topic: "risk", format: "Book", url: g("The New Market Wizards Jack Schwager") },
  { id: 61, title: "Hedge Fund Market Wizards", author: "Jack Schwager", topic: "risk", format: "Book", url: g("Hedge Fund Market Wizards Schwager") },
  { id: 62, title: "Trading Risk: Enhanced Profitability through Risk Control", author: "Kenneth Grant", topic: "risk", format: "Book", url: g("Trading Risk Kenneth Grant") },
  { id: 63, title: "Position Sizing in Trading", author: "Van K. Tharp", topic: "risk", format: "PDF", url: g("Position Sizing Van Tharp") },
  { id: 64, title: "Trade Your Way to Financial Freedom", author: "Van K. Tharp", topic: "risk", format: "Book", url: g("Trade Your Way to Financial Freedom Van Tharp") },
];