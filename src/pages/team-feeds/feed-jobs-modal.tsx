import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
} from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import { adminFetchFeedJobs, Feed, fetchFeedJobs, fetchObstractFeed, IJob } from '../../services/obstract.ts'; // Update with your actual API call

const PAGE_SIZE = 50;

const JobListPage: React.FC = () => {
    const { teamId, feedId } = useParams<{ teamId: string; feedId: string }>();
    const [jobs, setJobs] = useState<any[]>([]);
    const [feed, setFeed] = useState<Feed>()
    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);

    const loadFeed = async () => {
        if (!feedId) return
        const res = await fetchObstractFeed(feedId)
        setFeed(res.data)
    }

    const loadJobs = async () => {
        if (!feed) return
        setLoading(true);
        try {
            const response = teamId ? await fetchFeedJobs(teamId, feed.obstract_feed_metadata.id, page) : await adminFetchFeedJobs(feed.obstract_feed_metadata.id, page);
            setJobs(response.data.jobs);
            setTotalPages(Math.ceil(response.data.total_results_count / PAGE_SIZE));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadFeed() }, [])
    useEffect(() => {
        loadJobs();
    }, [page, teamId, feed]);

    const handlePageChange = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    useEffect(() => {
        document.title = 'Job List | Obstracts Web'
    }, [])

    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>
                {feed?.obstract_feed_metadata.title} jobs
            </Typography>
            {loading ? (
                <CircularProgress style={{ display: 'block', margin: '20px auto' }} />
            ) : (
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Feed ID</TableCell>
                                <TableCell>Profile ID</TableCell>
                                <TableCell>Created</TableCell>
                                <TableCell>State</TableCell>
                                <TableCell>History Status</TableCell>
                                <TableCell>Item Count</TableCell>
                                <TableCell>Processed Items</TableCell>
                                <TableCell>Failed Processes</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {jobs.map((job) => (
                                <TableRow key={job.id}>
                                    <TableCell><Link to={job.id}>{job.id}</Link></TableCell>
                                    <TableCell>{job.feed_id}</TableCell>
                                    <TableCell>{job.profile_id}</TableCell>
                                    <TableCell>{new Date(job.created).toLocaleString()}</TableCell>
                                    <TableCell>{job.state}</TableCell>
                                    <TableCell>{job.history4feed_status}</TableCell>
                                    <TableCell>{job.item_count}</TableCell>
                                    <TableCell>{job.processed_items}</TableCell>
                                    <TableCell>{job.failed_processes}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <TablePagination
                rowsPerPageOptions={[]}
                component="div"
                count={totalPages * PAGE_SIZE}
                rowsPerPage={PAGE_SIZE}
                page={page}
                onPageChange={handlePageChange}
                labelRowsPerPage={""} // Hide the rows per page label
                style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}
            />
        </Box>
    );
};

export default JobListPage;