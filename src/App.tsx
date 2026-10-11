import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Activity, ArrowDownLeft, ArrowRight, ArrowUpRight, Bell, CalendarDays,
  Check, ChevronDown, CircleHelp, Download, Gauge, Goal, LayoutDashboard,
  Lightbulb, Plus, RotateCcw, Settings2, ShieldAlert,
  Sparkles, TrendingDown, Wallet, X, Zap,
} from 'lucide-react';

type Category =
  | 'Food' | 'Transport' | 'Bills' | 'Shopping'
  | 'Subscriptions' | 'Health' | 'Study' | 'Other';

type Transaction = {
  id: string;
  title: string;
  category: Category;
  amount: number;
  date: number;
  kind: 'expense' | 'income';
  note?: string;
};

type Commitment = {
  id: string;
  name: string;
  category: string;
  amount: number;
  due: string;
  active: boolean;
  icon: string;
};

type GoalState = { name: string; target: number; saved: number };
type Tab = 'overview' | 'activity' | 'goals';

const STARTING_BUDGET = 10000;
const INITIAL_DAY = 12;

const money = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));

const categoryColor: Record<Category, string> = {
  Food: '#f59e0b',
  Transport: '#6d5ce7',
  Bills: '#4295d1',
  Shopping: '#e879a9',
  Subscriptions: '#26a69a',
  Health: '#ee7f5b',
  Study: '#8c79e6',
  Other: '#8a94a6',
};

const categoryIcon: Record<Category, string> = {
  Food: '🥑',
  Transport: '🚌',
  Bills: '⚡',
  Shopping: '🛍️',
  Subscriptions: '📱',
  Health: '💊',
  Study: '📚',
  Other: '✳️',
};

const seedTransactions: Transaction[] = [
  {
    id: 't1',
    title: 'Groceries & essentials',
    category: 'Food',
    amount: 800,
    date: 12,
    kind: 'expense',
    note: 'Weekly essentials',
  },
  {
    id: 't2',
    title: 'Metro + bus pass',
    category: 'Transport',
    amount: 420,
    date: 11,
    kind: 'expense',
  },
  {
    id: 't3',
    title: 'College lunch',
    category: 'Food',
    amount: 260,
    date: 11,
    kind: 'expense',
  },
  {
    id: 't4',
    title: 'Mobile recharge',
    category: 'Bills',
    amount: 249,
    date: 10,
    kind: 'expense',
  },
  {
    id: 't5',
    title: 'Streaming plan',
    category: 'Subscriptions',
    amount: 149,
    date: 9,
    kind: 'expense',
  },
  {
    id: 't6',
    title: 'Coffee with friends',
    category: 'Food',
    amount: 130,
    date: 9,
    kind: 'expense',
  },
  {
    id: 't7',
    title: 'Notebook & pens',
    category: 'Study',
    amount: 285,
    date: 7,
    kind: 'expense',
  },
  {
    id: 't8',
    title: 'Auto ride',
    category: 'Transport',
    amount: 165,
    date: 6,
    kind: 'expense',
  },
];

const seedCommitments: Commitment[] = [
  {
    id: 'c1',
    name: 'Room / rent share',
    category: 'Housing',
    amount: 2800,
    due: 'Due in 3 days',
    active: true,
    icon: '⌂',
  },
  {
    id: 'c2',
    name: 'Electricity & Wi-Fi',
    category: 'Utilities',
    amount: 430,
    due: 'Due in 5 days',
    active: true,
    icon: 'ϟ',
  },
  {
    id: 'c3',
    name: 'Music subscription',
    category: 'Subscription',
    amount: 119,
    due: 'Due in 8 days',
    active: true,
    icon: '♫',
  },
  {
    id: 'c4',
    name: 'Gym membership',
    category: 'Wellness',
    amount: 499,
    due: 'Due in 10 days',
    active: false,
    icon: '✳',
  },
];

const categories: Category[] = [
  'Food',
  'Transport',
  'Bills',
  'Shopping',
  'Subscriptions',
  'Health',
  'Study',
  'Other',
];

const getStored = <T,>(key: string, fallback: T): T => {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
};

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(
    () => getStored('monthwise.transactions', seedTransactions),
  );

  const [commitments, setCommitments] = useState<Commitment[]>(
    () => getStored('monthwise.commitments', seedCommitments),
  );

  const [goal, setGoal] = useState<GoalState>(
    () =>
      getStored('monthwise.goal', {
        name: 'Emergency cushion',
        target: 2000,
        saved: 650,
      }),
  );

  const [day, setDay] = useState(
    () => getStored('monthwise.day', INITIAL_DAY),
  );
  const setStored = (key: string, value: unknown): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};
  
  const [tab, setTab] = useState<Tab>('overview');
  const [simAmount, setSimAmount] = useState('450');
  const [simCategory, setSimCategory] = useState<Category>('Shopping');
  const [simTitle, setSimTitle] = useState('A little treat');
  const [simOpen, setSimOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [filter, setFilter] = useState<'all' | Category>('all');
  const [search, setSearch] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState<Category>('Food');
  const [newKind, setNewKind] = useState<'expense' | 'income'>('expense');

  useEffect(() => {
    localStorage.setItem(
      'monthwise.transactions',
      JSON.stringify(transactions),
    );
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(
      'monthwise.commitments',
      JSON.stringify(commitments),
    );
  }, [commitments]);

  useEffect(() => {
    localStorage.setItem('monthwise.goal', JSON.stringify(goal));
  }, [goal]);

  useEffect(() => {
    localStorage.setItem('monthwise.day', JSON.stringify(day));
  }, [day]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // Income and expense calculations
  const paidExpenses = transactions
    .filter(t => t.kind === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const extraIncome = transactions
    .filter(t => t.kind === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentBalance = STARTING_BUDGET + extraIncome - paidExpenses;

  // Active bills and remaining days
  const activeCommitments = commitments
    .filter(c => c.active)
    .reduce((sum, c) => sum + c.amount, 0);

  const remainingDays = Math.max(1, 30 - day + 1);

  // Savings goal calculations
  const spendable = currentBalance - activeCommitments;
  const goalGap = Math.max(0, goal.target - goal.saved);
  const goalPace = goalGap / remainingDays;

  // Flexible money must cover bills and the remaining savings goal.
  const plannedFlexibleMoney = spendable - goalGap;
  const safeDaily = plannedFlexibleMoney / remainingDays;

  const spentPercent = Math.min(
    100,
    (paidExpenses / STARTING_BUDGET) * 100,
  );

  // Forecast using the current average daily expense pace.
  const spendProjection =
    currentBalance -
    (paidExpenses / Math.max(day, 1)) * (30 - day);

  const projectedEnd =
    spendProjection - activeCommitments - goalGap;

  // Financial health indicators
  const riskScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        100 -
          (
            Math.max(
              0,
              activeCommitments + goalGap - currentBalance,
            ) /
            STARTING_BUDGET
          ) *
            100 -
          (safeDaily < 150 ? 20 : safeDaily < 250 ? 10 : 0) -
          (projectedEnd < 0
            ? 25
            : projectedEnd < 1000
              ? 10
              : 0),
      ),
    ),
  );

  const healthLabel =
    riskScore >= 75
      ? 'Looking steady'
      : riskScore >= 50
        ? 'Needs attention'
        : 'Tight month';

  const riskLabel =
    safeDaily < 100 ||
    plannedFlexibleMoney < 0 ||
    projectedEnd < 0
      ? 'High'
      : safeDaily < 250 || projectedEnd < 1000
        ? 'Moderate'
        : 'Low';

  // Expenses grouped by category
  const categoryTotals = useMemo(
    () =>
      categories
        .map(category => ({
          category,
          amount: transactions
            .filter(
              t =>
                t.kind === 'expense' &&
                t.category === category,
            )
            .reduce((sum, t) => sum + t.amount, 0),
        }))
        .filter(item => item.amount > 0)
        .sort((a, b) => b.amount - a.amount),
    [transactions],
  );

  const visibleTransactions = transactions
    .filter(t => filter === 'all' || t.category === filter)
    .filter(
      t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => b.date - a.date);

  // Purchase simulator uses the same savings-aware calculations.
  const simValue = Math.max(0, Number(simAmount) || 0);
  const simBalance = currentBalance - simValue;

  const simSpendable =
    simBalance - activeCommitments - goalGap;

  const simDaily = simSpendable / remainingDays;

  
const simProjection =
  simBalance -
  ((paidExpenses + simValue) / Math.max(day, 1)) *
    (30 - day) -
  activeCommitments -
  goalGap;


  const simRisk =
    simSpendable < 0 ||
    simDaily < 100 ||
    simProjection < 0
      ? 'High'
      : simDaily < 250 || simProjection < 1000
        ? 'Moderate'
        : 'Low';

  const notify = (message: string) => setToast(message);

  const addTransaction = (
    title: string,
    amount: number,
    category: Category,
    kind: 'expense' | 'income',
  ) => {
    if (
      !title.trim() ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      notify('Enter a description and an amount greater than ₹0.');
      return false;
    }

    setTransactions(prev => [
      {
        id: crypto.randomUUID(),
        title: title.trim(),
        amount,
        category,
        date: day,
        kind,
      },
      ...prev,
    ]);

    setAddOpen(false);
    setNewTitle('');
    setNewAmount('');
    setNewKind('expense');

    notify(
      kind === 'expense'
        ? 'Expense added to your month.'
        : 'Income added to your month.',
    );

    return true;
  };

  const applySimulation = () => {
    if (!simTitle.trim() || simValue <= 0) {
      notify('Add a name and amount to test this decision.');
      return;
    }

    if (simValue > currentBalance) {
      notify(
        'This expense is larger than your current balance. Try a smaller amount.',
      );
      return;
    }

    addTransaction(
      simTitle,
      simValue,
      simCategory,
      'expense',
    );

    setSimOpen(false);
    setSimAmount('450');
    setSimTitle('A little treat');
    setSimCategory('Shopping');
  };

  const toggleCommitment = (id: string) =>
    setCommitments(prev =>
      prev.map(c =>
        c.id === id ? { ...c, active: !c.active } : c,
      ),
    );

  const resetDemo = () => {
    if (
      !window.confirm(
        'Reset all demo data to the original ₹10,000 month?',
      )
    ) {
      return;
    }

    setTransactions(seedTransactions);
    setCommitments(seedCommitments);
    setGoal({
      name: 'Emergency cushion',
      target: 2000,
      saved: 650,
    });
    setDay(INITIAL_DAY);
    setFilter('all');
    setSearch('');
    notify('Demo data restored. Your planner is fresh.');
  };

  const downloadCsv = () => {
    const lines = [
      [
        'Date (day)',
        'Description',
        'Category',
        'Type',
        'Amount (INR)',
      ],
      ...transactions.map(t => [
        String(t.date),
        t.title,
        t.category,
        t.kind,
        String(t.amount),
      ]),
    ];

    const csv = lines
      .map(row =>
        row
          .map(cell => `"${cell.replaceAll('"', '""')}"`)
          .join(','),
      )
      .join('\n');

    const url = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv;charset=utf-8;' }),
    );

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'monthwise-transactions.csv';
    anchor.click();

    URL.revokeObjectURL(url);
    notify('Your CSV export is ready.');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#top" aria-label="Monthwise home">
          <span className="brand-mark">
            <Wallet size={21} strokeWidth={2.5} />
          </span>
          <span>
            monthwise<span className="brand-period">.</span>
            <small>YOUR MONEY, LESS STRESS</small>
          </span>
        </a>

        <div className="workspace-label">YOUR SPACE</div>

        <nav className="nav-list" aria-label="Main navigation">
          <button
            className={`nav-item ${tab === 'overview' ? 'active' : ''}`}
            onClick={() => setTab('overview')}
          >
            <LayoutDashboard size={18} /> Overview <span className="nav-dot" />
          </button>

          <button
            className={`nav-item ${tab === 'activity' ? 'active' : ''}`}
            onClick={() => setTab('activity')}
          >
            <Activity size={18} /> Activity
          </button>

          <button
            className={`nav-item ${tab === 'goals' ? 'active' : ''}`}
            onClick={() => setTab('goals')}
          >
            <Goal size={18} /> Goals & bills
          </button>
        </nav>

        <div className="sidebar-spacer" />

        <div className="sidebar-tip">
          <div className="tip-orb"><Lightbulb size={17} /></div>
          <p className="tip-title">Small choices add up.</p>
          <p className="tip-copy">
            Pause before you purchase. Future-you will thank you.
          </p>
          <button
            onClick={() => setSimOpen(true)}
            className="text-link"
          >
            Try the money simulator <ArrowRight size={14} />
          </button>
        </div>

        <div className="profile-row">
          <div className="avatar">S</div>
          <div className="profile-text">
            <strong>Your month</strong>
            <span>Personal budget</span>
          </div>
          <button
            className="icon-button small"
            aria-label="Reset demo data"
            onClick={resetDemo}
          >
            <Settings2 size={17} />
          </button>
        </div>
      </aside>

      <main className="main-area" id="top">
        <header className="topbar">
          <div className="crumb">
            My money <span>/</span>{' '}
            <strong>
              {tab === 'overview'
                ? 'Overview'
                : tab === 'activity'
                  ? 'Activity'
                  : 'Goals & bills'}
            </strong>
          </div>

          <div className="top-actions">
            <div className="month-picker">
              <CalendarDays size={15} />
              <span>30-day plan</span>
              <ChevronDown size={14} />
            </div>
            <button
              className="icon-button notification"
              aria-label="Budget tips"
            >
              <Bell size={18} />
              <i />
            </button>
            <div className="avatar top-avatar">S</div>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-dot" /> YOUR MONEY CHECK-IN
              </div>
              <h1>
                {tab === 'overview'
                  ? 'Make it to month-end.'
                  : tab === 'activity'
                    ? 'Every rupee, accounted for.'
                    : 'Protect what matters.'}
              </h1>
              <p className="subheading">
                A little clarity today makes the rest of the month easier.
              </p>
            </div>

            <div className="day-control">
              <label htmlFor="daySlider">
                YOU'RE ON DAY{' '}
                <strong>{day}<span> / 30</span></strong>
              </label>
              <input
                id="daySlider"
                type="range"
                min="1"
                max="30"
                value={day}
                onChange={e => setDay(Number(e.target.value))}
                aria-label="Current day of the 30-day plan"
              />
              <div className="day-scale">
                <span>Day 1</span>
                <span>{remainingDays} days left</span>
                <span>Day 30</span>
              </div>
            </div>
          </section>

          <section className="hero-card" aria-label="Money status summary">
            <div className="hero-main">
              <div className="hero-label">
                <span className="hero-icon"><Wallet size={16} /></span>
                MONEY LEFT IN YOUR ACCOUNT
              </div>

              <div className="hero-balance">
                {money(currentBalance)}
                <span className="balance-period">of ₹10,000</span>
              </div>

              <div className="budget-track">
                <div
                  className="budget-fill"
                  style={{
                    width: `${Math.max(0, 100 - spentPercent)}%`,
                  }}
                />
              </div>

              <div className="budget-caption">
                <span>{money(paidExpenses)} spent so far</span>
                <strong>{Math.round(100 - spentPercent)}% left</strong>
              </div>
            </div>

            <div className="hero-divider" />

            <div className="hero-insight">
              <div className="insight-icon"><Sparkles size={19} /></div>
              <div>
                <span className="insight-kicker">YOUR DAILY SAFE SPEND</span>
                <div className={`daily-amount ${safeDaily < 0 ? 'negative' : ''}`}>
                  {money(safeDaily)}<small>/ day</small>
                </div>
                <p>
                  {spendable < 0
                    ? 'Your commitments exceed your balance.'
                    : plannedFlexibleMoney < 0
                      ? 'Bills fit, but funding your savings goal exceeds your flexible money.'
                      : `After bills and planned savings, for the next ${remainingDays} days.`}
                </p>
                <button
                  className="hero-link"
                  onClick={() => setSimOpen(true)}
                >
                  Can I afford something? <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="hero-decoration circle-one" />
            <div className="hero-decoration circle-two" />
          </section>

          <div className="metric-grid">
            <MetricCard
              label="Bills to protect"
              value={money(activeCommitments)}
              detail={`${commitments.filter(c => c.active).length} active commitments`}
              icon={<ShieldAlert size={18} />}
              tone="orange"
            />
            <MetricCard
              label="Projected month-end"
              value={money(projectedEnd)}
              detail={
                projectedEnd < 0
                  ? 'Your current pace may overspend.'
                  : 'If this pace continues'
              }
              icon={<TrendingDown size={18} />}
              tone="purple"
            />
            <MetricCard
              label="Savings goal"
              value={`${Math.round(
                Math.min(100, (goal.saved / Math.max(goal.target, 1)) * 100),
              )}%`}
              detail={`${money(goal.saved)} of ${money(goal.target)} saved`}
              icon={<Goal size={18} />}
              tone="green"
            />
          </div>

          <div className="section-heading">
            <div>
              <h2>
                {tab === 'overview'
                  ? 'Your month at a glance'
                  : tab === 'activity'
                    ? 'Your activity'
                    : 'Goals & commitments'}
              </h2>
              <p>
                {tab === 'overview'
                  ? 'A snapshot of where your money is going.'
                  : tab === 'activity'
                    ? 'Review and search the money moving in and out.'
                    : 'Plan ahead for the things you need and want.'}
              </p>
            </div>

            {(tab === 'overview' || tab === 'activity') && (
              <button
                className="button button-primary"
                onClick={() => setAddOpen(true)}
              >
                <Plus size={17} /> Add transaction
              </button>
            )}
          </div>

          {tab === 'overview' && (
            <>
              <div className="dashboard-grid">
                <section className="panel spending-panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Spending breakdown</h3>
                      <p>What you've spent, by category</p>
                    </div>
                    <span className="panel-pill">This month</span>
                  </div>

                  <div className="spending-content">
                    <div className="donut-wrap">
                      <div
                        className="donut"
                        style={{
                          background: `conic-gradient(${
                            categoryTotals.length
                              ? categoryTotals
                                  .map((item, index) => {
                                    const previous = categoryTotals
                                      .slice(0, index)
                                      .reduce(
                                        (sum, x) => sum + x.amount,
                                        0,
                                      );
                                    const current = categoryTotals
                                      .slice(0, index + 1)
                                      .reduce(
                                        (sum, x) => sum + x.amount,
                                        0,
                                      );
                                    return `${categoryColor[item.category]} ${
                                      (previous / Math.max(paidExpenses, 1)) *
                                      100
                                    }% ${
                                      (current / Math.max(paidExpenses, 1)) *
                                      100
                                    }%`;
                                  })
                                  .join(', ')
                              : '#e9eaf1 0% 100%'
                          })`,
                        }}
                      >
                        <div className="donut-hole">
                          <strong>{money(paidExpenses)}</strong>
                          <span>total spent</span>
                        </div>
                      </div>
                      <div className="donut-note">
                        <span className="dot-muted" /> of {money(STARTING_BUDGET)} budget
                      </div>
                    </div>

                    <div className="category-legend">
                      {(categoryTotals.length
                        ? categoryTotals.slice(0, 5)
                        : [{ category: 'Food' as Category, amount: 0 }]
                      ).map(item => (
                        <div className="legend-row" key={item.category}>
                          <span className="legend-name">
                            <i style={{ background: categoryColor[item.category] }} />
                            {item.category}
                          </span>
                          <span className="legend-amount">
                            {money(item.amount)}
                          </span>
                          <span className="legend-pct">
                            {Math.round(
                              (item.amount / Math.max(paidExpenses, 1)) * 100,
                            )}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="panel-bottom-note">
                    <span className="note-icon"><Lightbulb size={14} /></span>
                    <span>
                      {categoryTotals[0]
                        ? `${categoryTotals[0].category} is your biggest expense category so far.`
                        : 'Add a transaction to see your spending breakdown.'}
                    </span>
                  </div>
                </section>

                <section className="panel forecast-panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Will you make it?</h3>
                      <p>A simple forecast based on your current pace</p>
                    </div>
                    <span className={`status-pill ${projectedEnd >= 0 ? 'good' : 'bad'}`}>
                      <span />
                      {projectedEnd >= 0 ? 'On watch' : 'At risk'}
                    </span>
                  </div>

                  <div className="forecast-value-row">
                    <div>
                      <span className="forecast-caption">
                        ESTIMATED LEFT AT DAY 30
                      </span>
                      <div className={`forecast-value ${projectedEnd < 0 ? 'negative' : ''}`}>
                        {money(projectedEnd)}
                      </div>
                    </div>
                    <div className="forecast-icon"><TrendingDown size={22} /></div>
                  </div>

                  <div
                    className="forecast-chart"
                    aria-label="Illustrative projected balance trend"
                  >
                    <div className="chart-y-labels">
                      <span>₹10k</span>
                      <span>₹5k</span>
                      <span>₹0</span>
                    </div>

                    <div className="chart-plot">
                      <div className="chart-gridline one" />
                      <div className="chart-gridline two" />
                      <div className="chart-gridline three" />

                      <svg
                        viewBox="0 0 360 116"
                        preserveAspectRatio="none"
                        role="img"
                        aria-label="Projected balance trends downward over the month"
                      >
                        <defs>
                          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#7261ee" stopOpacity=".22" />
                            <stop offset="100%" stopColor="#7261ee" stopOpacity="0" />
                          </linearGradient>
                        </defs>

                        <path
                          d={`M 0 18 C 42 27, 48 32, 82 36 S 120 56, 157 58 S 195 72, 235 81 S 310 ${
                            projectedEnd < 0 ? 112 : 91
                          }, 360 ${
                            Math.max(
                              12,
                              Math.min(111, 108 - Math.max(0, projectedEnd) / 10000 * 90),
                            )
                          } L 360 116 L 0 116 Z`}
                          fill="url(#areaFill)"
                        />

                        <path
                          d={`M 0 18 C 42 27, 48 32, 82 36 S 120 56, 157 58 S 195 72, 235 81 S 310 ${
                            projectedEnd < 0 ? 112 : 91
                          }, 360 ${
                            Math.max(
                              12,
                              Math.min(111, 108 - Math.max(0, projectedEnd) / 10000 * 90),
                            )
                          }`}
                          fill="none"
                          stroke="#6d5ce7"
                          strokeWidth="2.5"
                          vectorEffect="non-scaling-stroke"
                          strokeLinecap="round"
                        />

                        <circle
                          cx="360"
                          cy={Math.max(
                            12,
                            Math.min(111, 108 - Math.max(0, projectedEnd) / 10000 * 90),
                          )}
                          r="4.5"
                          fill="#fff"
                          stroke="#6d5ce7"
                          strokeWidth="2.5"
                          vectorEffect="non-scaling-stroke"
                        />
                      </svg>

                      <div className="chart-x-labels">
                        <span>Day 1</span>
                        <span>Today · {day}</span>
                        <span>Day 30</span>
                      </div>
                    </div>
                  </div>

                  <div className="forecast-footer">
                    <div><span className="tiny-indicator purple" /> Current pace</div>
                    <div><span className="tiny-indicator gray" /> After bills & goal savings</div>
                  </div>

                  <button
                    className="forecast-action"
                    onClick={() => setSimOpen(true)}
                  >
                    Test a spending decision <ArrowRight size={15} />
                  </button>
                </section>
              </div>

              <div className="lower-grid">
                <section className="panel transactions-panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Recent activity</h3>
                      <p>Your latest money moves</p>
                    </div>
                    <button className="subtle-link" onClick={() => setTab('activity')}>
                      View all <ArrowRight size={14} />
                    </button>
                  </div>

                  <TransactionList
                    transactions={transactions
                      .slice()
                      .sort((a, b) => b.date - a.date)
                      .slice(0, 5)}
                  />
                </section>

                <section className="panel commitments-panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Coming up</h3>
                      <p>Commitments you shouldn't forget</p>
                    </div>
                    <button
                      className="icon-button small"
                      aria-label="Manage bills"
                      onClick={() => setTab('goals')}
                    >
                      <ArrowRight size={17} />
                    </button>
                  </div>

                  <div className="commitment-list">
                    {commitments
                      .filter(c => c.active)
                      .slice(0, 3)
                      .map(c => (
                        <div className="commitment-row" key={c.id}>
                          <div className="commitment-icon">{c.icon}</div>
                          <div className="commitment-info">
                            <strong>{c.name}</strong>
                            <span>{c.due}</span>
                          </div>
                          <strong className="commitment-amount">{money(c.amount)}</strong>
                        </div>
                      ))}

                    {commitments.every(c => !c.active) && (
                      <EmptyState text="No active commitments. Add a bill in Goals & bills." />
                    )}
                  </div>

                  <div className="commitment-total">
                    <span>Protected for bills</span>
                    <strong>{money(activeCommitments)}</strong>
                  </div>

                  <button className="manage-bills" onClick={() => setTab('goals')}>
                    Manage commitments <ArrowRight size={14} />
                  </button>
                </section>
              </div>

              <section className={`health-banner ${riskLabel.toLowerCase()}`}>
                <div className="health-symbol"><Gauge size={22} /></div>
                <div className="health-copy">
                  <span>YOUR FINANCIAL PULSE</span>
                  <h3>{healthLabel}</h3>
                  <p>
                    {safeDaily < 150
                      ? 'Your flexible money is limited. Protect essentials and test purchases before committing.'
                      : 'You have a plan. Keep checking the impact of new spending before you commit.'}
                  </p>
                </div>
                <div className="health-score">
                  <strong>{riskScore}</strong>
                  <span>/ 100</span>
                  <div className="health-progress">
                    <i style={{ width: `${riskScore}%` }} />
                  </div>
                  <small>{riskLabel} spending risk</small>
                </div>
              </section>
            </>
          )}

          {tab === 'activity' && (
            <section className="panel all-activity-panel">
              <div className="activity-toolbar">
                <div className="search-box">
                  <span>⌕</span>
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search transactions..."
                    aria-label="Search transactions"
                  />
                </div>

                <select
                  value={filter}
                  onChange={e => setFilter(e.target.value as 'all' | Category)}
                  aria-label="Filter transactions by category"
                >
                  <option value="all">All categories</option>
                  {categories.map(c => <option value={c} key={c}>{c}</option>)}
                </select>

                <button className="button button-secondary" onClick={downloadCsv}>
                  <Download size={15} /> Export CSV
                </button>
              </div>

              <div className="activity-summary">
                <div><span>Money out</span><strong>{money(paidExpenses)}</strong></div>
                <div><span>Money in</span><strong className="positive-text">{money(extraIncome)}</strong></div>
                <div>
                  <span>Transactions</span>
                  <strong>{transactions.filter(t => t.amount > 0).length}</strong>
                </div>
              </div>

              <TransactionList
                transactions={visibleTransactions}
                onDelete={id => {
                  setTransactions(prev => prev.filter(t => t.id !== id));
                  notify('Transaction removed.');
                }}
                showDelete
                emptyText="No matching transactions. Try a different search or category."
              />
            </section>
          )}

          {tab === 'goals' && (
            <div className="goals-layout">
              <section className="panel goal-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Your savings goal</h3>
                    <p>Make a cushion for unexpected moments</p>
                  </div>
                  <div className="goal-icon-large"><Goal size={23} /></div>
                </div>

                <div className="goal-balance">
                  {money(goal.saved)}
                  <span> saved of {money(goal.target)}</span>
                </div>

                <div className="goal-progress">
                  <div
                    style={{
                      width: `${Math.min(
                        100,
                        (goal.saved / Math.max(goal.target, 1)) * 100,
                      )}%`,
                    }}
                  />
                </div>

                <div className="goal-progress-labels">
                  <span>
                    {Math.round(
                      Math.min(100, (goal.saved / Math.max(goal.target, 1)) * 100),
                    )}% complete
                  </span>
                  <span>{money(goalGap)} to go</span>
                </div>

                <div className="goal-controls">
                  <label htmlFor="goalTarget">Target amount</label>
                  <div className="goal-target-input">
                    <span>₹</span>
                    <input
                      id="goalTarget"
                      type="number"
                      min="500"
                      max="50000"
                      step="100"
                      value={goal.target}
                      onChange={e =>
                        setGoal(g => ({
                          ...g,
                          target: Math.max(
                            500,
                            Math.min(50000, Number(e.target.value) || 500),
                          ),
                        }))
                      }
                    />
                  </div>

                  <label htmlFor="goalSaved">Already saved</label>
                  <div className="goal-target-input">
                    <span>₹</span>
                    <input
                      id="goalSaved"
                      type="number"
                      min="0"
                      max="50000"
                      step="50"
                      value={goal.saved}
                      onChange={e =>
                        setGoal(g => ({
                          ...g,
                          saved: Math.max(
                            0,
                            Math.min(50000, Number(e.target.value) || 0),
                          ),
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="goal-nudge">
                  <Lightbulb size={17} />
                  <span>
                    {goalGap === 0
                      ? 'Goal reached! Nice work protecting your future.'
                      : `Saving ${money(Math.ceil(goalPace))} per remaining day would close the gap by day 30.`}
                  </span>
                </div>
              </section>

              <section className="panel full-commitments-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Monthly commitments</h3>
                    <p>Toggle bills to see how they change your safe spend</p>
                  </div>
                  <span className="panel-pill">
                    {commitments.filter(c => c.active).length} active
                  </span>
                </div>

                <div className="commitment-manager">
                  {commitments.map(c => (
                    <div
                      className={`managed-commitment ${c.active ? '' : 'inactive'}`}
                      key={c.id}
                    >
                      <div className="commitment-icon">{c.icon}</div>
                      <div className="commitment-info">
                        <strong>{c.name}</strong>
                        <span>{c.category} · {c.due}</span>
                      </div>
                      <strong className="commitment-amount">{money(c.amount)}</strong>
                      <button
                        className={`toggle ${c.active ? 'on' : ''}`}
                        role="switch"
                        aria-checked={c.active}
                        aria-label={`${c.active ? 'Remove' : 'Include'} ${c.name} in commitments`}
                        onClick={() => {
                          toggleCommitment(c.id);
                          notify(
                            `${c.name} ${
                              c.active ? 'excluded from' : 'included in'
                            } protected bills.`,
                          );
                        }}
                      >
                        <span />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="commitment-total">
                  <span>Protected money</span>
                  <strong>{money(activeCommitments)}</strong>
                </div>

                <div className="safe-spend-result">
                  <span>Flexible money after bills & goal savings</span>
                  <strong className={plannedFlexibleMoney < 0 ? 'negative' : ''}>
                    {money(plannedFlexibleMoney)}
                  </strong>
                  <small>
                    {money(safeDaily)} per day for {remainingDays} days
                  </small>
                </div>
              </section>

              <section className="panel risk-panel">
                <div className="risk-panel-icon"><ShieldAlert size={20} /></div>
                <div>
                  <h3>Unexpected expense buffer</h3>
                  <p>
                    Try an expense in the simulator before you spend. It will
                    update your balance, daily allowance, and end-of-month
                    forecast without changing your actual ledger.
                  </p>
                  <button
                    className="button button-primary"
                    onClick={() => setSimOpen(true)}
                  >
                    Open decision simulator <ArrowRight size={15} />
                  </button>
                </div>
              </section>
            </div>
          )}

          <footer className="page-footer">
            <span>
              Made for real-life money moments{' '}
              <span className="footer-heart">♥</span>
            </span>
            <span>
              <CircleHelp size={13} />
              Estimates use your entered data. For planning and learning, not financial advice.
            </span>
            <button onClick={resetDemo}>
              <RotateCcw size={12} /> Reset demo
            </button>
          </footer>
        </div>
      </main>

      {simOpen && (
        <div
          className="overlay"
          role="presentation"
          onMouseDown={e => {
            if (e.target === e.currentTarget) setSimOpen(false);
          }}
        >
          <section
            className="drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="simTitle"
          >
            <div className="drawer-top">
              <div className="drawer-icon"><Zap size={20} /></div>
              <button
                className="icon-button"
                onClick={() => setSimOpen(false)}
                aria-label="Close decision simulator"
              >
                <X size={19} />
              </button>
            </div>

            <div className="drawer-eyebrow">THE WHAT-IF STUDIO</div>
            <h2 id="simTitle">
              Before you buy, <span>try it here.</span>
            </h2>
            <p className="drawer-intro">
              Test a money decision. See the ripple effect on your month before
              you spend a single rupee.
            </p>

            <div className="sim-form">
              <label htmlFor="simTitleInput">
                What are you thinking of buying?
              </label>
              <input
                id="simTitleInput"
                value={simTitle}
                onChange={e => setSimTitle(e.target.value)}
                placeholder="e.g. New headphones"
                maxLength={60}
              />

              <div className="sim-fields">
                <div>
                  <label htmlFor="simAmount">Cost (₹)</label>
                  <div className="amount-input">
                    <span>₹</span>
                    <input
                      id="simAmount"
                      value={simAmount}
                      onChange={e =>
                        setSimAmount(
                          e.target.value.replace(/[^0-9.]/g, ''),
                        )
                      }
                      inputMode="decimal"
                      type="number"
                      min="0"
                      max="100000"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="simCategory">Category</label>
                  <select
                    id="simCategory"
                    value={simCategory}
                    onChange={e =>
                      setSimCategory(e.target.value as Category)
                    }
                  >
                    {categories.map(c => (
                      <option value={c} key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="quick-amounts">
                <span>Quick test</span>
                {[100, 250, 500, 1000].map(n => (
                  <button
                    className={Number(simAmount) === n ? 'selected' : ''}
                    onClick={() => setSimAmount(String(n))}
                    key={n}
                  >
                    {money(n)}
                  </button>
                ))}
              </div>
            </div>

            <div className="simulation-results">
              <div className="sim-results-header">
                <span>THE RIPPLE EFFECT</span>
                <span className="live-badge"><i /> LIVE PREVIEW</span>
              </div>

              <div className="sim-result-row">
                <div className="sim-result-icon"><Wallet size={16} /></div>
                <div>
                  <span>Balance after purchase</span>
                  <small>Right now: {money(currentBalance)}</small>
                </div>
                <strong className={simBalance < 0 ? 'negative' : ''}>
                  {money(simBalance)}
                </strong>
              </div>

              <div className="sim-result-row">
                <div className="sim-result-icon"><Gauge size={16} /></div>
                <div>
                  <span>New daily safe spend</span>
                  <small>Was {money(safeDaily)} / day</small>
                </div>
                <strong className={simDaily < 0 ? 'negative' : ''}>
                  {money(simDaily)}<small>/day</small>
                </strong>
              </div>

              <div className="sim-result-row">
                <div className="sim-result-icon"><TrendingDown size={16} /></div>
                <div>
                  <span>Projected month-end</span>
                  <small>After bills & goal savings</small>
                </div>
                <strong className={simProjection < 0 ? 'negative' : ''}>
                  {money(simProjection)}
                </strong>
              </div>

              <div className={`sim-warning ${simRisk.toLowerCase()}`}>
                <ShieldAlert size={17} />
                <div>
                  <strong>{simRisk} spending risk</strong>
                  <p>
                    {simSpendable < 0
                      ? 'This leaves too little money for protected bills and your remaining savings goal. Consider delaying or reducing the cost.'
                      : simDaily < 100
                        ? 'This purchase would leave very little flexible money per day. Consider a cheaper option.'
                        : simDaily < 250
                          ? 'This is possible, but your daily allowance gets tighter. Check whether it is worth the trade-off.'
                          : 'Your plan can absorb this purchase while keeping a reasonable daily allowance.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="drawer-actions">
              <button
                className="button button-secondary"
                onClick={() => setSimOpen(false)}
              >
                Not now
              </button>
              <button
                className="button button-primary"
                onClick={applySimulation}
                disabled={
                  !simTitle.trim() ||
                  simValue <= 0 ||
                  simValue > currentBalance
                }
              >
                Record this expense <ArrowRight size={16} />
              </button>
            </div>

            <p className="drawer-disclaimer">
              A simulation never changes your ledger until you choose
              “Record this expense.”
            </p>
          </section>
        </div>
      )}

      {addOpen && (
        <div
          className="overlay"
          role="presentation"
          onMouseDown={e => {
            if (e.target === e.currentTarget) setAddOpen(false);
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="addTitle"
          >
            <div className="modal-heading">
              <div>
                <div className="drawer-eyebrow">UPDATE YOUR MONTH</div>
                <h2 id="addTitle">Add a transaction</h2>
                <p>Keep the plan honest. Every little entry helps.</p>
              </div>
              <button
                className="icon-button"
                onClick={() => setAddOpen(false)}
                aria-label="Close add transaction"
              >
                <X size={19} />
              </button>
            </div>

            <div className="kind-switch">
              <button
                className={newKind === 'expense' ? 'chosen' : ''}
                onClick={() => setNewKind('expense')}
              >
                <ArrowUpRight size={16} /> Money out
              </button>
              <button
                className={newKind === 'income' ? 'chosen income-chosen' : ''}
                onClick={() => setNewKind('income')}
              >
                <ArrowDownLeft size={16} /> Money in
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                addTransaction(
                  newTitle,
                  Number(newAmount),
                  newCategory,
                  newKind,
                );
              }}
            >
              <label htmlFor="newTitle">Description</label>
              <input
                autoFocus
                id="newTitle"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g. Lunch with friends"
                maxLength={60}
                required
              />

              <div className="sim-fields">
                <div>
                  <label htmlFor="newAmount">Amount (₹)</label>
                  <div className="amount-input">
                    <span>₹</span>
                    <input
                      id="newAmount"
                      type="number"
                      min="1"
                      step="1"
                      value={newAmount}
                      onChange={e => setNewAmount(e.target.value)}
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="newCategory">Category</label>
                  <select
                    id="newCategory"
                    value={newCategory}
                    onChange={e =>
                      setNewCategory(e.target.value as Category)
                    }
                  >
                    {categories.map(c => (
                      <option value={c} key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setAddOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="button button-primary">
                  <Plus size={16} /> Save transaction
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {toast && (
        <div className="toast" role="status">
          <span><Check size={16} /></span>
          {toast}
        </div>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  tone: string;
}) {
  return (
    <section className="metric-card">
      <div className={`metric-icon ${tone}`}>{icon}</div>
      <div className="metric-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
      <div className="metric-corner"><ArrowUpRight size={15} /></div>
    </section>
  );
}

function TransactionList({
  transactions,
  onDelete,
  showDelete = false,
  emptyText = 'Your transaction list is empty.',
}: {
  transactions: Transaction[];
  onDelete?: (id: string) => void;
  showDelete?: boolean;
  emptyText?: string;
}) {
  if (!transactions.length) {
    return <EmptyState text={emptyText} />;
  }

  return (
    <div className="transaction-list">
      {transactions.map(t => (
        <div className="transaction-row" key={t.id}>
          <div className={`transaction-icon ${t.kind === 'income' ? 'income' : ''}`}>
            {t.kind === 'income'
              ? <ArrowDownLeft size={17} />
              : <span>{categoryIcon[t.category]}</span>}
          </div>

          <div className="transaction-detail">
            <strong>{t.title}</strong>
            <span>{t.category} <i /> Day {t.date}</span>
          </div>

          <div className={`transaction-amount ${t.kind === 'income' ? 'income' : ''}`}>
            {t.kind === 'income' ? '+' : '−'}{money(t.amount)}
          </div>

          {showDelete && onDelete && (
            <button
              className="icon-button delete-transaction"
              aria-label={`Delete ${t.title}`}
              onClick={() => onDelete(t.id)}
            >
              <X size={15} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="empty-state">
      <div>✳</div>
      <p>{text}</p>
    </div>
  );
}

export default App;