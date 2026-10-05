import React from "react";
import FollowUpsPage from "./FollowUpsPage";

const OverdueFollowUps = () => {
    return (
        <FollowUpsPage
            type="OVERDUE"
            title="Overdue Follow Ups"
            description="Follow-up tasks that are overdue and have not been completed."
        />
    );
};

export default OverdueFollowUps;