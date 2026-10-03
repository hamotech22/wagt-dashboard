import { Routes, Route, Navigate, Outlet } from "react-router-dom";

// Layout
import DashboardLayout from "../components/layout/DashboardLayout";

// Dashboard
import Dashboard from "../pages/Dashboard";

// Organizations
import OrganizationsList from "../pages/organizations/OrganizationsList";
import AddOrganization from "../pages/organizations/AddOrganization";
import EditOrganization from "../pages/organizations/EditOrganization";
import OrganizationDetails from "../pages/organizations/OrganizationDetails";

// Projects
import ProjectsList from "../pages/projects/ProjectsList";
import AddProject from "../pages/projects/AddProject";
import EditProject from "../pages/projects/EditProject";
import ProjectDetails from "../pages/projects/ProjectDetails";

// Contractors
import ContractorsList from "../pages/contractors/ContractorsList";
import AddContractor from "../pages/contractors/AddContractor";
import EditContractor from "../pages/contractors/EditContractor";
import ContractorDetails from "../pages/contractors/ContractorDetails";

// Sites
import SitesList from "../pages/sites/SitesList";
import AddSite from "../pages/sites/AddSite";
import EditSite from "../pages/sites/EditSite";
import SiteDetails from "../pages/sites/SiteDetails";

// Gates
import GatesList from "../pages/gates/GatesList";
import AddGate from "../pages/gates/AddGate";
import EditGate from "../pages/gates/EditGate";
import GateDetails from "../pages/gates/GateDetails";

// Devices
import DevicesList from "../pages/devices/DevicesList";
import AddDevice from "../pages/devices/AddDevice";
import EditDevice from "../pages/devices/EditDevice";
import DeviceDetails from "../pages/devices/DeviceDetails";

// Vehicles
import VehiclesList from "../pages/vehicles/VehiclesList";
import AddVehicle from "../pages/vehicles/AddVehicle";
import EditVehicle from "../pages/vehicles/EditVehicle";
import VehicleDetails from "../pages/vehicles/VehicleDetails";

// Transactions
import TransactionsList from "../pages/transactions/TransactionsList";
import EntryTransactions from "../pages/transactions/EntryTransactions";
import ExitTransactions from "../pages/transactions/ExitTransactions";
import TransactionDetails from "../pages/transactions/TransactionDetails";

// Reports
import Reports from "../pages/reports/Reports";

// Notifications
import Notifications from "../pages/notifications/Notifications";

// Users
import UsersList from "../pages/users/UsersList";
import AddUser from "../pages/users/AddUser";
import EditUser from "../pages/users/EditUser";
import UserDetails from "../pages/users/UserDetails";
import Roles from "../pages/users/Roles";
import Permissions from "../pages/users/Permissions";
import UserProfile from "../pages/users/UserProfile";

export default function DashboardRoutes() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        {/* Dashboard */}
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<UserProfile />} />

        {/* Notifications */}
        <Route path="notifications" element={<Notifications />} />

        {/* Core Platform */}
        <Route element={<Outlet />}>
          {/* Organizations */}
          <Route path="organizations">
            <Route index element={<OrganizationsList />} />
            <Route path="add" element={<AddOrganization />} />
            <Route path="edit/:id" element={<EditOrganization />} />
            <Route path=":id" element={<OrganizationDetails />} />
          </Route>

          {/* Projects */}
          <Route path="projects">
            <Route index element={<ProjectsList />} />
            <Route path="add" element={<AddProject />} />
            <Route path="edit/:id" element={<EditProject />} />
            <Route path=":id" element={<ProjectDetails />} />
          </Route>

          {/* Contractors */}
          <Route path="contractors">
            <Route index element={<ContractorsList />} />
            <Route path="add" element={<AddContractor />} />
            <Route path="edit/:id" element={<EditContractor />} />
            <Route path=":id" element={<ContractorDetails />} />
          </Route>

          {/* Users */}
          <Route path="users">
            <Route index element={<UsersList />} />
            <Route path="add" element={<AddUser />} />
            <Route path="edit/:id" element={<EditUser />} />
            <Route path="roles" element={<Roles />} />
            <Route path="permissions" element={<Permissions />} />
            <Route path="user_profile" element={<UserProfile />} />
            <Route path=":id" element={<UserDetails />} />
          </Route>
        </Route>

        {/* Smart Gates */}
        <Route element={<Outlet />}>
          {/* Sites */}
          <Route path="sites">
            <Route index element={<SitesList />} />
            <Route path="add" element={<AddSite />} />
            <Route path="edit/:id" element={<EditSite />} />
            <Route path=":id" element={<SiteDetails />} />
          </Route>

          {/* Gates */}
          <Route path="gates">
            <Route index element={<GatesList />} />
            <Route path="add" element={<AddGate />} />
            <Route path="edit/:id" element={<EditGate />} />
            <Route path=":id" element={<GateDetails />} />
          </Route>

          {/* Devices */}
          <Route path="devices">
            <Route index element={<DevicesList />} />
            <Route path="add" element={<AddDevice />} />
            <Route path="edit/:id" element={<EditDevice />} />
            <Route path=":id" element={<DeviceDetails />} />
          </Route>

          {/* Vehicles */}
          <Route path="vehicles">
            <Route index element={<VehiclesList />} />
            <Route path="add" element={<AddVehicle />} />
            <Route path="edit/:id" element={<EditVehicle />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path=":id" element={<VehicleDetails />} />
          </Route>

          {/* Transactions */}
          <Route path="transactions">
            <Route index element={<TransactionsList />} />
            <Route path="entry" element={<EntryTransactions />} />
            <Route path="exit" element={<ExitTransactions />} />
            <Route path=":id" element={<TransactionDetails />} />
          </Route>
        </Route>

        {/* Reports */}
        <Route path="reports" element={<Reports />} />
      </Route>

      {/* Dashboard 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
