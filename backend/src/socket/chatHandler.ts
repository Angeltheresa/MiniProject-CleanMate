import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import ChatMessage from '../models/ChatMessage';
import User from '../models/User';

// AI Chatbot responses for cleaning services
const AI_RESPONSES: Record<string, string> = {
  greeting:
    "👋 Hello! Welcome to CleanMate — your trusted deep cleaning service!\n\nHere's what I can help you with:\n🧹 Services & pricing\n📅 How to book a cleaning\n👷 About our cleaning agents\n📍 Tracking your booking\n💳 Payments\n⭐ Leaving a review\n📋 Complaints\n🆘 Emergency cleaning\n\nJust type your question and I'll guide you right away!",

  services:
    "We offer three types of cleaning services:\n\n🏠 **Home Cleaning** — Perfect for houses and apartments\n🏢 **Office Cleaning** — Ideal for workspaces and small offices\n🏭 **Commercial Cleaning** — For large spaces like warehouses or halls\n\nEach service comes in three levels:\n• **Standard** — Regular maintenance clean\n• **Deep Clean** — Thorough top-to-bottom clean\n• **Emergency** — Same-day or urgent cleaning\n\nWant to know the prices? Just ask! 😊",

  pricing:
    "Here's our pricing guide (per square foot):\n\n| Service Level | Price |\n|---|---|\n| Standard Clean | ₹18 / sq ft |\n| Deep Clean | ₹25 / sq ft |\n| Emergency Clean | ₹35 / sq ft |\n\n💡 **Tip:** Use our **Cost Estimator** (in the sidebar) to get a personalised quote based on your room size!\n\nWould you like to know how to book a service?",

  booking:
    "Booking a cleaning is quick and easy! Here's how:\n\n1️⃣ Click **'Book Service'** in the left sidebar\n2️⃣ Select your **service type** (Home, Office, or Commercial)\n3️⃣ Choose a **cleaning level** (Standard, Deep Clean, or Emergency)\n4️⃣ Pick your **preferred date**\n5️⃣ Confirm the booking — that's it!\n\n✅ You'll receive a confirmation and a cleaning agent will be assigned to your booking shortly.\n\nNeed help understanding pricing first?",

  workflow:
    "Here's how CleanMate works from start to finish:\n\n🔹 **Step 1 — Sign Up:** Create a free account as a Customer.\n🔹 **Step 2 — Book:** Choose your service, level, and date.\n🔹 **Step 3 — Agent Assigned:** A verified cleaning agent accepts your booking.\n🔹 **Step 4 — Cleaning Day:** The agent arrives and completes the job.\n🔹 **Step 5 — Track:** Watch the progress in real-time from your dashboard.\n🔹 **Step 6 — Pay:** Payment is processed once the job is approved.\n🔹 **Step 7 — Review:** Rate your experience to help others!\n\n💬 At any step, you can message your agent or contact support right here in this chat!",

  agents:
    "Our cleaning agents are background-verified professionals 👷\n\nHere's what you should know:\n• **How agents are assigned:** After you book, the nearest available agent accepts your request.\n• **Browse agents:** Go to **'Nearby Agents'** in the sidebar to see agents in your area, their ratings, and specialisations.\n• **View their profile:** Click on any agent to see their portfolio, reviews, and completed jobs.\n• **Chat with your agent:** Once assigned, you can message them directly from **'Messages'**.\n\nWould you like to know how to book a service?",

  tracking:
    "You can track your booking in real-time! 📍\n\nHead to **'Service Tracking'** in your sidebar. Your booking goes through these stages:\n\n1️⃣ **Requested** — Your booking has been placed\n2️⃣ **Approved** — An agent has accepted your booking\n3️⃣ **In Progress** — The cleaning is currently happening\n4️⃣ **Completed** — The job is done! ✅\n\nYou'll be able to see exactly which stage you're at, any time you check in.",

  payment:
    "💳 Here's how payments work on CleanMate:\n\n• After your booking is **approved** by an agent, you'll be guided to the **Payment** page.\n• You can access it anytime from **'Payment'** in the sidebar.\n• Payments are processed securely — your details are always protected.\n\nThe amount is calculated based on your service type and the size of the area. You can use our **Cost Estimator** to see the expected amount before booking!\n\nAny other questions?",

  reviews:
    "⭐ We'd love to hear about your experience!\n\nTo leave a review:\n1. Go to **'Reviews'** in the sidebar\n2. Select the completed booking you want to review\n3. Give a star rating and write a short comment\n4. Submit!\n\nYour feedback helps other customers find great agents, and helps agents improve their service. 🙌\n\nIs there anything else I can help with?",

  complaint:
    "We're sorry to hear something didn't go as expected 😔\n\nTo raise a complaint:\n1. Go to **'Complaints'** in the left sidebar\n2. Describe your issue clearly\n3. Hit **Submit**\n\nOur support team reviews all complaints and will follow up with you. You can also check the status of your complaint from the same page.\n\nIf it's urgent, type **'emergency'** and I'll share more options for you.",

  history:
    "📋 Want to revisit your past bookings?\n\nJust go to **'Service History'** in the sidebar. You'll see:\n• All your previous bookings\n• Service type, date, and amount paid\n• Status of each booking\n• Option to leave a review for completed jobs\n\nA great way to keep track of all your cleaning sessions! 😊",

  cancel:
    "We understand plans can change! Here's what you need to know about cancellations:\n\n• If your booking is still **Pending** (not yet assigned to an agent), you can contact our support through the **Complaints** section and request a cancellation.\n• Once an agent has **Approved** the booking, please reach out as early as possible.\n\n📬 To request a cancellation, go to **'Complaints'**, describe your situation, and our team will assist you promptly.\n\nIs there anything else I can help you with?",

  emergency:
    "🚨 Need urgent cleaning? We've got you covered!\n\nWhen booking, simply **toggle the Emergency option** and we'll prioritise your request:\n• Emergency slots are available for **same-day or next-day** cleaning\n• Pricing for emergency service: **₹35 per sq ft**\n• Fastest response time guaranteed\n\nGo to **'Book Service'** → select your service → toggle **Emergency** → confirm!\n\nShall I walk you through the full booking process?",

  account:
    "👤 Managing your account is simple:\n\n• **Sign Up:** Visit the Sign Up page and choose **Customer** or **Cleaning Agent** as your role.\n• **Log In:** Use your username and password on the Login page.\n• **Forgot Password?** Click **'Forgot Password'** on the login page and follow the steps sent to your email.\n• **Google Sign-In:** You can also sign up and log in quickly using your Google account.\n\nNeed help with a specific account issue?",

  nearby:
    "📍 Looking for cleaning agents near you?\n\nGo to **'Nearby Agents'** in the sidebar. Here you can:\n• See agents available in your area on a map\n• Filter by rating or distance\n• View each agent's profile, specialisation, and past reviews\n• Directly book or chat with them\n\nOur agents cover a wide range of areas — there's likely one near you right now! 🧹",

  help:
    "I'm CleanMate AI and I'm here to help! 🤖✨\n\nHere's everything I can assist you with:\n\n🧹 **Services** — What cleaning types we offer\n💰 **Pricing** — Rates per service level\n📅 **Booking** — How to book a cleaning\n🔄 **How it works** — Full workflow explained\n👷 **Agents** — About our cleaning staff\n📍 **Tracking** — Real-time booking status\n💳 **Payment** — How payments are handled\n⭐ **Reviews** — How to rate a service\n📋 **Complaints** — Report an issue\n🕘 **History** — Past bookings\n❌ **Cancel** — Cancellation help\n🆘 **Emergency** — Same-day urgent cleaning\n👤 **Account** — Sign up, login, password help\n\nJust type any topic above and I'll give you all the details!",

  goodbye:
    "Thank you for chatting with CleanMate AI! 😊\n\nWe hope we could help. Your home deserves the best — and we're always here when you need us! 🧹✨\n\nFeel free to come back any time. Have a wonderful day! 👋",

  fallback:
    "Hmm, I didn't quite catch that! 🤔\n\nI can help you with:\n• 🧹 Services & pricing\n• 📅 How to book a cleaning\n• 🔄 How CleanMate works (full workflow)\n• 👷 About our agents\n• 📍 Tracking your booking\n• 💳 Payments\n• ⭐ Reviews & complaints\n• ❌ Cancellations\n• 🆘 Emergency cleaning\n\nTry typing something like **\"how do I book\"**, **\"what are the prices\"**, or **\"how does it work\"**. I'm here to help! 😊",
};

function getAiResponse(message: string): string {
  const msg = message.toLowerCase();

  // Greeting
  if (/\b(hi|hello|hey|good morning|good evening|good afternoon|howdy|start|begin)\b/.test(msg)) {
    return AI_RESPONSES.greeting;
  }
  // Help menu
  if (/\b(help|menu|options|what can you do|assist|support)\b/.test(msg)) {
    return AI_RESPONSES.help;
  }
  // Full workflow
  if (/\b(how does it work|workflow|explain|guide|steps|process|overview|walkthrough|walk me through)\b/.test(msg)) {
    return AI_RESPONSES.workflow;
  }
  // Services
  if (/\b(service|services|clean|cleaning|offer|what do you|type|types|available|provide|what kind)\b/.test(msg)) {
    return AI_RESPONSES.services;
  }
  // Pricing
  if (/\b(price|prices|pricing|cost|rate|charge|fee|how much|estimate|quote|amount|expensive|cheap)\b/.test(msg)) {
    return AI_RESPONSES.pricing;
  }
  // Emergency
  if (/\b(urgent|emergency|asap|today|same.?day|quick|immediately|right now|fast)\b/.test(msg)) {
    return AI_RESPONSES.emergency;
  }
  // Booking
  if (/\b(book|booking|schedule|reserve|appointment|place.?order|order|hire|request)\b/.test(msg)) {
    return AI_RESPONSES.booking;
  }
  // Agents / nearby
  if (/\b(near(by)?|agent|cleaner|staff|who will come|who comes|find.?agent|available.?agent|around me)\b/.test(msg)) {
    return AI_RESPONSES.nearby;
  }
  // Agents general
  if (/\b(agent|cleaner|worker|professional|team|staff|who|person|people)\b/.test(msg)) {
    return AI_RESPONSES.agents;
  }
  // Tracking
  if (/\b(track|tracking|status|where|progress|update|stage|ongoing|current|live)\b/.test(msg)) {
    return AI_RESPONSES.tracking;
  }
  // Payment
  if (/\b(pay|payment|gateway|how to pay|method|bill|invoice|transaction|money|charge|debit|credit)\b/.test(msg)) {
    return AI_RESPONSES.payment;
  }
  // Reviews
  if (/\b(review|rating|feedback|rate|experience|star|comment|opinion)\b/.test(msg)) {
    return AI_RESPONSES.reviews;
  }
  // History
  if (/\b(history|past|previous|old.?booking|earlier|last.?time|record)\b/.test(msg)) {
    return AI_RESPONSES.history;
  }
  // Cancel
  if (/\b(cancel|cancellation|refund|stop|undo|remove.?booking|delete.?booking)\b/.test(msg)) {
    return AI_RESPONSES.cancel;
  }
  // Complaint
  if (/\b(complaint|issue|problem|trouble|wrong|bad|unhappy|dissatisfied|damage|broken|not.?clean|poor)\b/.test(msg)) {
    return AI_RESPONSES.complaint;
  }
  // Account
  if (/\b(account|sign.?up|register|signup|login|log.?in|forgot|password|reset|google|create.?account)\b/.test(msg)) {
    return AI_RESPONSES.account;
  }
  // Goodbye
  if (/\b(bye|goodbye|see you|later|done|thanks|thank you|exit|close|that.?s all)\b/.test(msg)) {
    return AI_RESPONSES.goodbye;
  }

  return AI_RESPONSES.fallback;
}

export const setupChatHandlers = (io: Server): void => {
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as { userId: string };
      const user = await User.findById(decoded.userId);

      if (!user) {
        return next(new Error('User not found'));
      }

      (socket as any).user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    console.log(`🔌 User connected: ${user.fullName} (${user._id})`);

    // Join user's personal room
    socket.join(`user_${user._id}`);

    // Join a chat room
    socket.on('join_room', async (roomId: string) => {
      socket.join(roomId);
      console.log(`📝 ${user.fullName} joined room: ${roomId}`);

      // Mark messages as read where user is not the sender
      await ChatMessage.updateMany(
        { roomId, senderId: { $ne: user._id }, status: 'sent' },
        { $set: { status: 'read' } }
      );

      // Notify others in the room that messages have been read
      io.to(roomId).emit('messages_read', { roomId, userId: user._id });

      // Send chat history
      const history = await ChatMessage.find({ roomId })
        .sort({ createdAt: 1 })
        .limit(50)
        .populate('senderId', 'fullName avatar');

      socket.emit('chat_history', history);
    });

    // Send a message
    socket.on('send_message', async (data: { roomId: string; text: string; receiverId?: string }) => {
      try {
        // Check if there are other users in the room
        const roomSockets = await io.in(data.roomId).fetchSockets();
        const otherUsersInRoom = roomSockets.some(s => (s as any).user?._id.toString() !== user._id.toString());
        
        const status = otherUsersInRoom ? 'read' : 'sent';

        const message = await ChatMessage.create({
          senderId: user._id,
          receiverId: data.receiverId,
          roomId: data.roomId,
          text: data.text,
          isAiMessage: false,
          status: status,
        });

        const populated = await message.populate('senderId', 'fullName avatar');

        // Broadcast to the room (to EVERYONE including the sender)
        console.log(`✉️ Broadcasting message to room: ${data.roomId} with status: ${status}`);
        io.to(data.roomId).emit('new_message', {
          _id: populated._id,
          senderId: populated.senderId,
          text: populated.text,
          roomId: populated.roomId,
          isAiMessage: false,
          status: populated.status,
          createdAt: populated.createdAt,
        });

        // If it's the AI chatbot room, generate a response
        if (data.roomId.startsWith('ai_')) {
          setTimeout(async () => {
            const aiResponse = getAiResponse(data.text);

            const aiMessage = await ChatMessage.create({
              senderId: user._id,
              roomId: data.roomId,
              text: aiResponse,
              isAiMessage: true,
              status: 'read',
            });

            io.to(data.roomId).emit('new_message', {
              _id: aiMessage._id,
              senderId: { _id: 'ai_bot', fullName: 'CleanMate AI', avatar: null },
              text: aiMessage.text,
              roomId: aiMessage.roomId,
              isAiMessage: true,
              status: 'read',
              createdAt: aiMessage.createdAt,
            });
          }, 1000);
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', (data: { roomId: string; isTyping: boolean }) => {
      socket.to(data.roomId).emit('user_typing', {
        userId: user._id,
        userName: user.fullName,
        isTyping: data.isTyping,
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${user.fullName}`);
    });
  });
};
