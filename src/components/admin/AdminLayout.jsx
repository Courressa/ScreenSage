import { Outlet } from "react-router-dom";
import AdminSideBar from "./AdminSideBar";

export default function AdminLayout() {
  return (
    <div className="admin-layout">
        <AdminSideBar />
        <div className="admin-content">
            <Outlet />        {/* This renders the child routes */}
      </div>
    </div>
  )
}
