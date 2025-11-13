# 🧠 SafeScroll  

**SafeScroll** is a browser extension developed as a **Final Year Project** by three undergraduate students:  

👨‍🎓 **Wajee Ul Hassan**  
👨‍🎓 **Om Parkash**  
👨‍🎓 **Afaq Ahmed**  

This project represents the **implementation of the research conducted in our undergraduate thesis**, focusing on detecting and mitigating hateful memes on social media platforms to promote a safer digital environment.

---

## 🚀 Overview  

**SafeScroll** is a Chrome browser extension designed to automatically **detect and blur hateful memes** on webpages.  
It uses a machine learning model to analyze image content in real time, identify potential hate-related material, and blur the flagged content to protect users from exposure to harmful memes.

---

## ✨ Features  

- 🔍 **Hateful Meme Detection** — Scans all webpage images and identifies potentially hateful or offensive memes using an ML model.  
- 🧊 **Blur Blocking** — Automatically blurs flagged images to prevent exposure to unwanted content.  
- 📊 **User Dashboard** — Paid users can view statistics and logs of memes blocked over time.  
- 🔐 **Authentication & Subscription** — Includes Sign In / Sign Up functionality and subscription management for premium features.  
- ⚙️ **Seamless DOM Integration** — Efficiently integrates with the webpage DOM to intercept and analyze images dynamically while browsing.  

---

## 🧩 Technology Stack  

| Component | Technology |
|------------|-------------|
| **Backend** | Node.js with EJS |
| **Frontend** | HTML, CSS, JavaScript |
| **ML Model** | Deployed on backend for hateful meme classification |
| **Extension API** | Chrome Extension Manifest V3 |

---

## 🛠️ Installation & Setup  

Follow these steps to set up **SafeScroll** locally:

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/safescroll-extension.git
