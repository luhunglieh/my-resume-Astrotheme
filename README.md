# Astro Resume Theme

Astro Resume Theme is a fully customizable and responsive template, built to help you create a beautiful online resume or portfolio with ease. It is powered by Astro and styled using Tailwind CSS, making it fast, modern, and easy to work with.

## Usage

You can bootstrap a new Astro project using the following command:

```bash
# npm 10+ (Node 24 Active LTS)
npm create astro@latest -- --template wasutz/astro-resume-theme

# pnpm
pnpm dlx create-astro --template wasutz/astro-resume-theme

# yarn
yarn create astro --template wasutz/astro-resume-theme
```

## 🚀 Features

- Tailwind CSS: Utilizes utility-first styling for rapid UI development.
- Dark Mode: Built-in dark mode toggle for better UX.
- Theme Customization: Easily adjustable in src/styles/theme.css.
- Responsive Design: Optimized for mobile, tablet, and desktop devices.
- MDX Support: Allows blog posts written in Markdown with JSX components.
- Excellent Lighthouse/PageSpeed scores
- SEO-friendly

## 🛡️ Runtime Requirement (資安環境要求)

- **Node.js**: `>= 24.0.0` (Active LTS)
- **說明**: 本專案已全面棄用舊版 Node 18 與 Node 20 — Node 20 已 EOL（Node 20 於 2026-04-30 終止支援）。本地開發與 CI/CD 建置統一使用 `npm` 與 `package-lock.json`。

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm ci` / `npm install`  | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

# Getting Started

1) Initialize the project
Run one of the commands listed in the Quick Start section.

2) Customize your resume data
Edit your resume data in `src/config/cv.json`

3) Customize theme colors
Modify the color scheme by editing `src/styles/theme.ts` to match your personal branding.

4) Replace your CV file
Put your cv file in `src/public/cv` and then replace the file name in `src/config/cv.json` (basic.cv_file_name)

5) Run the project locally
Once you’ve made your customizations, run the development server:

```bash
npm run dev
```

Open http://localhost:4321 in your browser to view the result 🚀

## License

Licensed under the MIT License, Copyright © Wasut Panyawiphat.

See [LICENSE](/LICENSE) for more information.
