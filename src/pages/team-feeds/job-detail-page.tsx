import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { useParams } from 'react-router-dom';
import { adminFetchFeedJob, Feed, fetchFeedJob, fetchObstractFeed, IJob } from '../../services/obstract.ts'; // Update with your actual API call
import JobDetailsComponent from './feed-job-details.tsx';

const PAGE_SIZE = 50;

const JobDetailsPage: React.FC = () => {
    const { teamId, feedId, jobId } = useParams<{ teamId: string; feedId: string, jobId: string }>();
    const [job, setJob] = useState<IJob>();
    const [feed, setFeed] = useState<Feed>()
    const [loading, setLoading] = useState<boolean>(true);

    const loadFeed = async () => {
        if (!feedId) return
        const res = await fetchObstractFeed(feedId)
        setFeed(res.data)
    }

    const loadJob = async () => {
        if (!feedId || !jobId) return
        setLoading(true);
        try {
            const response = teamId ? await fetchFeedJob(teamId, feedId, jobId) : await adminFetchFeedJob(feedId, jobId);
            setJob(response.data);
            console.log(response.data)
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        document.title = 'Job Detail | Obstracts Web'
    }, [])

    useEffect(() => {
        loadFeed()
        loadJob();
    }, [teamId, feedId, jobId]);

    return (
        <Box p={4}>
            <JobDetailsComponent feedId={feedId} teamId={teamId} job={job} feed={feed}></JobDetailsComponent>
        </Box>
    );
};

export default JobDetailsPage;