import { createStore } from 'vuex'
import { getTasks, getTaskStats, startTask as apiStartTask, stopTask as apiStopTask } from '../services/api.js'

export default createStore({
    state: {
        tasks: [],
        logs: [],
        currentTask: null,  // 当前选中的任务
        currentTaskStats: {}, // 当前任务的统计信息
        // 新增：所有任务的统计信息缓存
        allTasksStats: {},
        config: {
            taskId: "",
            taskName: "",
            sourceType: "",
            sourceFieldName: '',
            targetFieldName: '',
            sourceConfig: {
                url: "",
                username: "",
                password: ""
            },
            destinationType: "",
            destinationConfig: {
                clusterNodes: "",
                bootstrapServers: "",
                disableSslVerification: false,
                url: '',
                username: '',
                password: ''
            },
            syncConfig: {
                batchSize: 5000,
                minShards: 1,
                maxShards: 10,
                coordinatorType: "redis",
                coordinatorConfig: {
                    host: "",
                    port: 6379
                }
            },
            fields: [{}]
        }
    },
    mutations: {
        setTasks(state, tasks) {
            state.tasks = tasks
        },
        setCurrentTask(state, task) {
            state.currentTask = task
        },
        setCurrentTaskStats(state, stats) {
            state.currentTaskStats = stats
        },
        // 新增：设置特定任务的统计信息
        setTaskStats(state, { taskId, stats }) {
            state.allTasksStats[taskId] = {
                ...(state.allTasksStats[taskId] || {}),
                ...stats
            }
        },
        updateConfig(state, config) {
            state.config = config
        },
        updateTaskStatus(state, { taskId, status }) {
            const task = state.tasks.find(t => t.taskId === taskId)
            if (task) {
                task.status = status
            }
            // 同时更新统计信息中的状态
            if (state.allTasksStats[taskId]) {
                state.allTasksStats[taskId].status = status
            }
        },
        addLog(state, log) {
            state.logs.unshift(log)
            if (state.logs.length > 50) {
                state.logs.pop()
            }
        },
        resetConfig(state) {
            state.config = {
                taskId: '',
                taskName: '',
                sourceType: '',
                destinationType: '',
                sourceFieldName: '',
                targetFieldName: '',
                sourceConfig: {
                    url: '',
                    username: '',
                    password: ''
                },
                destinationConfig: {
                    clusterNodes: '',
                    bootstrapServers: "",
                    disableSslVerification: false,
                    url: '',
                    username: '',
                    password: ''
                },
                syncConfig: {
                    batchSize: 100,
                    minShards: 1,
                    maxShards: 5,
                    coordinatorType: '',
                    coordinatorConfig: {
                        host: '',
                        port: 0
                    }
                },
                fields: []
            };
        }
    },
    actions: {
        async fetchTasks({ commit }) {
            try {
                const response = await getTasks()
                commit('setTasks', response.data || [])
            } catch (error) {
                console.error('获取任务列表失败:', error)
                commit('addLog', {
                    time: new Date().toLocaleTimeString(),
                    message: `获取任务列表失败: ${error.message}`
                })
            }
        },

        async fetchTaskStats({ commit }, taskId) {
            try {
                const response = await getTaskStats(taskId)
                commit('setTaskStats', {
                    taskId,
                    stats: response.data || {}
                })
                return response.data
            } catch (error) {
                console.error(`获取任务 ${taskId} 统计信息失败:`, error)
                commit('addLog', {
                    time: new Date().toLocaleTimeString(),
                    message: `获取任务 ${taskId} 统计信息失败: ${error.message}`
                })
                return null
            }
        },

        async startTask({ commit, dispatch }, task) {
            try {
                const response = await apiStartTask(task)
                commit('updateTaskStatus', {
                    taskId: task.taskId,
                    status: 'RUNNING'
                })
                commit('addLog', {
                    time: new Date().toLocaleTimeString(),
                    message: `任务 ${task.taskName} 启动成功`
                })
                // 启动后获取最新统计信息
                await dispatch('fetchTaskStats', task.taskId)
                return response
            } catch (error) {
                commit('addLog', {
                    time: new Date().toLocaleTimeString(),
                    message: `任务启动失败: ${error.message}`
                })
                throw error
            }
        },

        async stopTask({ commit, dispatch }, taskId) {
            try {
                const response = await apiStopTask(taskId)
                commit('updateTaskStatus', {
                    taskId,
                    status: 'STOPPED'
                })
                commit('addLog', {
                    time: new Date().toLocaleTimeString(),
                    message: `任务 ${taskId} 已停止`
                })
                // 停止后获取最新统计信息
                await dispatch('fetchTaskStats', taskId)
                return response
            } catch (error) {
                commit('addLog', {
                    time: new Date().toLocaleTimeString(),
                    message: `任务停止失败: ${error.message}`
                })
                throw error
            }
        },

        async saveConfig({ commit, state }) {
            try {
                // 这里需要实现您的saveConfig API调用
                // await saveConfig(state.config)
                commit('addLog', {
                    time: new Date().toLocaleTimeString(),
                    message: '配置保存成功'
                })
                return true
            } catch (error) {
                commit('addLog', {
                    time: new Date().toLocaleTimeString(),
                    message: `配置保存失败: ${error.message}`
                })
                return false
            }
        }
    },
    getters: {
        getTaskStatsById: (state) => (taskId) => {
            return state.allTasksStats[taskId] || {
                status: 'STOPPED',
                totalRecords: 0,
                processedRecords: 0,
                scannedRecords: 0,
                failedShards: 0,
                shardCount: 0,
                completedShards: 0,
                skippedShards: 0,
                failedBatches: []
            }
        }
    }
})