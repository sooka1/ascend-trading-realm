
## الهدف
استبدال صفحة `/portal/trading` (أو ما يعادلها) بمحطة عمل تداول احترافية بثلاثة أعمدة، بواجهة داكنة فاخرة ومعمارية Provider-Agnostic — دون أي بيانات وهمية في الإنتاج.

## ملاحظات مهمة قبل البدء
- المشروع يعمل على **TanStack Start + Vite** (وليس Next.js 15). سألتزم بـ Stack المشروع الحالي: TanStack Start, React 19, TS, Tailwind v4, Shadcn UI, Framer Motion, TanStack Query/Table, Supabase (Lovable Cloud).
- **TradingView Advanced Charts** مكتبة مرخّصة خاصة لا يمكن تضمينها تلقائيًا. سأستخدم **`lightweight-charts`** (مفتوحة من TradingView) كطبقة رسم احترافية، مع واجهة Adapter لاستبدالها لاحقًا بـ Advanced Charts عند توفّر الترخيص.
- **موفّر بيانات السوق الحيّة** (DXfeed/Polygon/Twelve Data/…): يحتاج مفتاح API. سأبني الطبقة كاملة قابلة للتوصيل، وأستخدم **Twelve Data** كمزوّد افتراضي (WebSocket + REST + مستوى مجاني). سأطلب مفتاح API عبر add_secret في نهاية التنفيذ.
- **تنفيذ الأوامر عبر Broker حقيقي** خارج نطاق ما يمكن ربطه في هذه الجلسة (يتطلّب حساب Broker وترخيص). سأبني **Paper Trading Engine** حقيقي داخل Lovable Cloud بجداول `paper_orders/paper_positions/paper_account` مع كل منطق التحقق (Margin/Risk/Leverage/Partial Close/Reverse…)، وواجهة `BrokerConnector` جاهزة لاستبدالها بموفّر حقيقي لاحقًا دون تغيير الواجهة.

## المعمارية (Provider-Agnostic)

```text
src/features/terminal/
  adapters/
    market-data/
      types.ts                  # MarketDataProvider interface
      twelve-data.provider.ts   # WebSocket + REST
      mock.provider.ts          # dev fallback
      index.ts                  # factory + failover
    broker/
      types.ts                  # BrokerConnector interface
      paper.broker.ts           # Supabase-backed paper trading
      index.ts                  # factory
  services/
    ws-manager.ts               # reconnect + heartbeat + channels
    market-cache.ts             # tick/candle cache + dedup
    risk-engine.ts              # margin/lot/hours validation
    execution.service.ts        # order queue + retry + logging
    account.service.ts          # equity/margin/free-margin calc
  hooks/
    use-quote.ts, use-candles.ts, use-positions.ts, use-orders.ts,
    use-account.ts, use-watchlist.ts, use-alerts.ts
  components/
    layout/TerminalShell.tsx           # 3-column resizable (react-resizable-panels)
    left/OrderTicket.tsx               # Buy/Sell/Limit/Stop + TP/SL + risk calc
    left/AccountSummary.tsx
    left/RiskCalculator.tsx
    center/Chart.tsx                   # lightweight-charts + toolbar
    center/ChartToolbar.tsx            # timeframes, chart type, indicators
    center/Indicators.tsx              # EMA/SMA/RSI/MACD/BB/ATR overlays
    center/BottomTabs.tsx              # Positions | Pending | History | Calendar
    center/PositionsTable.tsx          # TanStack Table
    center/PendingOrdersTable.tsx
    center/HistoryTable.tsx            # CSV/Excel/Print
    center/EconomicCalendar.tsx
    right/Watchlist.tsx                # search + categories + dnd + alerts
    right/InstrumentHeader.tsx         # bid/ask/spread/24h/vol
    dialogs/PriceAlertDialog.tsx
    dialogs/ModifyOrderDialog.tsx
  pages/
    terminal.tsx                       # route entry
```

## قاعدة البيانات (Lovable Cloud)
جداول جديدة مع RLS + GRANTs:
- `trading_accounts` (balance, equity, leverage, currency)
- `instruments` (symbol, category, tick_size, min_lot, max_lot, contract_size)
- `watchlists` + `watchlist_items` (drag-drop order)
- `orders` (market/limit/stop/stop_limit + status + tp/sl)
- `positions` (open, entry, current, swap, commission)
- `trade_history`
- `price_alerts`
- `audit_log` (كل عملية تنفيذ/تعديل)
- Trigger: تحديث `equity/free_margin` على أي تغيّر في positions.

كل السياسات مقيّدة بـ `auth.uid() = user_id`.

## المسار
- حذف/استبدال `src/routes/portal/trading.tsx` (سأتحقق من المسار الفعلي أولاً) بواجهة الـ Terminal الجديدة.
- إبقاء PortalShell المحدّث سابقًا، لكن صفحة التداول ستأخذ الشاشة الكاملة داخل الـ shell.

## المخرجات الفعلية في هذه الجلسة
لأن النطاق كبير جدًا، سأنجز هذه المرحلة بالكامل ثم نتوسع:
1. **Migration** لكل الجداول + RLS + GRANTs + trigger حساب الـ equity.
2. **Adapter Layer** كامل (types + Twelve Data provider + mock + WS manager + cache + failover).
3. **Paper Broker** كامل (Market/Limit/Stop/Stop-Limit، Modify، Partial Close، Reverse، Close All/Profitable/Losing، Risk Engine).
4. **UI ثلاثي الأعمدة قابل للتحجيم** مع:
   - Order Ticket بكل الحقول (TP/SL, Risk%, RR, Est. Margin/Profit/Loss).
   - Account Summary مباشر.
   - Watchlist (فئات + بحث + Drag-Drop + Alerts + realtime bid/ask).
   - Chart (lightweight-charts) مع Timeframes (1m→1M)، Candle/Line/Area/Bars/Heikin-Ashi، Indicators (EMA/SMA/RSI/MACD/BB/ATR/Volume)، أدوات رسم أساسية (Trend/H-Line/V-Line/Ray/Rectangle/Text/Fib/RR).
   - Bottom Tabs: Positions/Pending/History/Economic Calendar (كلها TanStack Table + Export CSV/Excel/Print + بحث/فلتر).
5. **Realtime**: Supabase Realtime على positions/orders + WS للأسعار.
6. **Price Alerts** (Browser Notifications + Sound + سجل).
7. **Performance panel** (Daily/Weekly/Monthly P/L، Win Rate، Profit Factor، Max Drawdown، Sharpe).
8. **Keyboard shortcuts** (B=Buy, S=Sell, Esc=Cancel, Space=Close focused, 1-7=Timeframes).
9. **Responsive**: تخطيط عمودي على الموبايل مع Tabs (Chart/Trade/Watchlist/Positions).
10. **Skeletons + Framer Motion** على كل انتقال.
11. **Audit log** لكل تنفيذ.
12. طلب مفتاح `TWELVE_DATA_API_KEY` عبر add_secret في النهاية (خطوة منفصلة، إن رفضت سيعمل mock provider).

## ما هو خارج نطاق هذه الجلسة (أوضّحه صراحة)
- ترخيص TradingView Advanced Charts (يتطلّب اتفاقية مع TradingView).
- ربط Broker حقيقي (Interactive Brokers/MT4/MT5): البنية جاهزة عبر `BrokerConnector` interface، والتفعيل يتم بإضافة مزوّد لاحقًا.
- 2FA: قابل للتفعيل من إعدادات المصادقة لاحقًا (خارج هذا الـ scope الضخم أصلاً).
- DXfeed/Polygon/IB: الـ interface يدعمها، لكن سنكتفي بـ Twelve Data + Mock الآن، وإضافة موفّر جديد = ملف واحد يطبّق `MarketDataProvider`.

## التحقق
- Build + typecheck.
- اختبار Playwright يفتح `/portal/trading`، يضع أمر شراء بـ 0.10 lot، يتحقق من ظهور Position في الجدول، يعدّل TP/SL، ثم يغلقه — ولقطات شاشة لكل خطوة.

هل أبدأ التنفيذ بهذا النطاق؟ أو تريد تقليصه (مثلاً: بدون Economic Calendar / بدون Performance panel في هذه الجولة)؟
