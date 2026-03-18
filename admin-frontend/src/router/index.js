import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/activities'
  },
  {
    path: '/activities',
    name: 'ActivityList',
    component: () => import('@/views/ActivityList.vue'),
    meta: { title: '活动管理' }
  },
  {
    path: '/activities/edit/:id?',
    name: 'ActivityEdit',
    component: () => import('@/views/ActivityEdit.vue'),
    meta: { title: '编辑活动' }
  },
  {
    path: '/switch-logs',
    name: 'SwitchLog',
    component: () => import('@/views/SwitchLog.vue'),
    meta: { title: '切换日志' }
  },
  {
    path: '/help-guide',
    name: 'HelpGuide',
    component: () => import('@/views/HelpGuide.vue'),
    meta: { title: '使用说明' }
  },
  {
    path: '/help-faq',
    name: 'HelpFAQ',
    component: () => import('@/views/HelpFAQ.vue'),
    meta: { title: '常见问题' }
  }
]

const router = createRouter({
  history: createWebHistory('/admin/'),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 活码管理系统` : '活码管理系统'
  next()
})

export default router
