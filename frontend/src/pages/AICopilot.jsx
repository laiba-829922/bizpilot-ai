import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  Bot,
  Plus,
  Send,
  Trash2,
  MessageSquare,
  Sparkles,
  TrendingUp,
  ShoppingCart,
  Wallet,
  ChartNoAxesCombined,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Lightbulb,
  RefreshCw,
  AlertCircle,
  ArrowUpRight,
  LoaderCircle,
} from "lucide-react";

import Sidebar from "../components/Sidebar";

// ==========================================
// CONSTANTS
// ==========================================

const CHAT_STORAGE_KEY = "bizpilot_ai_chats";
const EXPENSE_STORAGE_KEY = "bizpilot_expenses";
const ORDERS_API = "https://bizpilot-api.vercel.app/api/orders/";

const SUGGESTIONS = [
  {
    icon: TrendingUp,
    title: "Analyze Revenue",
    question: "What is my total revenue?",
  },
  {
    icon: ShoppingCart,
    title: "Check Orders",
    question: "How many orders have I received?",
  },
  {
    icon: Wallet,
    title: "Track Expenses",
    question: "What are my total expenses?",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Calculate Profit",
    question: "What is my net profit?",
  },
];

// ==========================================
// HELPERS
// ==========================================

function formatMoney(value) {
  return `Rs. ${Number(value || 0).toLocaleString("en-PK", {
    maximumFractionDigits: 2,
  })}`;
}

function loadChats() {
  try {
    const saved = localStorage.getItem(CHAT_STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadExpenses() {
  try {
    const saved = localStorage.getItem(EXPENSE_STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function createChat() {
  return {
    id: crypto.randomUUID(),
    title: "New Chat",
    createdAt: new Date().toISOString(),
    messages: [],
  };
}

function getTime(date) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleTimeString("en-PK", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getOrdersArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

// ==========================================
// LOCAL BUSINESS RESPONSES
// ==========================================

function generateLocalResponse(question, business, ordersError) {
  const text = question.toLowerCase();

  if (
    text.includes("revenue") ||
    text.includes("sales") ||
    text.includes("income")
  ) {
    if (ordersError) {
      return "Revenue information is currently unavailable because the orders API could not be loaded.";
    }

    return `Your total completed-order revenue is ${formatMoney(
      business.revenue
    )}.

Completed Orders: ${business.completedOrders}
Total Orders: ${business.totalOrders}

This calculation is based on your available Django order records.`;
  }

  if (text.includes("order") || text.includes("purchase")) {
    if (ordersError) {
      return "Order information is currently unavailable. Please check your Django backend and login session.";
    }

    return `Here is your order performance:

Total Orders: ${business.totalOrders}
Completed: ${business.completedOrders}
Pending: ${business.pendingOrders}
Processing: ${business.processingOrders}
Cancelled: ${business.cancelledOrders}

These figures are calculated from your available order records.`;
  }

  if (
    text.includes("expense") ||
    text.includes("spending") ||
    text.includes("cost")
  ) {
    return `Your total recorded business expenses are ${formatMoney(
      business.expenses
    )}.

Total Expense Records: ${business.expenseRecords}

Expenses are currently stored locally in this browser.`;
  }

  if (text.includes("profit") || text.includes("loss")) {
    if (ordersError) {
      return "Estimated balance is unavailable because the orders API could not be loaded.";
    }

    return `Business Financial Summary

Completed-Order Revenue: ${formatMoney(business.revenue)}
Recorded Expenses: ${formatMoney(business.expenses)}

Estimated Balance: ${formatMoney(
      business.revenue - business.expenses
    )}

Note: This is revenue minus recorded expenses, not a complete accounting net-profit calculation.`;
  }

  return `Your message has been saved.

The real AI backend is not connected yet.

For now, I can calculate basic information about your revenue, orders, expenses, and estimated balance using available business records.`;
}

// ==========================================
// BUSINESS STAT CARD
// ==========================================

function OverviewCard({ title, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-outline bg-background p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-muted-text">{title}</p>

        <Icon size={18} className="shrink-0 text-brand" />
      </div>

      <h3 className="mt-3 break-words text-xl font-extrabold text-primary-text">
        {value}
      </h3>
    </div>
  );
}

// ==========================================
// CHAT HISTORY PANEL
// Defined outside the main component so
// it does not remount on every render.
// ==========================================

function HistoryPanel({
  chats,
  activeChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
}) {
  return (
    <>
      {/* FIXED HISTORY HEADER */}
      <div className="shrink-0 border-b border-outline p-4">
        <h2 className="text-sm font-bold text-primary-text">
          Chat History
        </h2>

        <button
          type="button"
          onClick={onNewChat}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-extrabold text-brand-foreground transition hover:brightness-95"
        >
          <Plus size={18} />
          New Chat
        </button>
      </div>

      {/* INDEPENDENTLY SCROLLABLE HISTORY */}
      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain p-3">
        {chats.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-text">
            No conversations yet.
          </p>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              className={`group flex items-center gap-2 rounded-xl px-2 py-1 transition ${
                activeChatId === chat.id
                  ? "bg-brand-soft"
                  : "hover:bg-elevated"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectChat(chat.id)}
                className="flex min-w-0 flex-1 items-center gap-2 py-2 text-left"
              >
                <MessageSquare
                  size={16}
                  className="shrink-0 text-muted-text"
                />

                <span className="truncate text-xs font-medium">
                  {chat.title}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onDeleteChat(chat.id)}
                aria-label={`Delete ${chat.title}`}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-text transition hover:bg-red-500/10 hover:text-red-500"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function AICopilot() {
  // CHAT STATE
  const [chats, setChats] = useState(loadChats);
  const [activeChatId, setActiveChatId] = useState(null);
  const [input, setInput] = useState("");

  // UI STATE
  // Chat History is CLOSED by default.
  const [historyOpen, setHistoryOpen] = useState(false);

  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);

  // BUSINESS STATE
  const [orders, setOrders] = useState([]);
  const [ordersError, setOrdersError] = useState("");
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [expenses, setExpenses] = useState(loadExpenses);
  const [storageError, setStorageError] = useState("");

  // REFS
  const messagesContainerRef = useRef(null);
  const textareaRef = useRef(null);

  // ==========================================
  // ACTIVE CHAT
  // ==========================================

  const activeChat = useMemo(() => {
    return chats.find((chat) => chat.id === activeChatId);
  }, [chats, activeChatId]);

  // ==========================================
  // SAVE CHAT HISTORY
  // ==========================================

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chats));
      setStorageError("");
    } catch {
      setStorageError("Unable to save chat history.");
    }
  }, [chats]);

  // ==========================================
  // AUTO SCROLL MESSAGES
  // ==========================================

  useEffect(() => {
    const container = messagesContainerRef.current;

    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [activeChatId, activeChat?.messages?.length]);

  // ==========================================
  // FETCH ORDERS
  // ==========================================

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError("");

    try {
      const token = sessionStorage.getItem("access_token");

      if (!token) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(ORDERS_API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Orders API error: ${response.status}`);
      }

      const data = await response.json();

      if (data?.next) {
        setOrdersError(
          "Only the first page of orders is loaded. Totals may be incomplete."
        );
      }

      setOrders(getOrdersArray(data));
    } catch (error) {
      setOrders([]);
      setOrdersError(error.message || "Unable to load orders.");
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ==========================================
  // BUSINESS CALCULATIONS
  // ==========================================

  const business = useMemo(() => {
    const completed = orders.filter(
      (order) => order.status?.toLowerCase() === "completed"
    );

    const revenue = completed.reduce(
      (sum, order) => sum + Number(order.amount || 0),
      0
    );

    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + Number(expense.amount || 0),
      0
    );

    return {
      revenue,
      expenses: totalExpenses,
      totalOrders: orders.length,
      completedOrders: completed.length,
      pendingOrders: orders.filter(
        (order) => order.status?.toLowerCase() === "pending"
      ).length,
      processingOrders: orders.filter(
        (order) => order.status?.toLowerCase() === "processing"
      ).length,
      cancelledOrders: orders.filter(
        (order) => order.status?.toLowerCase() === "cancelled"
      ).length,
      expenseRecords: expenses.length,
    };
  }, [orders, expenses]);

  // ==========================================
  // NEW CHAT
  // ==========================================

  function handleNewChat() {
    const chat = createChat();

    setChats((previous) => [chat, ...previous]);
    setActiveChatId(chat.id);
    setInput("");
    setMobileHistoryOpen(false);

    textareaRef.current?.focus();
  }

  // ==========================================
  // DELETE CHAT
  // ==========================================

  function handleDeleteChat(id) {
    const confirmed = window.confirm(
      "Delete this conversation?"
    );

    if (!confirmed) return;

    setChats((previous) =>
      previous.filter((chat) => chat.id !== id)
    );

    if (activeChatId === id) {
      setActiveChatId(null);
    }
  }

  // ==========================================
  // SELECT CHAT
  // ==========================================

  function handleSelectChat(id) {
    setActiveChatId(id);
    setMobileHistoryOpen(false);
  }

  // ==========================================
  // SEND MESSAGE
  // ==========================================

  function handleSend(messageText = input) {
    const message = messageText.trim();

    if (!message) return;

    const chatId = activeChatId || crypto.randomUUID();

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
      createdAt: new Date().toISOString(),
    };

    const assistantMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: generateLocalResponse(
        message,
        business,
        ordersError || (ordersLoading ? "Orders are loading" : "")
      ),
      createdAt: new Date().toISOString(),
    };

    setChats((previous) => {
      const exists = previous.some(
        (chat) => chat.id === chatId
      );

      if (!exists) {
        return [
          {
            id: chatId,
            title:
              message.length > 38
                ? `${message.slice(0, 38)}...`
                : message,
            createdAt: new Date().toISOString(),
            messages: [userMessage, assistantMessage],
          },
          ...previous,
        ];
      }

      return previous.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              title:
                chat.messages.length === 0
                  ? message.slice(0, 38)
                  : chat.title,
              messages: [
                ...chat.messages,
                userMessage,
                assistantMessage,
              ],
            }
          : chat
      );
    });

    setActiveChatId(chatId);
    setInput("");
    setMobileHistoryOpen(false);
  }

  // ==========================================
  // ENTER TO SEND
  // ==========================================

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  // ==========================================
  // REFRESH DATA
  // ==========================================

  function handleRefresh() {
    setExpenses(loadExpenses());
    fetchOrders();
  }

  // ==========================================
  // HISTORY PANEL PROPS
  // ==========================================

  const historyProps = {
    chats,
    activeChatId,
    onNewChat: handleNewChat,
    onSelectChat: handleSelectChat,
    onDeleteChat: handleDeleteChat,
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="flex h-dvh min-w-0 overflow-hidden bg-background text-primary-text">
      {/* EXISTING BIZPILOT SIDEBAR */}
      <Sidebar />

      {/* MAIN AREA */}
      <main className="flex h-full min-h-0 min-w-0 flex-1 overflow-hidden pt-16 lg:pt-0">

        {/* DESKTOP CHAT HISTORY */}
        {historyOpen && (
          <aside className="hidden h-full w-[230px] shrink-0 flex-col overflow-hidden border-r border-outline bg-surface lg:flex xl:w-[250px]">
            <HistoryPanel {...historyProps} />
          </aside>
        )}

        {/* MOBILE CHAT HISTORY OVERLAY */}
        {mobileHistoryOpen && (
          <div className="fixed inset-0 z-[80] flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileHistoryOpen(false)}
              aria-label="Close chat history"
              className="absolute inset-0 bg-black/65"
            />

            <aside className="relative z-10 flex h-full w-[min(85vw,320px)] flex-col overflow-hidden border-r border-outline bg-surface shadow-2xl">
              <HistoryPanel {...historyProps} />
            </aside>
          </div>
        )}

        {/* MAIN CHAT COLUMN */}
        <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">

          {/* TOP TOOLBAR */}
          <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-outline px-4 sm:px-6">

            <div className="flex min-w-0 items-center gap-3">

              {/* SINGLE HISTORY TOGGLE BUTTON */}
              <button
                type="button"
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setMobileHistoryOpen((previous) => !previous);
                  } else {
                    setHistoryOpen((previous) => !previous);
                  }
                }}
                aria-label="Toggle chat history"
                aria-expanded={historyOpen || mobileHistoryOpen}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-text transition hover:bg-elevated hover:text-primary-text"
              >
                {historyOpen || mobileHistoryOpen ? (
                  <PanelLeftClose size={21} />
                ) : (
                  <PanelLeftOpen size={21} />
                )}
              </button>

              <div className="flex min-w-0 items-center gap-2">
                <Sparkles
                  size={19}
                  className="shrink-0 text-brand"
                />

                <h1 className="truncate text-base font-extrabold sm:text-lg">
                  BizPilot AI
                </h1>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">

              {/* NEW CHAT */}
              <button
                type="button"
                onClick={handleNewChat}
                aria-label="New chat"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-text transition hover:bg-elevated hover:text-primary-text"
              >
                <Plus size={21} />
              </button>

              {/* BUSINESS INSIGHTS */}
              <button
                type="button"
                onClick={() => setInsightsOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-outline bg-surface px-3 py-2.5 text-xs font-bold transition hover:bg-elevated sm:px-4 sm:text-sm"
              >
                <ChartNoAxesCombined
                  size={18}
                  className="text-brand"
                />

                <span className="hidden sm:inline">
                  Business Insights
                </span>

                <span className="sm:hidden">
                  Insights
                </span>
              </button>
            </div>
          </header>

          {/* SCROLLABLE MESSAGES AREA */}
          <div
            ref={messagesContainerRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
          >
            {!activeChat || activeChat.messages.length === 0 ? (

              /* WELCOME SCREEN */
              <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col items-center justify-center px-5 py-10 text-center sm:px-8">

                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                  <Sparkles size={31} />
                </div>

                <h2 className="mt-6 text-2xl font-extrabold tracking-tight sm:text-3xl">
                  How can I help your business today?
                </h2>

                <p className="mt-3 max-w-lg text-sm leading-7 text-muted-text">
                  Ask questions about your revenue, orders,
                  expenses, and business performance.
                </p>

                {/* QUICK PROMPTS */}
                <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                  {SUGGESTIONS.map((suggestion) => {
                    const Icon = suggestion.icon;

                    return (
                      <button
                        key={suggestion.title}
                        type="button"
                        onClick={() =>
                          handleSend(suggestion.question)
                        }
                        className="group flex items-center gap-4 rounded-2xl border border-outline bg-surface p-4 text-left transition hover:border-brand hover:bg-elevated"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                          <Icon size={21} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-bold">
                            {suggestion.title}
                          </h3>

                          <p className="mt-1 truncate text-xs text-muted-text">
                            {suggestion.question}
                          </p>
                        </div>

                        <ArrowUpRight
                          size={17}
                          className="shrink-0 text-muted-text transition group-hover:text-brand"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (

              /* CHAT MESSAGES */
              <div className="mx-auto w-full max-w-3xl space-y-7 px-4 py-8 sm:px-8">
                {activeChat.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                        <Bot size={19} />
                      </div>
                    )}

                    <div
                      className={`min-w-0 max-w-[88%] px-4 py-3 sm:max-w-[82%] ${
                        message.role === "user"
                          ? "rounded-2xl bg-elevated text-primary-text"
                          : "text-primary-text"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words text-sm leading-7">
                        {message.content}
                      </p>

                      <p className="mt-2 text-right text-[10px] text-muted-text">
                        {getTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FIXED BOTTOM INPUT */}
          <div className="shrink-0 bg-background px-3 pb-4 pt-3 sm:px-6 sm:pb-5">
            <div className="mx-auto w-full max-w-3xl">

              <div className="flex items-end gap-3 rounded-3xl border border-outline bg-surface p-3 shadow-lg transition focus-within:border-brand">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  onChange={(event) =>
                    setInput(event.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything about your business..."
                  className="max-h-36 min-h-11 min-w-0 flex-1 resize-none bg-transparent px-3 py-3 text-sm text-primary-text outline-none placeholder:text-muted-text"
                />

                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  aria-label="Send message"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send size={19} />
                </button>
              </div>

              <p className="mt-3 text-center text-[11px] text-muted-text">
                Basic business insights mode. AI integration is coming later.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* BUSINESS INSIGHTS DRAWER */}
      {insightsOpen && (
        <div className="fixed inset-0 z-[90] flex justify-end">
          <button
            type="button"
            onClick={() => setInsightsOpen(false)}
            aria-label="Close insights"
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
          />

          <aside className="relative z-10 flex h-full w-full max-w-[390px] flex-col overflow-hidden border-l border-outline bg-surface shadow-2xl">

            {/* DRAWER HEADER */}
            <div className="flex shrink-0 items-center justify-between border-b border-outline p-5">
              <div>
                <div className="flex items-center gap-2">
                  <ChartNoAxesCombined
                    size={20}
                    className="text-brand"
                  />

                  <h2 className="text-lg font-extrabold">
                    Business Insights
                  </h2>
                </div>

                <p className="mt-2 text-xs text-muted-text">
                  Your business performance overview
                </p>
              </div>

              <button
                type="button"
                onClick={() => setInsightsOpen(false)}
                aria-label="Close insights"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-outline text-muted-text hover:text-primary-text"
              >
                <X size={19} />
              </button>
            </div>

            {/* SCROLLABLE INSIGHTS */}
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-5">

              {(ordersError || storageError) && (
                <div className="flex items-start gap-2 rounded-xl border border-outline bg-background p-3 text-xs text-muted-text">
                  <AlertCircle
                    size={17}
                    className="shrink-0 text-brand"
                  />

                  <span>{ordersError || storageError}</span>
                </div>
              )}

              <OverviewCard
                title="Total Revenue"
                value={
                  ordersLoading
                    ? "Loading..."
                    : ordersError
                      ? "Unavailable"
                      : formatMoney(business.revenue)
                }
                icon={TrendingUp}
              />

              <OverviewCard
                title="Total Orders"
                value={
                  ordersLoading
                    ? "Loading..."
                    : ordersError
                      ? "Unavailable"
                      : business.totalOrders
                }
                icon={ShoppingCart}
              />

              <OverviewCard
                title="Total Expenses"
                value={formatMoney(business.expenses)}
                icon={Wallet}
              />

              <OverviewCard
                title="Estimated Balance"
                value={
                  ordersLoading
                    ? "Loading..."
                    : ordersError
                      ? "Unavailable"
                      : formatMoney(
                          business.revenue - business.expenses
                        )
                }
                icon={ChartNoAxesCombined}
              />

              <div className="rounded-2xl border border-outline bg-background p-4">
                <div className="flex items-center gap-2 text-brand">
                  <Lightbulb size={19} />

                  <h3 className="text-sm font-bold">
                    About Your Data
                  </h3>
                </div>

                <p className="mt-3 text-xs leading-6 text-muted-text">
                  Revenue and orders are calculated from Django
                  order records. Expenses are stored locally in
                  this browser. Estimated balance is revenue
                  minus recorded expenses.
                </p>
              </div>
            </div>

            {/* DRAWER FOOTER */}
            <div className="shrink-0 border-t border-outline p-4">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={ordersLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-extrabold text-brand-foreground transition hover:brightness-95 disabled:opacity-50"
              >
                {ordersLoading ? (
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <RefreshCw size={18} />
                )}

                Refresh Business Data
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}