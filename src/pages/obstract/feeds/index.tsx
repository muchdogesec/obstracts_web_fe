import React, { useEffect } from 'react';
import {
    Box,
    Typography,
} from '@mui/material';
import FeedsTable from '../feed_table.tsx';


const FeedsPage: React.FC = () => {
    useEffect(() => {
        document.title = 'Feeds Management | Obstracts Web'
    }, [])

    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>
                Feed Management
            </Typography>
            <Typography>Manage the feeds available to users in Obstracts web. Feeds marked private cannot be seen by users.</Typography>
            <FeedsTable showAdd={true}></FeedsTable>
        </Box>
    );
};

export default FeedsPage;
