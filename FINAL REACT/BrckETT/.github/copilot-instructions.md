# BrckETT Copilot Instructions

## Project Overview
**BrckETT** is a React + Vite web application featuring authentication-based routing, user profiles, and visual effects. The project uses React Router v7 for client-side navigation and custom utility classes for API communication and user state management.

## Architecture & Core Concepts

### State Management & User Authentication
- **User State**: Managed at `App.jsx` using `useState` with `UserClass` instances (see [src/assets/UserClass.js](src/assets/UserClass.js))
- **Authentication Flow**: `isLoggedIn` boolean state gates two route sets:
  - **Authenticated**: Routes to `ProfileModule` (user dashboard)
  - **Unauthenticated**: Routes to `FrontPage` (landing) and `LoginModule` (login/register)
- **User Properties**: `displayName`, `email`, `username`, `userId`, `role`, `token`, `img`

### API Communication Pattern
- Custom `ApiCaller` class in [src/assets/call-api.js](src/assets/call-api.js) wraps fetch with Bearer token support
- Constructor: `new ApiCaller(baseUrl)` defaults to `https://localhost:7211/api`
- Two methods for API calls:
  - **`callApiAsync(url, method, data, json=true, params=null)`**: Preferred async/await pattern
  - **`callApiThen(url, method, data)`**: Legacy promise chain pattern
- Token management: `setToken(token)` automatically adds `Authorization: Bearer {token}` headers
- Error handling: Both methods console.error and throw on failure

### Component Structure
**Module Components** (main feature containers):
- [src/FrontPage.jsx](src/FrontPage.jsx): Landing page with image carousel
- [src/LoginModule.jsx](src/LoginModule.jsx): Combined login/register form (~280 lines, extensive validation)
- [src/ProfileModule.jsx](src/ProfileModule.jsx): Post-login user dashboard
- [src/NavModule.jsx](src/NavModule.jsx): Navigation component (referenced but not shown in routes)

**Utility Components**:
- [src/assets/ClickSpark.jsx](src/assets/ClickSpark.jsx): Reusable particle effect component (canvas-based animation)
  - Props: `sparkColor`, `sparkSize`, `sparkRadius`, `sparkCount`, `duration`, `easing`, `extraScale`
  - Usage: Wrapped around content or standalone with ResizeObserver for responsive canvas

**Design System**:
- [src/ColorsAndFonts.jsx](src/ColorsAndFonts.jsx): Design system component (dev route at `/dev`)
- CSS modules mirror component names in [src/css/](src/css/)

### Routing Pattern
- Conditional routing in `App.jsx`: Two `<Routes>` sets rendered based on `isLoggedIn`
- Protected route pattern: ProfileModule passed `logInTrigger` and `setUserFunc` callbacks to manage authentication state
- Dev route: `/dev` accessible in both auth states for `ColorsAndFonts` component

## Developer Workflows

### Build & Development
```bash
npm run dev        # Start Vite dev server (HMR enabled)
npm run build      # Production build
npm run lint       # ESLint check (eslint .)
npm run preview    # Preview production build locally
```

### Environment Setup
- **Base API URL**: Defaults to `https://localhost:7211/api` (configure via `ApiCaller.setBaseUrl()`)
- **React Router**: v7.13.0 — uses `<BrowserRouter>` wrapper in `App.jsx`
- **Vite Config**: Minimal setup with React plugin in [vite.config.js](vite.config.js)

## Project Conventions

### File Organization
- **Components**: `.jsx` files at `src/` root (page-level) or `src/assets/` (utilities)
- **Styles**: Separate CSS files in `src/css/` named after components
- **Classes**: `.js` files in `src/assets/` for non-rendering logic (`UserClass.js`, `call-api.js`, `SettingsClass.js`)
- **Assets**: Images stored in `src/assets/` (imported as modules)

### Validation Pattern
- `LoginModule` implements custom validators (example: `IsNullOrWhiteSpace()`, error border visual feedback)
- Error handling: Target DOM elements receive `errorBorder` class on validation failure
- Pattern: Validation functions return `undefined` on success, error reason on failure

### Props & Callbacks
- Parent components pass functions as props to child modules:
  - `logInTrigger(boolean)`: Updates `isLoggedIn` state
  - `setUserFunc(UserInstance)`: Updates user state
  - `callAPIFunc`: Injects `ApiCaller` instance for API calls
- Modules call these callbacks after authentication success/logout

### Canvas & Animation
- `ClickSpark` uses ResizeObserver for responsive canvas sizing
- Easing functions configurable (`ease-out` default)
- Particle animation references `requestAnimationFrame` for smooth 60fps effects

## Integration Points & Dependencies

### External Dependencies
- **React 19.2.0** with React Router v7.13.0
- **Vite 7.2.4** with React plugin for Fast Refresh
- **ESLint 9.39.1** with React hooks/refresh rules

### Backend Integration
- Default API: `https://localhost:7211/api` (ASP.NET Core typical port)
- Authentication: Bearer token in Authorization header
- Expected endpoints (inferred from code): Login, register, user profile operations

### Unimplemented Routes
Placeholder routes commented in `App.jsx` (ready for implementation):
- `/Editor`, `/Schedules`, `/Groups`, `/Settings` — buttons exist in ProfileModule

## Key Files Reference

| File | Purpose |
|------|---------|
| [src/App.jsx](src/App.jsx) | Root component, routing logic, state management |
| [src/assets/call-api.js](src/assets/call-api.js) | API client wrapper with token/error handling |
| [src/assets/UserClass.js](src/assets/UserClass.js) | User data model |
| [src/LoginModule.jsx](src/LoginModule.jsx) | Complex form validation & auth logic |
| [src/assets/ClickSpark.jsx](src/assets/ClickSpark.jsx) | Reusable particle effect component |
| [src/ColorsAndFonts.jsx](src/ColorsAndFonts.jsx) | Design system reference |

## Common Tasks for AI Agents

1. **Adding a new route**: Add to both `res` Route sets in `App.jsx`, create component in `src/`, create CSS in `src/css/`
2. **API integration**: Use `callAPIFunc.callApiAsync()` in modules, ensure token is set after login
3. **Form validation**: Follow LoginModule pattern — validation functions + DOM error class feedback
4. **Styling**: Place in component-named CSS file, import at top of JSX
5. **Visual effects**: Use or extend `ClickSpark` component for animations
