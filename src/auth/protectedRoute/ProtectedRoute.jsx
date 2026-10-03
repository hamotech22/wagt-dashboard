// import { Navigate, Outlet } from "react-router-dom";
// import { useAuth } from "./AuthContext";

// // يعمل بطريقتين:
// // 1) <ProtectedRoute><DashboardLayout/></ProtectedRoute>   (children)
// // 2) <Route element={<ProtectedRoute module="reports" />}> (Outlet)
// export default function ProtectedRoute({ children, module }) {
//   const auth = useAuth();

//   if (!auth) return <Navigate to="/login" replace />;

//   const { session, hasModule } = auth;

//   if (!session) return <Navigate to="/login" replace />;
//   if (module && !hasModule(module)) return <Navigate to="/forbidden" replace />;

//   return children ?? <Outlet />;
// }
