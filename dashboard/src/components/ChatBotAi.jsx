import React, { useState, useRef, useEffect } from "react";
import { MdClose, MdSend } from "react-icons/md";
import { BsRobot, BsLightningChargeFill } from "react-icons/bs";
import { useStateContext } from "../contexts/ContextProvider";

const ChatBotAI = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm your AI Energy Assistant 🤖\n\nI understand natural language and can help you with your energy consumption. Just ask me anything!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const messagesEndRef = useRef(null);
  const { userData, appSettings } = useStateContext();

  const quickReplies = [
    "Why is my bill so high?",
    "How can I save money?",
    "What are my biggest consumers?",
    "Am I meeting my target?",
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!userData?.id) return;
      try {
        const response = await fetch(
          `http://localhost:8080/api/devices/dashboard/${userData.id}`,
        );
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [userData]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const classifyIntent = (userInput) => {
    const input = userInput.toLowerCase().trim();

    if (
      input.match(
        /\b(save|saving|economis|reduce|reducing|lower|cut|minimize|cheaper|less money|tips|advice|sfat)\b/,
      )
    )
      return "save_money";

    if (
      (input.includes("bill") ||
        input.includes("cost") ||
        input.includes("expensive") ||
        input.includes("factura")) &&
      (input.includes("high") ||
        input.includes("much") ||
        input.includes("why") ||
        input.includes("scump"))
    )
      return "bill_inquiry";

    if (
      input.match(
        /\b(tell me about|info about|details|specific|about|despre)\b/,
      ) ||
      input.match(
        /\b(bec|led|ac|air conditioning|tv|laptop|fridge|refrigerator|boiler|washing machine)\b/,
      )
    )
      return "device_specific";

    if (
      input.match(
        /\b(turn off|switch off|opresc|unplug|disable|shut off|what to turn)\b/,
      )
    )
      return "turn_off_advice";

    if (
      input.match(
        /\b(top|biggest|largest|most|highest|consumer|uses most|main|major)\b/,
      )
    )
      return "top_consumers";

    if (
      input.match(
        /\b(target|budget|goal|meeting|progress|on track|within|over|under)\b/,
      )
    )
      return "target_progress";

    if (
      input.match(
        /\b(how much|total|consumption|usage|summary|overview|using|stats)\b/,
      )
    )
      return "consumption_summary";

    if (
      input.match(
        /\b(predict|forecast|estimate|will i|expect|end of month|projection)\b/,
      )
    )
      return "prediction";

    if (
      input.match(
        /\b(which devices|what devices|active|running|what's on|status|on now)\b/,
      )
    )
      return "device_status";

    if (input.match(/^(hello|hi|hey|salut|buna|good morning|good evening)$/i))
      return "greeting_response";

    if (input.match(/\b(thank|thanks|mersi|multumesc|appreciate)\b/))
      return "thanks_response";

    if (input.match(/\b(help|ajutor|capabilities|what can you|features)\b/))
      return "help_response";

    return "help_response";
  };

  const generateResponse = (intent, userInput) => {
    if (!dashboardData) {
      return "I'm still analyzing your energy data. Give me a moment... 🔄";
    }

    const {
      totalKwh,
      totalCost,
      activeDevices,
      totalDevices,
      topConsumer,
      deviceBreakdown,
    } = dashboardData;
    const monthlyTarget = appSettings?.monthlyTarget || 300;
    const pricePerKwh = appSettings?.pricePerKwh || 1.3;
    const daysInMonth = 30;
    const currentDay = new Date().getDate();

    switch (intent) {
      case "bill_inquiry":
        const overBudget = totalKwh > monthlyTarget;
        let response = `💰 **Bill Analysis:**\n\n`;
        response += `Current: ${totalCost.toFixed(2)} RON (${totalKwh.toFixed(2)} kWh)\n\n`;
        if (overBudget) {
          const excess = ((totalKwh / monthlyTarget - 1) * 100).toFixed(1);
          response += `⚠️ You're ${excess}% over your ${monthlyTarget} kWh target!\n\n`;
        }
        if (topConsumer) {
          const topPercentage = ((topConsumer.kwh / totalKwh) * 100).toFixed(1);
          const topCost = (topConsumer.kwh * pricePerKwh).toFixed(2);
          response += `🔥 **Main culprit: ${topConsumer.name}**\n`;
          response += `• ${topConsumer.kwh.toFixed(2)} kWh (${topPercentage}%)\n`;
          response += `• Costing you ${topCost} RON\n\n`;
          const potentialSaving = (topCost * 0.25).toFixed(2);
          response += `💡 **Smart tip:** Reduce ${topConsumer.name} usage by 25% to save ~${potentialSaving} RON!`;
        }
        return response;

      case "save_money":
        let savingsResponse = "💡 **Smart Savings Plan:**\n\n";
        const sorted = [...deviceBreakdown]
          .sort((a, b) => b.kwh - a.kwh)
          .slice(0, 3);
        sorted.forEach((device, index) => {
          const deviceCost = (device.kwh * pricePerKwh).toFixed(2);
          const saving20 = (deviceCost * 0.2).toFixed(2);
          const saving50 = (deviceCost * 0.5).toFixed(2);
          savingsResponse += `**${index + 1}. ${device.name}**\n`;
          savingsResponse += `   Current cost: ${deviceCost} RON\n`;
          savingsResponse += `   • Reduce 20% → Save ${saving20} RON\n`;
          savingsResponse += `   • Reduce 50% → Save ${saving50} RON\n\n`;
        });
        const totalPotential = sorted.reduce(
          (sum, d) => sum + d.kwh * pricePerKwh * 0.3,
          0,
        );
        savingsResponse += `🎯 **Total potential:** ${totalPotential.toFixed(2)} RON/month if you optimize these 3!`;
        return savingsResponse;

      case "turn_off_advice":
        let turnOffResponse = "🔌 **Smart Turn-Off Strategy:**\n\n";
        const highPower = [...deviceBreakdown]
          .sort((a, b) => b.kwh - a.kwh)
          .filter((d) => d.kwh > 0.5)
          .slice(0, 5);
        turnOffResponse += "**When leaving for 8+ hours:**\n\n";
        highPower.forEach((device, index) => {
          const dailyCost = ((device.kwh / daysInMonth) * pricePerKwh).toFixed(
            2,
          );
          const hourlySaving = ((parseFloat(dailyCost) / 24) * 8).toFixed(2);
          turnOffResponse += `${index + 1}. **${device.name}** → Save ${hourlySaving} RON/day\n`;
        });
        const totalDailySaving = highPower.reduce(
          (sum, d) => sum + (((d.kwh / daysInMonth) * pricePerKwh) / 24) * 8,
          0,
        );
        turnOffResponse += `\n💰 Total savings: ${totalDailySaving.toFixed(2)} RON/day (${(totalDailySaving * 30).toFixed(2)} RON/month)`;
        return turnOffResponse;

      case "top_consumers":
        let topResponse = "📊 **Energy Consumption Leaderboard:**\n\n";
        const top5 = [...deviceBreakdown]
          .sort((a, b) => b.kwh - a.kwh)
          .slice(0, 5);
        top5.forEach((device, index) => {
          const cost = (device.kwh * pricePerKwh).toFixed(2);
          const emoji =
            index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "📍";
          topResponse += `${emoji} **${device.name}**\n`;
          topResponse += `   ${device.kwh.toFixed(2)} kWh (${device.percentage.toFixed(1)}%) • ${cost} RON\n\n`;
        });
        return topResponse;

      case "target_progress":
        const percentage = ((totalKwh / monthlyTarget) * 100).toFixed(1);
        const remaining = (monthlyTarget - totalKwh).toFixed(2);
        const isOver = totalKwh > monthlyTarget;
        let targetResponse = `🎯 **Target Progress Report:**\n\n`;
        targetResponse += `Monthly target: ${monthlyTarget} kWh\n`;
        targetResponse += `Current usage: ${totalKwh.toFixed(2)} kWh (${percentage}%)\n\n`;
        if (isOver) {
          targetResponse += `⚠️ **OVER BUDGET!**\n`;
          targetResponse += `You've exceeded by ${Math.abs(remaining).toFixed(2)} kWh\n\n`;
          targetResponse += `💡 **Action needed:** Turn off high-power devices to reduce overage.`;
        } else {
          const dailyAverage = (totalKwh / currentDay).toFixed(2);
          const projectedTotal = (dailyAverage * daysInMonth).toFixed(2);
          targetResponse += `✅ **On track!**\n`;
          targetResponse += `Remaining: ${remaining} kWh\n`;
          targetResponse += `Daily average: ${dailyAverage} kWh\n`;
          targetResponse += `Projected end: ${projectedTotal} kWh\n\n`;
          if (parseFloat(projectedTotal) > monthlyTarget) {
            targetResponse += `⚠️ Warning: Current pace will exceed target by ${(parseFloat(projectedTotal) - monthlyTarget).toFixed(2)} kWh`;
          } else {
            targetResponse += `🎉 Great job! Keep it up!`;
          }
        }
        return targetResponse;

      case "consumption_summary":
        let summaryResponse = `⚡ **Energy Summary:**\n\n`;
        summaryResponse += `📊 **This Month:**\n`;
        summaryResponse += `• Total: ${totalKwh.toFixed(2)} kWh (${totalCost.toFixed(2)} RON)\n`;
        summaryResponse += `• Daily avg: ${(totalKwh / currentDay).toFixed(2)} kWh\n`;
        summaryResponse += `• Active devices: ${activeDevices}/${totalDevices}\n\n`;
        if (topConsumer) {
          summaryResponse += `🔥 Top: **${topConsumer.name}** (${topConsumer.kwh.toFixed(2)} kWh)`;
        }
        return summaryResponse;

      case "device_specific":
        const deviceName = userInput.toLowerCase();
        const device = deviceBreakdown.find(
          (d) =>
            deviceName.includes(d.name.toLowerCase()) ||
            d.name
              .toLowerCase()
              .includes(
                deviceName.split(" ")[deviceName.split(" ").length - 1],
              ),
        );
        if (device) {
          const deviceCost = (device.kwh * pricePerKwh).toFixed(2);
          let deviceResponse = `🔍 **${device.name} Analysis:**\n\n`;
          deviceResponse += `• Consumption: ${device.kwh.toFixed(2)} kWh\n`;
          deviceResponse += `• Cost: ${deviceCost} RON\n`;
          deviceResponse += `• Share: ${device.percentage.toFixed(1)}% of total\n`;
          deviceResponse += `• Daily: ${(device.kwh / daysInMonth).toFixed(2)} kWh\n\n`;
          deviceResponse += `💡 Reduce by 30% to save ${(deviceCost * 0.3).toFixed(2)} RON`;
          return deviceResponse;
        }
        return "I couldn't find that specific device in your current setup. Try asking about your top consumers instead!";

      case "prediction":
        const dailyAvg = totalKwh / currentDay;
        const projectedKwh = (dailyAvg * daysInMonth).toFixed(2);
        const projectedCost = (projectedKwh * pricePerKwh).toFixed(2);
        let predictionResponse = `🔮 **End-of-Month Prediction:**\n\n`;
        predictionResponse += `Based on your current usage:\n`;
        predictionResponse += `• Projected total: ${projectedKwh} kWh\n`;
        predictionResponse += `• Estimated cost: ${projectedCost} RON\n\n`;
        const difference = (parseFloat(projectedKwh) - monthlyTarget).toFixed(
          2,
        );
        if (parseFloat(difference) > 0) {
          predictionResponse += `⚠️ You'll exceed target by ${difference} kWh (+${(difference * pricePerKwh).toFixed(2)} RON)`;
        } else {
          predictionResponse += `✅ You'll stay within budget by ${Math.abs(difference)} kWh!`;
        }
        return predictionResponse;

      case "device_status":
        let statusResponse = `📱 **Device Status:**\n\n`;
        statusResponse += `**Currently Active (${activeDevices}):**\n`;
        const activeOnes = deviceBreakdown.slice(0, 8);
        activeOnes.forEach((d) => {
          statusResponse += `• ${d.name}\n`;
        });
        statusResponse += `\n🔌 ${totalDevices - activeDevices} devices are OFF`;
        return statusResponse;

      case "greeting_response":
        return `Hello! 👋\n\nYou're at ${totalKwh.toFixed(2)} kWh this month.\n\nHow can I optimize your energy usage today?`;

      case "thanks_response":
        return `You're welcome! 😊\n\nFeel free to ask me anything about your energy consumption!`;

      case "help_response":
      default:
        return `I can help you with:\n\n• 💰 Bill analysis\n• 💡 Energy saving tips\n• 📊 Consumption tracking\n• 🎯 Target monitoring\n• 🔍 Device-specific info\n• 🔮 Cost predictions\n\nJust ask me anything!`;
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const userMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      const intent = classifyIntent(text);
      const response = generateResponse(intent, text);
      const assistantMessage = { role: "assistant", content: response };
      setMessages((prev) => [...prev, assistantMessage]);
      setLoading(false);
    }, 1000);
  };

  const handleQuickReply = (reply) => {
    sendMessage(reply);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Chat Window */}
      <div
        className="relative rounded-2xl shadow-2xl w-full max-w-md h-[600px] flex flex-col animate-slide-up"
        style={{
          backgroundColor: "#1a1e24",
          border: "1px solid rgba(0, 227, 150, 0.2)",
          boxShadow: "0 0 40px rgba(0, 227, 150, 0.1)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 rounded-t-2xl"
          style={{
            background: "linear-gradient(135deg, #0d1117, #161b22)",
            borderBottom: "1px solid rgba(0, 227, 150, 0.3)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-full"
              style={{
                background: "rgba(0, 227, 150, 0.15)",
                border: "1px solid rgba(0, 227, 150, 0.4)",
              }}
            >
              <BsLightningChargeFill
                className="text-xl"
                style={{ color: "#00E396" }}
              />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">
                AI Energy Assistant
              </h3>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: "#00E396" }}
                />
                <p className="text-xs" style={{ color: "#00E396" }}>
                  Online • Smart • Adaptive
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-all"
            style={{ color: "#8b949e" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(0, 227, 150, 0.1)";
              e.currentTarget.style.color = "#00E396";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#8b949e";
            }}
          >
            <MdClose className="text-2xl" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center mr-2 mt-1 flex-shrink-0"
                  style={{
                    background: "rgba(0, 227, 150, 0.15)",
                    border: "1px solid rgba(0, 227, 150, 0.3)",
                  }}
                >
                  <BsLightningChargeFill
                    className="text-xs"
                    style={{ color: "#00E396" }}
                  />
                </div>
              )}
              <div
                className="max-w-[80%] p-3 rounded-2xl"
                style={
                  msg.role === "user"
                    ? {
                        background: "linear-gradient(135deg, #00E396, #00b377)",
                        color: "#0d1117",
                      }
                    : {
                        backgroundColor: "#21262d",
                        color: "#e6edf3",
                        border: "1px solid rgba(0, 227, 150, 0.1)",
                      }
                }
              >
                <p
                  className="text-sm whitespace-pre-wrap leading-relaxed"
                  style={msg.role === "user" ? { fontWeight: "500" } : {}}
                >
                  {msg.content.split("**").map((part, i) =>
                    i % 2 === 0 ? (
                      part
                    ) : (
                      <strong
                        key={i}
                        style={{
                          color:
                            msg.role === "assistant" ? "#00E396" : "inherit",
                        }}
                      >
                        {part}
                      </strong>
                    ),
                  )}
                </p>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-start">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center mr-2 mt-1 flex-shrink-0"
                style={{
                  background: "rgba(0, 227, 150, 0.15)",
                  border: "1px solid rgba(0, 227, 150, 0.3)",
                }}
              >
                <BsLightningChargeFill
                  className="text-xs"
                  style={{ color: "#00E396" }}
                />
              </div>
              <div
                className="p-3 rounded-2xl"
                style={{
                  backgroundColor: "#21262d",
                  border: "1px solid rgba(0, 227, 150, 0.1)",
                }}
              >
                <div className="flex gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ backgroundColor: "#00E396" }}
                  />
                  <div
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{
                      backgroundColor: "#00E396",
                      opacity: 0.7,
                      animationDelay: "0.15s",
                    }}
                  />
                  <div
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{
                      backgroundColor: "#00E396",
                      opacity: 0.4,
                      animationDelay: "0.3s",
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        {messages.length === 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => handleQuickReply(reply)}
                className="text-xs px-3 py-2 rounded-full transition-all hover:scale-105"
                style={{
                  backgroundColor: "rgba(0, 227, 150, 0.1)",
                  color: "#00E396",
                  border: "1px solid rgba(0, 227, 150, 0.3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "rgba(0, 227, 150, 0.2)";
                  e.currentTarget.style.borderColor = "#00E396";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "rgba(0, 227, 150, 0.1)";
                  e.currentTarget.style.borderColor = "rgba(0, 227, 150, 0.3)";
                }}
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div
          className="p-4"
          style={{ borderTop: "1px solid rgba(0, 227, 150, 0.15)" }}
        >
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage(input)}
              className="flex-1 px-4 py-3 rounded-xl focus:outline-none"
              style={{
                backgroundColor: "#0d1117",
                color: "#e6edf3",
                border: "1px solid rgba(0, 227, 150, 0.2)",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#00E396";
                e.target.style.boxShadow = "0 0 0 2px rgba(0, 227, 150, 0.15)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(0, 227, 150, 0.2)";
                e.target.style.boxShadow = "none";
              }}
              disabled={loading}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="p-3 rounded-xl transition-all hover:scale-105 transform disabled:opacity-30"
              style={{
                background: "linear-gradient(135deg, #00E396, #00b377)",
                color: "#0d1117",
              }}
            >
              <MdSend className="text-xl" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBotAI;
