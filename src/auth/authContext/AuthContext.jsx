// import { createContext, useContext, useState } from "react";
// import { loginPathForTenant } from "../tenant/tenant";

// const SESSION_KEY = "waqt_session";

// function readSession() {
//   try {
//     const raw = localStorage.getItem(SESSION_KEY);
//     return raw ? JSON.parse(raw) : null;
//   } catch {
//     return null;
//   }
// }

// export const defaultAuthValue = {
//   session: null,
//   login: () => {},
//   logout: () => {},
//   hasModule: () => false,
//   can: () => false,
// };

// export const AuthContext = createContext(defaultAuthValue);

// export function AuthProvider({ children }) {
//   const [session, setSession] = useState(readSession);
//   // شكل session المتوقع من الـ Backend:
//   // {
//   //   user: { name: "أحمد", role: "ContractorAdmin" },
//   //   tenant: { id: 1, name: "أمانة منطقة نجران", slug: "najran" },
//   //   modules: ["smart-gates", "madinati", "reports"],
//   //   permissions: ["gates.view", "integration.retry"]
//   // }

//   const login = (data) => {
//     setSession(data);
//     localStorage.setItem(SESSION_KEY, JSON.stringify(data));
//   };

//   const logout = () => {
//     const slug = session?.tenant?.slug;
//     setSession(null);
//     localStorage.removeItem(SESSION_KEY);
//     window.location.assign(loginPathForTenant(slug));
//   };

//   const hasModule = (m) => session?.modules?.includes(m);
//   const can = (p) => session?.permissions?.includes(p);

//   return <AuthContext.Provider value={{ session, login, logout, hasModule, can }}>{children}</AuthContext.Provider>;
// }

// export const useAuth = () => useContext(AuthContext);
