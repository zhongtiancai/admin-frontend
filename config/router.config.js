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
    authority: ['admin', 'user'],
    routes: [
      // dashboard
      // list
      {
        path: '/admin',
        icon: 'table',
        name: 'admin',
        routes: [
          {
            path: '/admin/list',
            name: 'adminlist',
            component: './Admin/AdminList',
          }
        ],
      },

      {
        component: '404',
      },
    ],
  },
];
