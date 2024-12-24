import axios from "axios";
import { getApiKey } from "./storage.ts";
import { cleanData } from "./utils.ts";

const OBSTRACT_API_BASE_URL = process.env.REACT_APP_API_BASE_URL + '/obstracts_api';

export type Profile = {
    id: string;
    created: string;
    name: string;
    extractions: string[];
    whitelists: string[];
    aliases: string[];
    relationship_mode: string;
    extract_text_from_image: boolean;
    ai_settings_extractions: string[];
    ai_settings_relationships: string;
};

type ProfilesResponse = {
    page_size: number;
    page_number: number;
    page_results_count: number;
    total_results_count: number;
    profiles: Profile[];
};

export interface Feed {
    id: string;
    is_public: boolean;
    feed_id: string;
    profile_id: string;
    polling_schedule_minute: number;
    next_polling_time: string;
    is_subscribed?: boolean;
    obstract_feed_metadata: {
        id: string;
        count_of_posts: number;
        title: string;
        description: string;
        url: string;
        earliest_item_pubdate: string;
        latest_item_pubdate: string;
        datetime_added: string;
        feed_type: 'rss' | 'atom';
        include_remote_blogs: boolean;
        pretty_url: string;
    }
};
type PaginatedResponse<T> = {
    count: number;
    results: T[];
};

export interface TeamFeed extends Feed {
    is_subscribed: boolean
}
export interface Post {
    id: string;
    datetime_added: string;
    datetime_updated: string;
    title: string;
    description: string;
    link: string;
    pubdate: string;
    author: string;
    is_full_text: boolean;
    content_type: string;
    categories: string[];
    profile_id: string;
    feed_id: string;
    added_manually: boolean;
}

interface PostsResponse {
    page_size: number;
    page_number: number;
    page_results_count: number;
    total_results_count: number;
    posts: Post[];
}

export interface ObstractsObject {
    type: string,
    id: string,
    value: string,
    name: string,
    additionalProp: Object,
    x_mitre_domains: string[],
}

interface PostObjectsResponse {
    page_size: number;
    page_number: number;
    page_results_count: number;
    total_results_count: number;
    objects: ObstractsObject[];
}


const apiRequest = async <T>(
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
    path: string,
    data?: any,
    headers: Record<string, string> = {},
    params: Record<string, string | number | undefined> = {},
) => {
    try {
        const response = await axios<T>({
            method,
            url: `${OBSTRACT_API_BASE_URL}${path}`,
            data,
            headers: {
                Authorization: `Token ${getApiKey()}`,
                ...headers,
            },
            params,
        });
        return response;
    } catch (error) {
        if (error?.response?.status === 401) {
            window.location.href = '/logout-redirect'
        }
        throw error;
    }
};

export const fetchObstractProfiles = (page_number: number) => {
    return apiRequest<ProfilesResponse>('GET', `/proxy/profiles/?page=${page_number}`);
};

export const fetchObstractProfile = (id: string) => {
    return apiRequest<Profile>('GET', `/proxy/profiles/${id}/`);
};

export const deleteObstractProfile = (id: string) => {
    return apiRequest<ProfilesResponse>('DELETE', `/proxy/profiles/${id}/`);
};

export const fetchObstractFeed = (id: string) => {
    return apiRequest<Feed>('GET', `/feeds/${id}/`);
};

export const fetchObstractFeeds = (page_number: number, search: any, sortOrder: any, orderType: string, profileId?: string) => {
    return apiRequest<PaginatedResponse<Feed>>('GET', `/feeds/`, {}, {}, {
        title: search,
        order_by: (orderType === 'asc' ? '' : '-') + sortOrder,
        page: page_number,
        profile_id: profileId,
    });
};

export const updateObstractFeeds = (feed_id: string, is_public: boolean, polling_schedule_minute: number, profile_id: string) => {
    return apiRequest<PaginatedResponse<Feed>>('PATCH', `/feeds/${feed_id}/`, {
        polling_schedule_minute,
        is_public,
        profile_id,
    });
};

export const fetchTeamObstractFeeds = (team_id: string, page_number: number, filter: any, showMyFeed: boolean, sortOrder: any, orderType: string) => {
    return apiRequest<PaginatedResponse<TeamFeed>>('GET', `/team/${team_id}/feeds/`, {}, {}, {
        title: filter, show_only_my_feeds: String(showMyFeed), page_number,
        order_by: (orderType === 'asc' ? '' : '-') + sortOrder,
    });
};

export const fetchTeamObstractFeed = (team_id: string, feed_id: string) => {
    return apiRequest<TeamFeed>('GET', `/team/${team_id}/feeds/${feed_id}/`, {}, {}, {
    });
};

export const subscribeTeamObstractFeeds = (team_id: string, feed_id: string) => {
    return apiRequest<PaginatedResponse<TeamFeed>>('POST', `/team/${team_id}/feeds/subscribe/`, { feed_id });
};

export const unsubscribeTeamObstractFeeds = (team_id: string, feed_id: string) => {
    return apiRequest<PaginatedResponse<TeamFeed>>('POST', `/team/${team_id}/feeds/unsubscribe/`, { feed_id });
};

interface JobResponseBody {
    page_size: number;
    page_number: number;
    page_results_count: number;
    total_results_count: number;
    jobs: IJob[];
}

export interface IJob {
    id: string;
    feed_id: string;
    profile_id: string;
    created: string;
    state: string;
    history4feed_status: string;
    history4feed_job: History4FeedJob;
    item_count: number;
    processed_items: number;
    failed_processes: number;
}

interface History4FeedJob {
    id: string;
    info: string;
    urls: Urls;
    state: string;
    feed_id: string;
    profile_id: string;
    run_datetime: string;
    count_of_items: number;
    include_remote_blogs: boolean;
    latest_item_requested: string;
    earliest_item_requested: string;
}

interface Urls {
    failed: Url[];
    skipped: Url[];
    retrieved: RetrievedUrl[];
    retrieving: any[]; // Assuming no defined structure for retrieving
}

interface Url {
    id: string;
    url: string;
}

interface RetrievedUrl {
    id: string;
    url: string;
}

export const adminFetchFeedJob = (feedId: string, jobId: string) => {
    return apiRequest<IJob>('GET', `/proxy/feeds/${feedId}/jobs/${jobId}/`, {}, {}, {
    });
};

export const fetchFeedJob = (teamId: string, feedId: string, jobId: string) => {
    return apiRequest<IJob>('GET', `/proxy/feeds/${feedId}/jobs/${jobId}/`, {}, {}, {
    });
};

export const adminFetchFeedJobs = (feed_id: string, page: number) => {
    return apiRequest<JobResponseBody>('GET', `/proxy/jobs/`, {}, {}, {
        feed_id,
    });
};

export const fetchFeedJobs = (team_id: string, feed_id: string, page: number) => {
    return apiRequest<JobResponseBody>('GET', `/proxy/jobs/`, {}, {}, {
        feed_id,
    });
};

export const fetchPostJobs = (team_id: string, feed_id: string, post_id: string,) => {
    return apiRequest<JobResponseBody>('GET', `/proxy/jobs/`, {}, {}, {
        feed_id,
        post_id,
    });
};

export const adminFetchPostJobs = (feed_id: string, post_id: string,) => {
    return apiRequest<JobResponseBody>('GET', `/proxy/jobs/`, {}, {}, {
        feed_id,
        post_id,
    });
};

export const fetchObstractPosts = (feed_id: string, page: number, sort: string, title: string) => {
    return apiRequest<PostsResponse>('GET', `/proxy/open/feeds/${feed_id}/posts/?page=${page + 1}&page_size=10&sort=${sort}&title=${title}`);
};

export const scoSearch = (types: string, value: string, page: number) => {
    return apiRequest<PostsResponse>('GET', `/proxy/open/objects/scos/`, {}, {}, { types, value, page });
};

export const fetchObstractPost = (feed_id: string, post_id: string) => {
    return apiRequest<Post>('GET', `/proxy/open/feeds/${feed_id}/posts/${post_id}/`);
};

export const createObstractFeed = (data: {
    profile_id: string,
    url: string,
    include_remote_blogs: boolean
    is_public: boolean,
    polling_schedule_minute: number,
    title: string,
    description: string,
    pretty_url: string,
}) => {
    return apiRequest<PostsResponse>('POST', `/feeds/`, cleanData(data));
};

export const createObstractSkeletonFeed = (data: {
    url: string,
    title: string,
    description: string,
    pretty_url: string,
}) => {
    return apiRequest<PostsResponse>('POST', `/feeds/skeleton/`, cleanData(data));
};


export const deleteObstractFeed = (feed_id: string) => {
    return apiRequest<PostsResponse>('DELETE', `/feeds/${feed_id}/`);
};

export const deleteObstractPost = (feed_id: string, post_id: string) => {
    return apiRequest<PostsResponse>('DELETE', `/proxy/feeds/${feed_id}/posts/${post_id}/`);
};

export const reloadObstractFeed = (feed_id: string, data: {
    profile_id: string,
    url: string,
    include_remote_blogs: boolean
}) => {
    return apiRequest<PostsResponse>('PATCH', `/feeds/${feed_id}/`, data);
};

export const createNewPost = (feed_id: string, data: {
    title: string,
    link: string,
    pubdate: Date,
    author: string,
    categories: string[],
    profile_id: string,
}) => {
    return apiRequest<PostsResponse>('POST', `/proxy/feeds/${feed_id}/posts/`, data);
};

export const fetchPostMarkdown = (feed_id: string, post_id: string) => {
    return apiRequest<PostsResponse>('GET', `/proxy/open/feeds/${feed_id}/posts/${post_id}/markdown/`);
};

export const fetchPostObjects = async (feed_id: string, post_id: string, page: number): Promise<PostObjectsResponse> => {
    const res = await apiRequest<PostObjectsResponse>('GET', `/proxy/feeds/${feed_id}/posts/${post_id}/objects/`, {}, {}, { page });
    return res.data
};

export const fetchTeamPostObjects = async (team_id: string, feed_id: string, post_id: string, page: number): Promise<PostObjectsResponse> => {
    const res = await apiRequest<PostObjectsResponse>('GET', `/proxy/teams/${team_id}/feeds/${feed_id}/posts/${post_id}/objects/`, {}, {}, { page });
    return res.data
};

export const changePostProfileId = (feed_id: string, post_id: string, profile_id: string) => {
    return apiRequest<PostsResponse>('PATCH', `/proxy/feeds/${feed_id}/posts/${post_id}/`, { profile_id });
};

export const loadAliases = (page: number) => {
    return apiRequest<any>('GET', `/proxy/aliases/?page_size=100`, { page }).then(res => res.data.aliases);
};

export const loadExtractors = (page: number) => {
    return apiRequest<any>(
        'GET',
        `/proxy/extractors/`,
        {}, {},
        { page, page_size: 50 }
    ).then(res => res.data.extractors);
};

export const loadAllExtractions = async () => {
    let hasNext = true
    let page = 1
    let alliases = []
    while (hasNext) {
        const res = await loadExtractors(page)
        alliases = [...alliases, ...res]
        page += 1
        hasNext = res.length > 0
    }
    return alliases
};

export const loadWhitelists = () => {
    return apiRequest<any>('GET', `/proxy/whitelists/?page_size=100`).then(res => res.data.whitelists);
};

export const editProfile = async (id: string, data: any) => {
    return apiRequest<any>('PATCH', `/proxy/profiles/${id}/`, data);
};

export const createProfile = async (data: any) => {
    return apiRequest<any>('POST', '/proxy/profiles/', data);
};

export const fetchObjectReports = (object_id: string) => {
    return apiRequest<any>('GET', `/proxy/object/${object_id}/reports/`);
}

export const getPostsByExtraction = (team_id: string | undefined, object_id: string, page: number) => {
    if (team_id) {
        return apiRequest<any>('GET', `/teams/${team_id}/objects/${object_id}/`, {}, {}, { page })
    }
    return apiRequest<any>('GET', `/objects/${object_id}/`, {}, {}, { page })
}

export const getLatestPosts = (team_id: string | undefined, sort: string, title: string, page: number) => {
    const query = {
        page, title, sort,
    }
    if (team_id) {
        return apiRequest<any>('GET', `/teams/${team_id}/posts/`, {}, {}, query)
    }
    return apiRequest<any>('GET', `/posts/`, {}, {}, query)
}
