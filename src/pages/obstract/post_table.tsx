import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
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
    MenuItem,
    Select,
    InputLabel,
    FormControl,
} from '@mui/material';
import FeedFormModal from './feeds/feed-modal.tsx';
import { Feed, fetchObstractFeeds, fetchObstractPosts, Post } from '../../services/obstract.ts';
import { Link, useLocation } from 'react-router-dom';
import { getDateString, updateURLWithParams } from '../../services/utils.ts';
import Markdown from 'react-markdown';

const PAGE_SIZE = 10;

interface FeedsTableProps {
    feedId?: string;
    teamId?: string;
    showAdd?: boolean;
    disabled: boolean;
}

const PostsTable: React.FC<FeedsTableProps> = ({
    feedId, showAdd, teamId, disabled
}: FeedsTableProps) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(0);
    const [totalPostCount, setTotalPostCount] = useState<number>(1);
    const [openModal, setOpenModal] = useState(false);
    const [selectedFeed, setSelectedFeed] = useState<Feed | null>(null);
    const [formData, setFormData] = useState<Partial<Feed>>({});

    // Filter and sorting states
    const [filter, setFilter] = useState<string>('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [sortField, setSortField] = useState<string>('pubdate');
    const [initialDataLoaded, setInitialDataLoaded] = useState(false)
    const location = useLocation();

    useEffect(() => {
        updateURLWithParams({
            sortOrder, page, filter, sortField
        })
    }, [sortOrder, page, filter, sortField])

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        setSortOrder(query.get('sortOrder') === 'asc' ? 'asc' : 'desc')
        setPage(Number(query.get('page') || 0))
        setFilter(query.get('filter') || '')
        setSortField(query.get('sortField') || 'pubdate')
        setInitialDataLoaded(true)
    }, [location])

    useEffect(() => { loadPosts(page) }, [initialDataLoaded])


    const loadPosts = async (pageNumber: number) => {
        if(!initialDataLoaded) return
        if (!feedId) return
        setLoading(true);
        const sortDict = {
            title: {
                asc: 'title_ascending',
                desc: 'title_descending',
            },
            pubdate: {
                asc: 'pubdate_ascending',
                desc: 'pubdate_descending',
            },
        }
        const response = await fetchObstractPosts(feedId, pageNumber, sortDict[sortField][sortOrder], filter);
        setPosts(response.data.posts);
        setTotalPostCount(response.data.total_results_count);
        setLoading(false);
    };

    useEffect(() => {
        loadPosts(page);
    }, [page, filter, sortField, sortOrder, feedId]);

    const handleModalOpen = (feed?: Feed) => {
        setSelectedFeed(feed || null);
        setFormData(feed || {});
        setOpenModal(true);
    };

    const handleModalClose = () => {
        setSelectedFeed(null);
        setFormData({});
        setOpenModal(false);
    };

    const reloadData = () => {
        setOpenModal(false);
        loadPosts(page);
    };

    const handlePageChange = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFilter(event.target.value);
        setPage(0); // Reset to first page on filter change
    };

    const handleSortChange = (field: string) => {
        const newOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(newOrder);
        setPage(0); // Reset to first page on sort change
    };

    return (
        <Box>
            {showAdd &&
                <Button variant="contained" color="primary" onClick={() => handleModalOpen()} style={{ marginBottom: '16px' }}>
                    Add New Feed
                </Button>}

            {/* Filters */}
            <Box display="flex" alignItems="center" marginBottom={2}>
                <TextField
                    label="Filter by Title"
                    variant="outlined"
                    value={filter}
                    onChange={handleFilterChange}
                    style={{ marginRight: '16px', width: '300px' }}
                />
            </Box>

            {loading ? (
                <CircularProgress style={{ display: 'block', margin: '20px auto' }} />
            ) : (
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell onClick={() => handleSortChange('title')} style={{ cursor: 'pointer' }}>
                                    Titlea {sortField === 'title' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                                </TableCell>
                                <TableCell>
                                    Summary
                                </TableCell>
                                <TableCell onClick={() => handleSortChange('pubdate')} style={{ cursor: 'pointer' }}>
                                    Post Date {sortField === 'pubdate' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                                </TableCell>
                                <TableCell>
                                    Author
                                </TableCell>
                                <TableCell>
                                    Post tags
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {posts.map((post) => (
                                <TableRow key={post.id}>
                                    <TableCell>
                                        {
                                            disabled ? post.title : (
                                                <Link to={`posts/${post.id}`}>
                                                    {post.title}
                                                </Link>
                                            )
                                        }
                                    </TableCell>
                                    <TableCell>
                                        <Markdown>{post.summary}</Markdown>
                                    </TableCell>
                                    <TableCell>{getDateString(post.pubdate)}</TableCell>
                                    <TableCell>{post.author}</TableCell>
                                    <TableCell>{post.categories}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <TablePagination
                rowsPerPageOptions={[]}
                component="div"
                count={totalPostCount}
                rowsPerPage={PAGE_SIZE}
                page={page}
                onPageChange={handlePageChange}
                labelRowsPerPage={""} // Hide the rows per page label
                style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}
            />

            {/* <FeedFormModal
                open={openModal}
                onClose={handleModalClose}
                onAddEntry={reloadData}
            /> */}
        </Box>
    );
};

export default PostsTable;