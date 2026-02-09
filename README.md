# Velamini Dashboard

Welcome to the Velamini Dashboard, a futuristic sci-fi AI dashboard built with React, Next.js, and TailwindCSS. This project features a sleek dark theme with neon glowing colors, designed to provide an engaging user experience.

## Project Structure

```
velamini-dashboard
├── app
│   ├── layout.tsx        # Main layout of the application
│   ├── page.tsx          # Entry point for the main page
│   └── globals.css       # Global CSS styles
├── components
│   ├── Sidebar.tsx       # Sidebar component with navigation
│   ├── ChatPanel.tsx     # Chat panel for AI interactions
│   ├── InfoPanel.tsx     # Info panel displaying tasks and widgets
│   └── common
│       ├── Button.tsx    # Reusable button component
│       ├── ProgressBar.tsx # Progress bar component
│       └── Card.tsx      # Card component for displaying information
├── styles
│   ├── tailwind.css      # TailwindCSS styles
│   └── theme.css         # Theme-specific styles
├── types
│   └── index.ts          # TypeScript types and interfaces
├── package.json          # npm configuration file
├── tsconfig.json         # TypeScript configuration file
├── tailwind.config.js    # TailwindCSS configuration
├── next.config.js        # Next.js configuration
└── README.md             # Project documentation
```

## Features

- **Responsive Layout**: The dashboard is designed with a three-panel layout, including a sidebar, chat panel, and info/task panel.
- **Dark Sci-Fi Theme**: The application features a dark theme with neon colors, providing a futuristic look and feel.
- **Interactive Chat**: Engage with an AI through the chat panel, complete with chat bubbles and a user-friendly input box.
- **Task Management**: The info panel displays today's tasks with progress indicators, helping users stay organized.

## Getting Started

To get started with the Velamini Dashboard, follow these steps:

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd velamini-dashboard
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Run the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000` to view the dashboard.

## Contributing

Contributions are welcome! If you have suggestions or improvements, feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.