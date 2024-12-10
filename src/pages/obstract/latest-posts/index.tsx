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
    TablePagination,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getLatestPosts, Post, subscribeTeamObstractFeeds, TeamFeed } from '../../../services/obstract.ts';
import { useAlert } from '../../../contexts/alert-context.tsx';
import { URLS } from '../../../services/urls.ts';
import { TeamRouteContext } from '../../team-layout.tsx/index.tsx';
import { TeamContext } from '../../../contexts/team-context.tsx';

interface PostWithFeed extends Post {
    feed: TeamFeed;
    comment: string;
}

const LatestPostsPage: React.FC = () => {
    const { teamId } = useContext(TeamRouteContext)
    const [posts, setPosts] = useState<PostWithFeed[]>([])
    const [loading, setLoading] = useState<boolean>(false);
    const [sort, setSort] = useState('pubdate_descending');
    const [title, setTitle] = useState('');
    const [initialDataLoaded, setInitialDataLoaded] = useState(false)
    const location = useLocation();
    const { activeTeam } = useContext(TeamContext)
    const [disableViewPost, setDisableViewPost] = useState(false)
    const [page, setPage] = useState<number>(0); // Current page
    const [pageSize, setPageSize] = useState<number>(10); // Profiles per page
    const [dataCount, setDataCount] = useState<number>(0); // Total number of pages

    const alert = useAlert()

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
        setLoading(true)
        const res = await getLatestPosts(teamId, sort, title, page + 1)
        setPosts(res.data.posts)
        setDataCount(res.data.total_results_count);
        setPageSize(res.data.page_size)
        setLoading(false)
    }

    useEffect(() => { loadReports() }, [page])

    useEffect(() => {
        document.title = 'Latest Posts | Obstracts Web'
    }, [])


    const handlePageChange = (event: unknown, value: number) => {
        setPage(value); // Set new page number
    };

    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>
                Your latest posts
            </Typography>
            {teamId && <Typography>Here are all the posts you are currently subscribed to</Typography>}

            <Box mb={5} sx={{ display: 'flex' }}>
                <TextField
                    type="text"
                    value={title}
                    onChange={(ev) => { setTitle(ev.target.value) }}
                    placeholder="Title"
                    className="email-input"
                    label="Title"
                />
                <FormControl sx={{ margin: '0rem 1rem' }}>
                    <InputLabel id="sort">Sort By</InputLabel>
                    <Select
                        value={sort}
                        labelId='sort'
                        label="Sort"
                        className="email-input"
                        placeholder='sort'
                        onChange={(ev) => setSort(ev.target.value)}
                    >
                        <MenuItem value="pubdate_descending">Publish Date(Descending)</MenuItem>
                        <MenuItem value="pubdate_ascending">Publish Date(Ascending)</MenuItem>
                        <MenuItem value="title_descending">Title(Descending)</MenuItem>
                        <MenuItem value="title_ascending">Title(Ascending)</MenuItem>

                    </Select>
                </FormControl>
                <Button variant='contained' onClick={() => loadReports()}>filter</Button>
            </Box>

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
                                    <TableCell>Comment</TableCell>
                                    <TableCell>Post Date</TableCell>
                                    <TableCell>Post Author</TableCell>
                                    <TableCell>Post Tags</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {posts.map((post) => (
                                    <TableRow key={post.id}>
                                        <TableCell>
                                            <Link to={teamId ? URLS.teamFeedPost(teamId, post.feed_id, post.id) : URLS.staffObstractPost(post?.feed_id, post.id)}>
                                                {post.title}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{post.comment}</TableCell>
                                        <TableCell>{new Date(post.datetime_added || '').toLocaleDateString()}</TableCell>
                                        <TableCell>{post.author}</TableCell>
                                        <TableCell>{post.categories}</TableCell>
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

export default LatestPostsPage;