import React, { useState, useEffect, useContext } from 'react';
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
    Button,
    TablePagination,
} from '@mui/material';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getPostsByExtraction, Post, subscribeTeamObstractFeeds, TeamFeed } from '../../../services/obstract.ts';
import { useAlert } from '../../../contexts/alert-context.tsx';
import { URLS } from '../../../services/urls.ts';
import { TeamRouteContext } from '../../team-layout.tsx/index.tsx';
import { TeamContext } from '../../../contexts/team-context.tsx';

interface PostWithFeed extends Post {
    feed: TeamFeed
}

const ObjectPostsPage: React.FC = () => {
    const { teamId } = useContext(TeamRouteContext)
    const { objectId } = useParams<{ objectId: string }>()
    const [reportData, setReportData] = useState<PostWithFeed[]>([])
    const [loading, setLoading] = useState<boolean>(false);
    const [value, setValue] = useState('');
    const [type, setType] = useState('');
    const [initialDataLoaded, setInitialDataLoaded] = useState(false)
    const location = useLocation();
    const { activeTeam } = useContext(TeamContext)
    const [disableViewPost, setDisableViewPost] = useState(false)
    const [page, setPage] = useState<number>(0); // Current page
    const [pageSize, setPageSize] = useState<number>(10); // Profiles per page
    const [dataCount, setDataCount] = useState<number>(0); // Total number of pages

    const alert = useAlert()

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        setValue(query.get('value') || '')
        setType(query.get('type') || '')
        setInitialDataLoaded(true)
    }, [location])

    useEffect(() => {
        if (!activeTeam) return
        if (!activeTeam.has_active_subscription) {
            setDisableViewPost(true)
        }
    }, [activeTeam])

    useEffect(() => {
        if (initialDataLoaded) loadReports()
    }, [initialDataLoaded])

    const loadReports = async () => {
        if(!objectId) return
        setLoading(true)
        const res = await getPostsByExtraction(teamId, objectId, page + 1)
        setReportData(res.data.posts)
        setDataCount(res.data.total_results_count);
        setPageSize(res.data.page_size)
        setLoading(false)
    }

    useEffect(() => { loadReports() }, [page])

    const subscribe = async (feed_id: string) => {
        try {
            await subscribeTeamObstractFeeds(teamId || '', feed_id)
            loadReports()
        } catch (err) {
            if (err.response.status === 400 && err.response.data.code === "E01") {
                alert.showAlert(err.response.data.message, 'error')
            }
        }
    }

    useEffect(() => {
        document.title = 'Observable Posts | Obstracts Web'
    }, [])


    const handlePageChange = (event: unknown, value: number) => {
        setPage(value); // Set new page number
    };

    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>
                Observable Posts
            </Typography>
            <Typography>List of posts for the object {type}|{value}</Typography>
            {loading ? (
                <CircularProgress style={{ display: 'block', margin: '20px auto' }} />
            ) : (
                <>
                    <TableContainer sx={{ marginTop: '2rem' }}>
                        <Typography variant='h5'>Posts</Typography>
                        {teamId && <Typography>List of posts, you can only access subscribed posts</Typography>}
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Post Title</TableCell>
                                    <TableCell>Post Date</TableCell>
                                    <TableCell>Post Author</TableCell>
                                    <TableCell>Post Tags</TableCell>
                                    <TableCell>Feed Name</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {reportData.map((post) => (
                                    <TableRow key={post.id}>
                                        <TableCell>
                                            {disableViewPost || !post.feed?.is_subscribed ? (<>{post.title}</>) : (
                                                <Link to={teamId ? URLS.teamFeedPost(teamId, post.feed?.id, post.id) : URLS.staffObstractPost(post?.feed.id, post.id)}>
                                                    {post.title}
                                                </Link>
                                            )}
                                        </TableCell>
                                        <TableCell>{new Date(post.datetime_added || '').toLocaleDateString()}</TableCell>
                                        <TableCell>{post.author}</TableCell>
                                        <TableCell>{post.categories}</TableCell>
                                        <TableCell>{post.feed?.obstract_feed_metadata.title}</TableCell>
                                        <TableCell>{!post.feed?.is_subscribed &&
                                            <Button disabled={disableViewPost} variant='contained' onClick={() => subscribe(post.feed?.id)}>Subscribe to feed</Button>
                                        }</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    {/* Pagination controls */}
                    <TablePagination
                        component="div"
                        count={dataCount}
                        page={page}
                        rowsPerPage={pageSize}
                        onPageChange={handlePageChange}
                        color="primary"
                        rowsPerPageOptions={[]}
                        labelRowsPerPage={""} // Hide the rows per page label
                        style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}
                    />
                </>
            )
            }
        </Box >
    );
};

export default ObjectPostsPage;