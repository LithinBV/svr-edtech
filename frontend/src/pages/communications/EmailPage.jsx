import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import EmailComposer from "../../components/communication/email/EmailComposer";
import EmailHistory from "../../components/communication/email/EmailHistory";

const EmailPage = ({
  leadId: propLeadId,
  lead: propLead,
  email: propEmail,
  leadName: propLeadName,
  onBack: propOnBack,
}) => {
  const { leadId: routeLeadId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // ============================================================
  // GET LEAD DATA
  // ============================================================

  const locationLead = location.state?.lead || null;

  const lead = propLead || locationLead || {};

  const leadId =
    propLeadId ||
    routeLeadId ||
    lead?._id ||
    lead?.id ||
    null;

  const leadEmail =
    propEmail ||
    lead?.email ||
    lead?.emailAddress ||
    lead?.emailId ||
    "";

  const leadName =
    propLeadName ||
    lead?.name ||
    lead?.fullName ||
    lead?.firstName ||
    "Lead";

  // ============================================================
  // STATES
  // ============================================================

  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  // ============================================================
  // BACK
  // ============================================================

  const handleBack = () => {
    if (typeof propOnBack === "function") {
      propOnBack();
      return;
    }

    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/leads");
  };

  // ============================================================
  // OPEN HISTORY
  // ============================================================

  const handleOpenHistory = () => {
    if (!leadId) return;

    setHistoryOpen(true);
  };

  // ============================================================
  // CLOSE HISTORY
  // ============================================================

  const handleCloseHistory = () => {
    setHistoryOpen(false);
  };

  // ============================================================
  // EMAIL SENT
  // ============================================================

  const handleEmailSent = () => {
    setHistoryRefreshKey((previous) => previous + 1);
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      {/* ====================================================== */}
      {/* EMAIL COMPOSER */}
      {/* ====================================================== */}

      {!historyOpen && (
        <EmailComposer
          isOpen={true}
          onClose={handleBack}
          onHistory={handleOpenHistory}
          leadId={leadId}
          email={leadEmail}
          leadName={leadName}
          lead={lead}
          onSent={handleEmailSent}
        />
      )}

      {/* ====================================================== */}
      {/* EMAIL HISTORY */}
      {/* ====================================================== */}

      {historyOpen && (
        <EmailHistory
          isOpen={true}
          onClose={handleCloseHistory}
          leadId={leadId}
          lead={lead}
          refreshKey={historyRefreshKey}
        />
      )}
    </div>
  );
};

export default EmailPage;