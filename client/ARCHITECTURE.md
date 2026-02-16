# Proposed Frontend Folder Structure

```
client/
│
├── public/
│   └── ...
├── src/
│   ├── api/                # API service layer for backend communication
│   │   └── ragApi.js
│   ├── components/         # Reusable UI components
│   │   └── ...
│   ├── context/            # React Contexts for global state
│   │   └── SettingsContext.js
│   ├── hooks/              # Custom React hooks
│   │   └── useChat.js
│   ├── pages/              # Page-level components
│   │   └── Chat.jsx
│   ├── styles/             # CSS or styling solutions (e.g., Tailwind config)
│   │   └── ...
│   ├── tests/              # Unit and integration tests
│   │   └── ...
│   ├── App.js
│   ├── index.js
│   └── ...
├── package.json
└── README.md
```

- **api/**: All backend API logic, e.g., `ragApi.js` for RAG endpoints.
- **components/**: Small, reusable UI elements.
- **context/**: React Contexts for app-wide state.
- **hooks/**: Custom hooks for logic reuse.
- **pages/**: Route-level components.
- **styles/**: CSS, SASS, or Tailwind config.
- **tests/**: All test files.

---

# Example: `ragApi.js`
```js
// src/api/ragApi.js
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_RAG_API_URL || 'http://localhost:8888';

export const sendPrompt = (id, prompt) =>
  axios.post(`${BASE_URL}/prompt/${id}/`, { prompt });

export const searchPrompt = (id, prompt) =>
  axios.post(`${BASE_URL}/prompt/${id}/search`, { prompt });

export const setModel = (id, model) =>
  axios.post(`${BASE_URL}/prompt/${id}/model`, { model });

// ...other API methods for temp, reload, clear, etc.
```

---

# UI/UX Recommendations
- Use a modern UI library for consistency and attractiveness.
- Ensure mobile responsiveness.
- Add clear feedback for loading, errors, and success.
- Use consistent color palette and spacing.
- Document reusable components and patterns.
