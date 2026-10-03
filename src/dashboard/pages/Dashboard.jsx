import StatisticsCards from "../components/dashboard/StatisticsCards";
import VehicleChart from "../components/dashboard/VehicleChart";
import WasteChart from "../components/dashboard/WasteChart";
import ContractorsChart from "../components/dashboard/ContractorsChart";
import RecentOperations from "../components/dashboard/RecentOperations";
import GatesDevices from "../components/dashboard/GatesDevices";
import LocationsMap from "../components/dashboard/LocationsMap";
// import MadinatiIntegration from "../components/dashboard/MadinatiIntegration";
import QuickReports from "../components/dashboard/QuickReports";
import Alerts from "../components/dashboard/Alerts";

export default function Dashboard() {
  return (
    <div className="min-h-screen p-6" dir="rtl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">لوحة التحكم</h1>

        <p className="mt-1 text-sm text-slate-500">نظرة عامة على أداء النظام والعمليات الجارية</p>
      </div>

      {/* Statistics */}
      <StatisticsCards />

      {/* Charts */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <VehicleChart />
        <WasteChart />
        <ContractorsChart />
      </div>

      {/* Operations */}
      <div className="mt-5 grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12">
        <div className="flex lg:col-span-6">
          <RecentOperations />
        </div>

        <div className="flex lg:col-span-6">
          <GatesDevices />
        </div>

        {/* <div className="lg:col-span-3">
          <LocationsMap />
        </div> */}
      </div>

      {/* Bottom Cards */}
      <div className="mt-5 grid grid-cols-1 items-stretch gap-5 lg:grid-cols-3">
        {/* <MadinatiIntegration /> */}
        <div className="flex">
          <LocationsMap />
        </div>

        <div className="flex">
          <QuickReports />
        </div>
        <div className="flex">
          <Alerts />
        </div>
      </div>
    </div>
  );
}
