import appConfig from "../../config/appConfig";
import Card from "./Card";

const StatCard = ({ label, value, subLabel }) => {
  return (
    <Card>
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-800">
        {appConfig.currencySymbol}{value}
      </p>
      {subLabel && (
        <p className="mt-1 text-xs text-slate-500">{subLabel}</p>
      )}
    </Card>
  );
};

export default StatCard;
