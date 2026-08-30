# 🏨 ApnaYatra — AI-Powered Hotel Management and Booking System

ApnaYatra is a comprehensive AI-powered Hotel Management and Booking System designed to simplify hotel discovery, booking, reservation management, and hotel administration. The platform connects travelers and hotel managers on a single platform, providing two separate portals: a **User Portal** for travelers and a **Hotel Manager Portal** for hotel owners and managers.

---

## 💡 Why ApnaYatra?

On traditional booking platforms, users typically have to manually browse hotel details and fill out rigid booking forms. If they have specific questions or doubts about the hotel, amenities, or policies, finding quick answers is difficult. 

**ApnaYatra** transforms this experience into an interactive conversation:
* **Instant Clarifications**: Users can directly ask the AI chatbot any questions or doubts about a hotel and get immediate answers.
* **Conversational Booking**: Instead of navigating static forms, travelers can complete their entire booking naturally through chat while having all their queries resolved in real time.

---

## 🚀 Portals & Features

### 👤 1. User Portal (For Travelers)
* **Account Creation**: Users can create an account by providing basic details.
* **Intelligent AI Chatbot**: Interact with an AI assistant to:
  * Explore destinations and ask about different places.
  * Discover available hotels in specific locations.
  * Get detailed information about individual hotels.
  * Book hotels through natural conversation by providing the required booking details.
  * Cancel existing reservations.
  * View previously booked hotels.
* **User Dashboard**: Conveniently access, review, and manage booking information.
* **Email Confirmations**: Receive booking confirmation emails whenever a reservation is successfully completed.

### 🏢 2. Hotel Manager Portal (For Hotel Owners & Managers)
* **Hotel Registration**: Register hotels with essential information, including hotel name, location, city, room pricing, and total number of rooms.
* **Room Management**: Add and manage individual rooms and update their status (e.g., `Available` or `Reserved`).
* **Reservation Overview**: View complete reservation details whenever a booking is made, including:
  * Customer's name
  * Phone number
  * Assigned room number
  * Duration of stay
* **AI Manager Assistant**: An AI-powered assistant that helps hotel managers interact with and manage hotel-related information efficiently.
* **Host Notifications**: Receive automated confirmation emails whenever a customer completes a reservation.

---

## 🛠️ Technology Stack

### Frontend
* **React.js**: Used to build the user interface and web application portals.

### Backend & AI Technologies
* **FastAPI**: Used to build and manage backend APIs and services.
* **LangGraph**: Used for orchestrating and managing AI agent workflows.
* **Groq**: Used for generating fast and efficient general AI responses.
* **Google Gemini**: Used for AI tool calling and executing application actions.
* **Mem0**: Used to provide memory capabilities to the AI assistant and maintain relevant conversational context.
* **ChromaDB**: Used as the vector database for the RAG system to store and retrieve hotel-related information.
* **MCP (Model Context Protocol) Tools**: Used to enable communication between the AI agents and backend services.
* **LangSmith**: Used for AI application observability, monitoring, tracing, and debugging.

### Database & Services
* **Firebase**: Used for real-time data storage and management, including user, hotel, room, and booking information.
* **SMTP**: Used for sending booking confirmation emails .
