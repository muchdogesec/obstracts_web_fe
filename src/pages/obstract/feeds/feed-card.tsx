import React from 'react';
import { Card, CardContent, Typography, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { Feed } from '../../../services/obstract.ts';
import { URLS } from '../../../services/urls.ts';

interface FeedCardProps {
    feed: Feed;
    onEdit: () => void;
    onDelete: () => void;
}

const FeedCard: React.FC<FeedCardProps> = ({ feed, onEdit, onDelete }) => {
    return (
        <Card variant="outlined" style={{ margin: '16px', padding: '16px', width: '30%' }}>
            <CardContent>
                <Typography variant="h5">{feed.obstract_feed_metadata.title}</Typography>
                <Typography variant="body2">{feed.obstract_feed_metadata.description}</Typography>
                <Typography variant="caption">Posts: {feed.obstract_feed_metadata.count_of_posts}</Typography>
                <Box mt={2}>
                    <Link to={URLS.staffObstractFeed(feed.id)}>
                        <Button>Details</Button></Link>
                </Box>
            </CardContent>
        </Card>
    );
};

export default FeedCard;
