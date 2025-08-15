import { createRouter, createWebHistory } from 'vue-router'
import MonitoringView from '/src/views/MonitoringView.vue'
import TaskManagementView from '/src/views/TaskManagementView.vue'
import SystemConfigView from '/src/views/SystemConfigView.vue'

const routes = [
    { path: '/', redirect: '/monitoring' },
    { path: '/monitoring', name: 'monitoring', component: MonitoringView },
    { path: '/tasks', name: 'tasks', component: TaskManagementView },
    { path: '/config', name: 'config', component: SystemConfigView }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router