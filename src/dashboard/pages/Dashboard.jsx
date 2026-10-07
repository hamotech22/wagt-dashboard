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
// import Breadcrumb from "../components/common/Breadcrumb";

export default function Dashboard() {


  return (
    <div className="min-h-screen bg-slate-100 p-6 dark:bg-slate-950" dir="rtl">
      {/* <Breadcrumb>
        <Breadcrumb.Current>لوحة التحكم</Breadcrumb.Current>
      </Breadcrumb> */}
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">لوحة التحكم</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">نظرة عامة على أداء النظام والعمليات الجارية</p>
        </div>
      
      </div>

      {/* Statistics */}
      <StatisticsCards />

      {/* Charts */}
      <div className="mt-5 grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-3">
        <VehicleChart />
        <WasteChart />
        <ContractorsChart />
      </div>

      {/* Operations */}
      <div className="mt-5 grid min-w-0 grid-cols-1 items-stretch gap-5 lg:grid-cols-12">
        <div className="flex min-w-0 lg:col-span-6">
          <RecentOperations />
        </div>

        <div className="flex min-w-0 lg:col-span-6">
          <GatesDevices />
        </div>

        {/* <div className="lg:col-span-3">
          <LocationsMap />
        </div> */}
      </div>

      {/* Bottom Cards */}
      <div className="mt-5 grid min-w-0 grid-cols-1 items-stretch gap-5 lg:grid-cols-3">
        {/* <MadinatiIntegration /> */}
        <div className="flex min-w-0">
          <LocationsMap />
        </div>

        <div className="flex min-w-0">
          <QuickReports />
        </div>
        <div className="flex min-w-0">
          <Alerts />
        </div>
      </div>
    </div>
  );
}
