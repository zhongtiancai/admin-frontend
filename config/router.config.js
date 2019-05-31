export default [
  // user
  {
    path: '/user',
    component: '../layouts/UserLayout',
    routes: [
      { path: '/user', redirect: '/user/login' },
      { path: '/user/login', component: './User/Login' },
      { path: '/user/register', component: './User/Register' },
      { path: '/user/register-result', component: './User/RegisterResult' },
    ],
  },
  // app
  {
    path: '/',
    component: '../layouts/BasicLayout',
    Routes: ['src/pages/Authorized'],
    routes: [
      // dashboard
      // list
      {
        path: '/admin',
        icon: 'table',
        name: 'admin',
        authority: ['admin'],
        routes: [
          {
            path: '/admin/adminlist',
            name: 'adminlist',
            component: './Admin/AdminList',
            authority: ['adminlist'],
          },
          {
            path: '/admin/rolelist',
            name: 'rolelist',
            authority: ['rolelist'],
            component: './Admin/RoleList',
          }
        ],
      },
      {
        component: '404',
      },
    ],
  },
];
