import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
} from '@mui/material';
import { useParams, useLocation } from 'react-router-dom';
import { Api, Product } from '../../services/api.ts';
import { URLS } from '../../services/urls.ts';

const ConfirmSubscription: React.FC = () => {
    const { team_id } = useParams<{ team_id: string }>();
    const [teamIdNumber, setTeamIdNumber] = useState(0);

    // Use location to get the query params
    const location = useLocation();

    useEffect(() => {
        if (!team_id) return;
        setTeamIdNumber(Number(team_id));
    }, [team_id]);

    // Function to extract query params from URL
    const getQueryParams = (query: string) => {
        return new URLSearchParams(query);
    };

    const confirmSubscriptionPayment = async (sessionId: string) => {
        try {
            const res = await Api.confirmChangeSubscriptionPlan(teamIdNumber, sessionId);
            window.location.href = URLS.teamManagement(team_id)
        } catch (error) {
            console.error('Error confirming subscription:', error);
        }
    };

    useEffect(() => {
        const params = getQueryParams(location.search);
        const sessionId = params.get('session_id');

        if (sessionId && teamIdNumber) {
            confirmSubscriptionPayment(sessionId);
        }
    }, [location.search, teamIdNumber]);

    return (
        <Container maxWidth="lg" style={{ padding: '20px' }}>
            <Typography variant="h4" gutterBottom>
                Confirming Subscription...
            </Typography>
        </Container>
    );
};

export default ConfirmSubscription;
