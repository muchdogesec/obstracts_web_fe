import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";

import { AlertProvider } from "./contexts/alert-context.tsx";
import { TeamProvider } from "./contexts/team-context.tsx";

import reportWebVitals from "./reportWebVitals";
import Homepage from "./pages/homepage";
import LoginRedirect from "./pages/login-redirect/index.tsx";
import Dashboard from "./pages/dashboard";
import Team from "./pages/team/index.tsx";
import LogoutRedirect from "./pages/logout-redirect/index.tsx";
import UserProfile from "./pages/profile/index.tsx";
import AuthGuard from "./guards/auth.guard.tsx";
import Logout from "./pages/dashboard/logout/index.jsx";
import ObstractProfile from "./pages/obstract/profile/index.tsx";
import FeedsPage from "./pages/obstract/feeds/index.tsx";
import PostPage from "./pages/obstract/posts/index.tsx";
import AcceptInvite from "./pages/accept-invite/index.tsx";
import UserManagement from "./pages/users/index.tsx";
import ObstractProfileDetail from "./pages/obstract/profile/profile_detail.tsx";
import TeamFeeds from "./pages/team-feeds/index.tsx";
import TeamFeedPage from "./pages/team-feeds/feed.tsx";
import JobListPage from "./pages/team-feeds/feed-jobs-modal.tsx";
import PostDetailsPage from "./pages/obstract/obstractions/index.tsx";
import AdminTeams from "./pages/admin-team/index.tsx";
import TeamLayout from "./pages/team-layout.tsx/index.tsx";
import JobDetailsPage from "./pages/team-feeds/job-detail-page.tsx";
import AddNewTeam from "./pages/teams/add-new-team.tsx";
import ObstractsProfileAdd from "./pages/obstract/profile/add-new-profile.tsx";
import AddNewFeed from "./pages/obstract/feeds/add-new-feed.tsx";
import AddNewPost from "./pages/obstract/posts/add-new-post.tsx";
import StaffLayout from "./pages/staff-layout.tsx/index.tsx";
import ObservableSearchPage from "./pages/obstract/obstractions/extraction-search.tsx";
import ObjectPostsPage from "./pages/obstract/obstractions/extraction-posts.tsx";
import AddSkeletonFeed from "./pages/obstract/feeds/add-skeleton-feed.tsx";

import "./index.css";
import LatestPostsPage from "./pages/obstract/latest-posts/index.tsx";

const AUTH0_DOMAIN = process.env.REACT_APP_AUTH0_DOMAIN
const AUTH0_CLIENT_ID = process.env.REACT_APP_AUTH0_CLIENT_ID

const router = createBrowserRouter([
  {
    path: "/",
    Component: Homepage,
  },
  {
    path: "/login-redirect",
    Component: LoginRedirect,
  },
  {
    path: "/logout",
    Component: Logout,
  },
  {
    path: "/logout-redirect",
    Component: LogoutRedirect,
  },
  {
    path: "/login",
    Component: LogoutRedirect,
  },
  {
    path: "/home",
    Component: Dashboard,
  },
  {
    path: "",
    element: <AuthGuard>
      <Dashboard></Dashboard>
    </AuthGuard>,
    children: [
      {
        path: "user/account",
        Component: UserProfile,
      },
      {
        path: "teams/add",
        Component: AddNewTeam,
      },
      {
        path: "",
        Component: TeamLayout,
        children: [
          {
            path: "teams/:teamId",
            Component: Team,
          },
          {
            path: "feeds",
            Component: TeamFeeds,
          },
          {
            path: "feeds/:feedId",
            Component: TeamFeedPage,
          },
          {
            path: "feeds/:feedId/jobs",
            Component: JobListPage,
          },
          {
            path: "feeds/:feedId/jobs/:jobId",
            Component: JobDetailsPage,
          },
          {
            path: "feeds/:feedId/posts/:postId",
            Component: PostDetailsPage,
          },
          {
            path: "intelligence/search",
            Component: ObservableSearchPage,
          },
          {
            path: "intelligence/:objectId",
            Component: ObjectPostsPage,
          },
          {
            path: "posts",
            Component: LatestPostsPage,
          },
        ],
      },
      {
        path: "staff",
        component: StaffLayout,
        children: [
          {
            path: "extraction-profiles/:id",
            Component: ObstractProfileDetail,
          },
          {
            path: "extraction-profiles",
            Component: ObstractProfile,
          },
          {
            path: "extraction-profiles/add",
            Component: ObstractsProfileAdd,
          },
          {
            path: "manage-feeds",
            Component: FeedsPage,
          },
          {
            path: "manage-feeds/add",
            Component: AddNewFeed,
          },
          {
            path: "feeds/:feed_id",
            Component: PostPage,
          },
          {
            path: "feeds/:feed_id/add-post",
            Component: AddNewPost,
          },
          {
            path: "feeds/:feedId/posts/:postId",
            Component: PostDetailsPage,
          },
          {
            path: "feeds/:feedId/jobs",
            Component: JobListPage,
          },
          {
            path: "feeds/:feedId/jobs/:jobId",
            Component: JobDetailsPage,
          },
          {
            path: "manage-users",
            Component: UserManagement,
          },
          {
            path: "manage-teams",
            Component: AdminTeams,
          },
          {
            path: "intelligence/search",
            Component: ObservableSearchPage,
          },
          {
            path: "intelligence/:objectId",
            Component: ObjectPostsPage,
          },
          {
            path: "posts",
            Component: LatestPostsPage,
          },
          {
            path: "feeds/add-skeleton-feed",
            Component: AddSkeletonFeed,
          },
        ]
      }
    ],
  },
  {
    path: "teams/invitation/:invite_id",
    Component: AcceptInvite,
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode>
  <Auth0Provider
    domain={AUTH0_DOMAIN}
    clientId={AUTH0_CLIENT_ID}
    authorizationParams={{
      redirect_uri: window.location.origin + "/login-redirect",
    }}
  >
    <AlertProvider>
      <TeamProvider>
        <RouterProvider router={router} />
      </TeamProvider>
    </AlertProvider>
  </Auth0Provider>
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
