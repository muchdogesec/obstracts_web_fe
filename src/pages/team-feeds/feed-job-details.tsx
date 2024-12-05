import React from 'react';
import { Box, Button, Container, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { Feed, IJob } from '../../services/obstract';
import { Link } from 'react-router-dom';
import { URLS } from '../../services/urls.ts';
import { getDateString } from '../../services/utils.ts';

interface JobDetailsPageProps {
    job?: IJob;
    teamId?: string;
    feedId: string;
    feed: Feed;
}

const JobDetailsComponent: React.FC<JobDetailsPageProps> = ({ job, feedId, teamId, feed }: JobDetailsPageProps) => {

    return <Container>
        <Link to={URLS.staffObstractFeed(feedId)} style={{textDecoration: 'none'}}><Typography variant='h5'>{feed?.obstract_feed_metadata['title']}</Typography></Link>
        <Typography variant='h4'>Job ID: {job?.id}</Typography>
        <Typography sx={{marginTop: '1rem'}}>All the Jobs run for this feed</Typography>
        <Table sx={{ marginTop: '1rem', marginBottom: '2rem' }}>
            <TableHead>
                <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Key</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Value</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow>
                    <TableCell>Created</TableCell>
                    <TableCell>{getDateString(job?.created)}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>State</TableCell>
                    <TableCell>{job?.state}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Run datetime</TableCell>
                    <TableCell>{job?.history4feed_job?.run_datetime}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Feed history state</TableCell>
                    <TableCell>{job?.history4feed_job?.state}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Earliest items requested</TableCell>
                    <TableCell>{getDateString(job?.history4feed_job?.earliest_item_requested)}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Latest items requested</TableCell>
                    <TableCell>{getDateString(job?.history4feed_job?.latest_item_requested)}</TableCell>
                </TableRow>
            </TableBody>
        </Table>

        <Box>

            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell><Typography sx={{ fontWeight: 'bold', fontStyle: 'underline' }}>Successful URLS</Typography></TableCell>
                    </TableRow>
                    {job?.history4feed_job?.urls.retrieved.map(url => <TableRow>
                        <TableCell>
                            <a href={url.url}>{url.url}</a>
                        </TableCell>
                        <TableCell>
                            <Link to={URLS.staffObstractPost(feedId, url.id)}>
                                <Button variant='contained'> View Post</Button></Link>
                        </TableCell>
                    </TableRow>)}
                    <TableRow>
                        <TableCell><Typography sx={{ fontWeight: 'bold', fontStyle: 'underline' }}>Failed URLS</Typography></TableCell>
                    </TableRow>
                    {job?.history4feed_job?.urls.failed.map(url => <TableRow>
                        <TableCell>
                            <a href={url.url}>{url.url}</a>
                        </TableCell>
                        <TableCell>
                        </TableCell>
                    </TableRow>)}
                    <TableRow>
                        <TableCell><Typography sx={{ fontWeight: 'bold', fontStyle: 'underline' }}>Skipped URLS</Typography></TableCell>
                    </TableRow>
                    {job?.history4feed_job?.urls.skipped.map(url => <TableRow>
                        <TableCell>
                            <a href={url.url}>{url.url}</a>
                        </TableCell>
                        <TableCell>
                        </TableCell>
                    </TableRow>)}
                </TableBody>
            </Table>
        </Box>
    </Container>
}

export default JobDetailsComponent