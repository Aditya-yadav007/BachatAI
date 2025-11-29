import { useEffect, useRef, useState } from "react";
import Card from "../../components/ui/Card";
import appConfig from "../../config/appConfig";

const ChatbotPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Initial greeting from bot
  useEffect(() => {
    setMessages([
      {
        id: 1,
        from: "bot",
        text: `Hi, I'm your ${appConfig.appName} assistant. You can ask me about your expenses, budgets, savings or how to improve your financial health.`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }, []);

  // ---------- DUMMY BOT LOGIC (replace later with API) ----------
  const getBotReply = (userText) => {
    const text = userText.toLowerCase();

    if (text.includes("expense") || text.includes("spend")) {
      return "You are spending the most on Food and Shopping. Try reducing these categories by 5–10% and redirect that amount into savings or SIPs.";
    }
    if (text.includes("save") || text.includes("savings")) {
      return "A good rule is to save at least 20% of your income. You can start a monthly SIP and keep an emergency fund equal to 3–6 months of expenses.";
    }
    if (text.includes("budget")) {
      return "You can use the 50/30/20 rule: 50% needs, 30% wants, 20% savings. Set category-wise budgets accordingly in the Budgets section.";
    }
    if (text.includes("investment") || text.includes("invest")) {
      return "Based on a moderate risk profile, you can start with diversified index mutual funds + some safe options like RD/FD. Always read risk documents carefully.";
    }
    if (text.includes("hello") || text.includes("hi")) {
      return "Hello! Ask me things like 'How can I reduce my expenses?' or 'How much should I save every month?'";
    }

    return "Thanks for your question! In the full system, I will analyse your real data and give personalised answers. For now, try asking about expenses, savings, budgets or investments.";
  };
  // --------------------------------------------------------------

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMessage = {
      id: Date.now(),
      from: "user",
      text: input.trim(),
      time,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulate bot thinking
    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        from: "bot",
        text: getBotReply(userMessage.text),
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Chatbot</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Ask {appConfig.appName} anything about your money – expenses, budgets,
          savings, or investment basics.
        </p>
      </div>

      <Card className="h-[520px] flex flex-col">
        {/* Chat area */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.from === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                  msg.from === "user"
                    ? "bg-brand-500 text-white rounded-br-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-sm"
                }`}
              >
                <p>{msg.text}</p>
                <p
                  className={`mt-1 text-[10px] ${
                    msg.from === "user"
                      ? "text-slate-100/80"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {msg.from === "user" ? "You" : "Bachat AI"} • {msg.time}
                </p>
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form
          onSubmit={handleSend}
          className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something like: How can I increase my savings?"
            className="flex-1 border border-slate-300 dark:border-slate-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white dark:bg-slate-900 dark:text-slate-200"
          />
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium rounded-full bg-brand-500 text-white hover:bg-brand-600 transition"
          >
            Send
          </button>
        </form>
      </Card>

      <div className="text-[11px] text-slate-500 dark:text-slate-400">
        Note: This is a demo interface. In the final system, these answers will
        come from your Dialogflow/ML backend based on your real financial data.
      </div>
    </div>
  );
};

export default ChatbotPage;
