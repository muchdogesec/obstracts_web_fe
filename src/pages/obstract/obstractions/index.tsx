import React, { useState, useEffect, useRef, useContext } from 'react';
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
    List,
    ListItem,
    ListItemText,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    Tooltip,
} from '@mui/material';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adminFetchPostJobs, changePostProfileId, Feed, fetchFeedJobs, fetchObstractFeed, fetchObstractPost, fetchObstractPosts, fetchPostJobs, fetchPostMarkdown, fetchPostObjects, fetchTeamPostObjects, IJob, ObstractsObject, Post } from '../../../services/obstract.ts';
import JobDetailsPage from '../../team-feeds/feed-job-details.tsx';
import DOMPurify from 'dompurify';

import './styles.css'
import { URLS } from '../../../services/urls.ts';
import { TeamContext } from '../../../contexts/team-context.tsx';
import { TeamRouteContext } from '../../team-layout.tsx/index.tsx';
import { getDateString, getScoValue } from '../../../services/utils.ts';
import { useAuth0 } from '@auth0/auth0-react';
import ReindexingDialog from './reindex.tsx';
import DeleteDialog from './delete-dialog.tsx';

const PAGE_SIZE = 50;

const SDO_TYPES = new Set([
    'attack-pattern',
    'campaign',
    'course-of-action',
    'identity',
    'indicator',
    'infrastructure',
    'intrusion-set',
    'location',
    'malware',
    'note',
    'report',
    'threat-actor',
    'tool',
    'weakness'
])

const SCO_TYPES = new Set([
    'domain-name',
    'autonomous-system',
    'bank-account',
    'bank-card',
    'cryptocurrency-transaction',
    'cryptocurrency-wallet',
    'directory',
    'email-addr',
    'file',
    'ipv4-addr',
    'ipv6-addr',
    'mac-addr',
    'network-traffic',
    'phone-number',
    'url',
    'user-agent',
    'windows-registry-key',
])

const PostDetailsPage: React.FC = () => {
    const { feedId, postId } = useParams<{ feedId: string, postId: string }>();
    const { teamId } = useContext(TeamRouteContext)
    const [objects, setObjects] = useState<ObstractsObject[]>([]);
    const [post, setPost] = useState<Post>()
    const [jobs, setJobs] = useState<IJob[]>([])
    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [openJobModal, setOpenJobModal] = useState(false)
    const [jobUrl, setJobUrl] = useState("")
    const [feed, setFeed] = useState<Feed>()
    const [feedUrl, setFeedUrl] = useState('')
    const { activeTeam } = useContext(TeamContext)
    const [reportId, setReportId] = useState('')
    const [showReindexDialog, setShowReindexDialog] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const { user } = useAuth0()
    const navigate = useNavigate()

    const stixRef = useRef(null);

    const loadPost = async () => {
        if (!postId || !feedId) return
        const response = await fetchObstractPost(feedId, postId);
        setPost(response.data)
    }

    const loadJobs = async () => {
        if (!postId || !feedId) return
        if (!teamId) {
            const response = await adminFetchPostJobs(feedId, postId);
            setJobs(response.data.jobs)
        }
    }

    const loadFeed = async () => {
        if (!feedId) return
        if (teamId) {
            setFeedUrl(URLS.teamFeed(teamId, feedId))
        } else {
            setFeedUrl(URLS.staffObstractFeed(feedId))
        }
        const res = await fetchObstractFeed(feedId)

        setFeed(res.data)
    }

    useEffect(() => {
        loadPost();
        loadFeed()
        loadJobs();
        loadObjects()
    }, [feedId, postId])

    const fetchAllObjectsApi = async (feedId: string, postId: string, page: number) => {
        if (teamId) {
            return fetchTeamPostObjects(teamId, feedId, postId, page)
        } else {
            return fetchPostObjects(feedId, postId, page)
        }
    }
    const fetchAllObjects = async (feedId: string, postId: string, page: number) => {
        const data = await fetchAllObjectsApi(feedId, postId, page);
        const total_results_count = data.total_results_count
        setObjects((objects) => [...objects, ...data.objects]);
        if ((total_results_count / data.page_size) > data.page_number) {
            await fetchAllObjects(feedId, postId, page + 1)
        }
        setTotalPages(Math.ceil(data.total_results_count / PAGE_SIZE));
    }

    const loadObjects = async () => {
        if (!postId || !feedId) return
        setLoading(true);
        try {
            await fetchAllObjects(feedId, postId, 1)
        } catch (error) {
            console.error("Failed to fetch jobs:", error);
            // Handle error (e.g., show a notification)
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const getStixObject = () => {
        const reportId = objects.find(object => object.type === 'report')?.id
        setReportId(reportId || '')
        return {
            "type": "bundle",
            "id": `bundle--${reportId}`,
            "spec_version": "2.1",
            objects,
        }
    }

    const loadStixData = () => {
        if (loading) return
        if (objects.length === 0) return
        const graph = window.stixview.init(
            stixRef.current,
            null,
            () => {
                console.info("Graph loaded");
            },
            {}, // no additional data properties
            {
                hideFooter: false,
                showSidebar: true,
                maxZoom: 50,
                onClickNode: function (node) {
                    console.log('node clicked', node);
                }
            }
        );
        const data = getStixObject()
        graph.loadData(data);
        console.log('done')
    }

    useEffect(loadStixData, [loading])

    const getJobUrl = () => {
        const jobId = jobs.length > 0 ? jobs[0].id : null
        if (!jobId || !feedId) return ''
        return URLS.staffObstractJob(feedId, jobId)
    }

    useEffect(() => {
        const url = getJobUrl()
        setJobUrl(url)
    }, [jobs, feedId])

    const getObservationSearchUrl = (object: ObstractsObject) => {
        const value = object.value ?? object.name
        if (teamId) return URLS.teamObservablePosts(object.id, object.type, getScoValue(object))
        return URLS.staffObservablePosts(object.id, object.type, getScoValue(object))
    }

    useEffect(() => {
        document.title = `${post?.title} | Obstracts Web`
    }, [post])

    const downloadStixObject = async () => {
        const data = getStixObject()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const reportUUID = reportId.split('--')[1]
        link.download = `bundle--${reportUUID}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);

    };

    const checkForUpdate = async () => {
        if (!feedId || !postId) return
        await changePostProfileId(feedId, postId, feed?.profile_id || '')
        setShowReindexDialog(true)
    }

    const downloadMarkdown = async () => {
        if (!feedId || !postId) return
        const response = await fetchPostMarkdown(feedId, postId)
        const blob = new Blob([response.data], { type: "text/md" });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${reportId}.md`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    }

    return (
        <Box p={4}>
            <Box>
                <Box sx={{ display: 'flex' }}>
                    <Link to={feedUrl} style={{ textDecoration: 'none' }}>
                        <Typography variant="h5">{feed?.obstract_feed_metadata.title}</Typography>
                    </Link>
                    {!teamId && (
                        <>
                            <Button variant='contained' sx={{ marginLeft: '2rem' }} onClick={checkForUpdate}>Check for updates</Button>
                            <Button color='error' variant='contained' sx={{ marginLeft: '2rem' }} onClick={() => setShowDeleteDialog(true)}>Delete Post</Button>
                        </>
                    )}
                </Box>
                <Typography variant="h4" gutterBottom>
                    {post?.title}
                </Typography>
            </Box>
            <Table sx={{ marginTop: '1rem', marginBottom: '2rem' }}>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Feed Setting</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Value</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell>Post Date</TableCell>
                        <TableCell>{getDateString(post?.pubdate)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Post Author</TableCell>
                        <TableCell>{post?.author}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Post Label</TableCell>
                        <TableCell>{post?.categories?.join(', ')}</TableCell>
                    </TableRow>
                    {user?.metadata_is_staff && (<>
                        <TableRow>
                            <TableCell>Profile ID</TableCell>
                            <TableCell>{post?.profile_id || feed?.profile_id}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Is Full Text</TableCell>
                            <TableCell>{post?.is_full_text ? 'True' : 'False'}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Added Manually</TableCell>
                            <TableCell>{post?.added_manually ? 'True' : 'False'}</TableCell>
                        </TableRow>
                    </>)}
                </TableBody>
            </Table>
            <Box sx={{ display: 'flex', marginBottom: '1rem' }}>
                <Typography variant="h5"> Post Content</Typography>
                <Link to={post?.link} target='_blank'>
                    <Button variant='contained' sx={{ textTransform: 'uppercase', marginLeft: '1rem' }}>View on blog</Button>
                </Link>
            </Box>
            <div style={{ border: '1px solid #000000cc', padding: '3rem', borderRadius: '5px', maxWidth: '80vw' }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post?.description ?? '') }} />
            <div>
                <Box sx={{ display: 'flex', marginTop: '1rem', justifyContent: 'right' }}><Button onClick={downloadMarkdown} variant='contained'>Download Markdown</Button></Box>
                { }
            </div>
            {loading ? (
                <CircularProgress style={{ display: 'block', margin: '20px auto' }} />
            ) : (
                <>
                    <TableContainer sx={{ marginTop: '3rem' }}>
                        <Typography variant="h5">Extractions (TTPs)</Typography>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Type</TableCell>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Name</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {objects.filter(object => SDO_TYPES.has(object.type)).map((object, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{object.type}</TableCell>
                                        <TableCell>{object.id}</TableCell>
                                        <TableCell>{object.name ?? object.value}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TableContainer sx={{ marginTop: '3rem' }}>
                        <Typography variant="h5">Extractions (IOCs)</Typography>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Type</TableCell>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Name</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {objects.filter(object => SCO_TYPES.has(object.type)).map((object, index) => (
                                    <TableRow className="ioc-row" key={index}>
                                        <TableCell>{object.type}</TableCell>
                                        <TableCell>{object.id}</TableCell>
                                        <TableCell>{getScoValue(object)}</TableCell>
                                        <TableCell><Button color="primary" variant="contained" sx={{ textTransform: 'uppercase' }} onClick={() => { navigate(getObservationSearchUrl(object)) }}>View all posts</Button></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}

            <Box sx={{ marginTop: '5rem' }}>
                <Typography variant="h5">Extraction Graph</Typography>
                <div ref={stixRef}></div>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {(!teamId || activeTeam?.allowed_data_download) ? (
                        <Button onClick={downloadStixObject} variant='contained'>Download</Button>
                    ) : (<Tooltip title="Your team plan must be upgraded to allow data downloads to download the bundle">
                        <div>
                            <Button variant='contained' disabled={true}>Download</Button>
                        </div>
                    </Tooltip>)}
                </Box>
            </Box>

            <ReindexingDialog onClose={() => setShowReindexDialog(false)} open={showReindexDialog}></ReindexingDialog>
            {post && <DeleteDialog onClose={() => setShowDeleteDialog(false)} open={showDeleteDialog} post={post} feedId={feedId}></DeleteDialog>}
            <Dialog open={openJobModal} onClose={() => setOpenJobModal(false)}>
                <DialogTitle>{post?.title} Job</DialogTitle>
                <DialogContent>
                    {jobs?.length && <JobDetailsPage job={jobs[0]}></JobDetailsPage>}
                </DialogContent>
            </Dialog>
        </Box >
    );
};

export default PostDetailsPage;