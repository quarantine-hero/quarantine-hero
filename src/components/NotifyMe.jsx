import React from "react";
import { Link } from 'react-router-dom';
import fb from '../firebase';
import { useTranslation } from "react-i18next";

export const NotifyMe = ({ location }) => {
  const { t } = useTranslation();
  
  return(
  <div className="py-3 w-full">
    <div className="my-3 w-full">
      <Link
        to="/notify-me"
        className="btn-green-secondary my-3 mb-6 w-full block"
        onClick={() => fb.analytics.logEvent("button_subscribe_region")}
      >
        {location && location !== ""
          ? t("components.filteredList.notifyMeForLocation", { location: location})
          : t("components.filteredList.notifyMeFallback")}
      </Link>
    </div>
  </div>
)};
