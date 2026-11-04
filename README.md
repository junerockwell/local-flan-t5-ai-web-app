# Self-Hosted flan-t5 with React and Express
 
A small React + Express app that runs Google's flan-t5 model locally with [Transformers.js](https://huggingface.co/docs/transformers.js). No paid API, no API keys, and no data leaves your machine.
 
## Why this exists
 
I wanted to learn how to run a Hugging Face model myself, using Node.js.
 
My first assumption was that open models on Hugging Face could simply be called remotely for free. That used to be mostly true, but things changed:
 
- The old `api-inference.huggingface.co` endpoint has been retired.
- Its replacement, Hugging Face Inference Providers, returned **402 Payment Required**, because free accounts no longer include inference credits.
I didn't want to start paying for hosted inference before I even knew whether a small app was worth building. I wanted something cost-effective, and I wanted to understand how self-hosting a model actually works.
 
So the model runs on my own machine. The Express server loads flan-t5 with Transformers.js and runs it on the CPU, and the React frontend calls that local server instead of a remote API. It costs nothing to run, and nothing leaves the machine.
 
## How it works
 
```
React (Vite)  ──POST /generate──▶  Express server  ──▶  Transformers.js + ONNX Runtime  ──▶  flan-t5 weights
   :5173                              :5001                 (runs the model on your CPU)        (cached locally)
```
 
- **The model is data, not an app.** `Xenova/flan-t5-base` is Google's flan-t5-base converted to ONNX format: a set of weight and config files.
- **Transformers.js is the runtime.** It downloads the model from the Hugging Face Hub on first run, caches it, and runs inference inside the Node process.
- **Express exposes it over HTTP** at `POST /generate`, so the frontend uses it like any other API.
## Tech stack
 
- **Frontend:** React (Vite)
- **Backend:** Node.js, Express
- **AI runtime:** `@huggingface/transformers` (Transformers.js) with `onnxruntime-node`
- **Model:** [`Xenova/flan-t5-base`](https://huggingface.co/Xenova/flan-t5-base) (Apache 2.0)
## Project structure
 
```
.
├── backend-llm/        # Express + Transformers.js backend
│   ├── server.js
│   └── package.json
└── frontend-ui/        # React frontend
    └── src/App.jsx
```
 
## Getting started
 
### Prerequisites
 
- Node.js 18 or newer
- About 1 GB of free disk space for the model cache
### 1. Start the backend
 
```bash
cd backend-llm
npm install
npm run dev
```
 
On the first run, the model downloads from the Hugging Face Hub (a few hundred MB). Later runs load it from the local cache in seconds. Wait for:
 
```
Model loaded.
Server is running on port 5001
```
 
### 2. Start the frontend
 
In a second terminal:
 
```bash
cd frontend-ui
npm install
npm run dev
```
 
Open the URL Vite prints (usually `http://localhost:5173`).
 
### 3. Test the API directly (optional)
 
```bash
curl -X POST http://localhost:5001/generate \
  -H "Content-Type: application/json" \
  -d '{"message": "Translate English to German: How old are you?"}'
```
 
## Prompts that work well
 
flan-t5 is a small **task** model, not a chatbot. It does well with instruction-style prompts:
 
```
Translate English to French: Where is the train station?
Summarize: <paste a paragraph>
Answer the question based on the context. Context: The store opens at 9am and closes at 6pm. Question: When does the store close?
Is this review positive or negative? The food was cold and the service was slow.
```
 
Chat-style questions ("What kind of AI are you?") give nonsense or odd answers. The model was never trained for conversation, has no identity, and has no safety tuning.
 
## Intel Mac note
 
Recent versions of `onnxruntime-node` no longer ship a native binary for Intel Macs (`darwin/x64`), which causes:
 
```
Error: Cannot find module '../bin/napi-v6/darwin/x64/onnxruntime_binding.node'
```
 
The server's `package.json` pins an older version that still includes the Intel binary:
 
```json
"overrides": {
  "onnxruntime-node": "1.23.2"
}
```
 
If you change this, do a clean reinstall so npm picks it up:
 
```bash
rm -rf node_modules package-lock.json
npm install
```
 
On Apple Silicon, Linux, and Windows the override isn't needed, but it doesn't hurt.
 
## What I learned
 
- **Model vs. runtime:** a model is a file of weights; a runtime (here, ONNX Runtime inside Transformers.js) loads it and does the math.
- **Hosted vs. self-hosted inference:** open models are free to download, but running them takes compute. Either you pay a provider or you run them on your own hardware.
- **APIs change:** the free endpoint I expected to use was retired and its replacement moved behind a paywall, so older tutorials age quickly.
- **Native dependencies matter:** an npm package with native binaries can silently drop support for a platform.
- **Model choice matters:** a small task model like flan-t5 is fast and free to run, but it isn't a chatbot.
## Credits
 
- [flan-t5](https://huggingface.co/google/flan-t5-base) by Google, ONNX conversion by [Xenova](https://huggingface.co/Xenova).
- [Transformers.js](https://github.com/huggingface/transformers.js) by Hugging Face.
 