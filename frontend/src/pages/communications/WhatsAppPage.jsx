import React, { useState } from "react";

import {
  useParams,
  useLocation,
  useNavigate,
} from "react-router-dom";

import WhatsAppComposer from "../../components/communication/whatsapp/WhatsAppComposer";
import WhatsAppHistory from "../../components/communication/whatsapp/WhatsAppHistory";

const WhatsAppPage = ({
  leadId: leadIdProp,
  phoneNumber: phoneNumberProp,
  leadName: leadNameProp = "",
  lead: leadProp = null,
  onBack,
}) => {
  // =====================================================
  // ROUTER DATA
  // =====================================================

  const { leadId: routeLeadId } = useParams();

  const location = useLocation();

  const navigate = useNavigate();

  // Lead data passed through navigate()
  const leadFromState = location.state?.lead || null;

  // =====================================================
  // LEAD DATA
  // =====================================================

  const leadData =
    leadProp ||
    leadFromState ||
    null;

  const leadId =
    leadIdProp ||
    routeLeadId ||
    leadData?._id ||
    leadData?.id ||
    leadData?.leadId ||
    "";

  const phoneNumber =
    phoneNumberProp ||
    leadData?.contact ||
    leadData?.phone ||
    leadData?.mobile ||
    leadData?.phoneNumber ||
    "";

  const leadName =
    leadNameProp ||
    leadData?.name ||
    leadData?.fullName ||
    leadData?.leadName ||
    "Lead";

  // =====================================================
  // STATE
  // =====================================================

  // Composer is shown first.
  const [historyOpen, setHistoryOpen] = useState(false);

  // Used to refresh history after WhatsApp is opened.
  const [historyRefreshKey, setHistoryRefreshKey] =
    useState(0);

  // =====================================================
  // BACK
  // =====================================================

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/leads");
  };

  // =====================================================
  // OPEN HISTORY
  // =====================================================

  const handleOpenHistory = () => {
    if (!leadId) {
      return;
    }

    setHistoryOpen(true);
  };

  // =====================================================
  // CLOSE HISTORY
  // =====================================================

  const handleCloseHistory = () => {
    setHistoryOpen(false);
  };

  // =====================================================
  // WHATSAPP OPENED
  // =====================================================

  const handleWhatsAppOpened = () => {
    /*
     * Normal WhatsApp does not tell our application
     * whether the executive actually pressed Send.
     *
     * We only record that WhatsApp was opened with
     * the prepared message.
     *
     * Increase the refresh key so History can reload.
     */

    setHistoryRefreshKey(
      (previous) => previous + 1
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-[#F7F9FC]">

      {/* =================================================
          WHATSAPP COMPOSER

          This is the first screen.

          IMPORTANT:
          When History is open, the Composer is hidden.
          This prevents the Composer from overlapping
          the History modal.
      ================================================= */}

      <WhatsAppComposer
        isOpen={!historyOpen}
        onClose={handleBack}
        onHistory={handleOpenHistory}
        leadId={leadId}
        phoneNumber={phoneNumber}
        leadName={leadName}
        lead={leadData}
        onSent={handleWhatsAppOpened}
      />

      {/* =================================================
          WHATSAPP HISTORY

          When History is clicked, this becomes visible
          while the Composer is hidden.
      ================================================= */}

      <WhatsAppHistory
        isOpen={historyOpen}
        onClose={handleCloseHistory}
        leadId={leadId}
        lead={leadData}
        refreshKey={historyRefreshKey}
      />

    </div>
  );
};

export default WhatsAppPage;