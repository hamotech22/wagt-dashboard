import { Link } from "react-router-dom";

export default function Forbidden() {
  return (
    <div style={{ textAlign: "center", marginTop: 80 }}>
      <h2>🚫 غير مصرح لك بالدخول لهذه الصفحة</h2>
      <Link to="/dashboard">العودة للرئيسية</Link>
    </div>
  );
}
