🏁 F1GPT – Your AI Companion for Formula 1

F1GPT is an AI-powered chatbot that lets users ask anything about Formula 1—driver stats, race history, rules—and get intelligent, context-aware responses. It demonstrates Retrieval-Augmented Generation (RAG) in action, combining OpenAI embeddings with a vector database and LangChain.js for orchestration.

📦 Prerequisites

1. Node.js (v18 or above)
2. OpenAI API Key (https://platform.openai.com/account/api-keys)
3. DataStax Astra DB instance (https://www.datastax.com/astra)
4. Git and a terminal (Mac/Linux/Windows)

Required environment variables in `.env` file:

OPENAI_API_KEY=your_openai_key
ASTRA_DB_API_ENDPOINT=https://your-db-id.apps.astra.datastax.com
ASTRA_DB_APPLICATION_TOKEN=AstraCS:your-token
ASTRA_DB_KEYSPACE=default_keyspace


⚙️ Steps to Run the Project


1. Clone the repository:
   git clone https://github.com/your-username/f1gpt.git
   cd f1gpt

2. Install dependencies:
   npm install

3. Create `.env` file and fill in required values.

4. Seed the database with embeddings:
   npm run seed

5. Start the development server:
   npm run dev

6. Visit http://localhost:3000 to interact with the chatbot.


🧠 Key Technologies Used


- Next.js App Router
- TypeScript
- LangChain.js
- OpenAI (text-embedding-3-small + GPT-4)
- DataStax Astra DB (Vector search)
- Vercel AI SDK (`ai/react`)



🧩 How It Works


1. ✅ A user types a question in the chatbot interface.
2. 🔍 The app uses `text-embedding-3-small` from OpenAI to embed the question.
3. 🧠 The embedding is matched against pre-seeded F1 knowledge stored in Astra DB (vector database).
4. 🪄 The top-matching context is retrieved and injected into a prompt.
5. 🤖 OpenAI's GPT-4 processes the context + question and generates a smart answer.
6. 💬 The Vercel AI SDK streams the response back to the frontend in real-time.

This approach (RAG) ensures that answers are grounded in actual data, not just model memory—making the chatbot reliable for domain-specific knowledge like Formula 1.


📦 Sources


https://www.youtube.com/watch?v=d-VKYF4Zow0
